"""
TRAINING SCRIPT
===============
Run this ONCE locally (or on Colab) to train and save the LSTM model.
The saved .keras file is then used by the FastAPI server for inference.

Usage:
    python train.py --ticker RELIANCE.NS
    python train.py --ticker TCS.NS --epochs 100
    python train.py --csv ../data/nifty50_data.csv --ticker RELIANCE

For Kaggle dataset training (all tickers at once):
    python train.py --csv ../data/nifty50_data.csv --all

Dataset to download (see README):
    Kaggle: "NIFTY-50 Stock Market Data" by rohanrao
    URL: https://www.kaggle.com/datasets/rohanrao/nifty50-stock-market-data
    Place the CSV files inside: ML_services/data/
"""

import argparse
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from model import build_lstm_model, get_callbacks
from preprocess import (
    fetch_data, load_local_csv, add_features,
    fit_scaler, create_sequences, SEQUENCE_LENGTH
)

MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "saved_model", "lstm_model.keras")
PRED_DAYS = 30  # default model horizon supports 7/14/custom-day predictions

DEFAULT_FALLBACK_TICKERS = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
    "WIPRO", "SBIN", "BAJFINANCE", "MARUTI", "TITAN"
]


def _load_features_from_ticker_csvs(data_dir: str, tickers: list[str]) -> list[pd.DataFrame]:
    feature_dfs = []
    for ticker in tickers:
        csv_path = os.path.abspath(os.path.join(data_dir, f"{ticker}.csv"))
        if not os.path.exists(csv_path):
            print(f"⚠️  Missing CSV for {ticker}: {csv_path}")
            continue

        raw_df = load_local_csv(csv_path)
        df_features = add_features(raw_df)
        if len(df_features) <= SEQUENCE_LENGTH:
            print(f"⚠️  Not enough rows for {ticker} after feature engineering, skipping")
            continue

        feature_dfs.append(df_features)
        print(f"✅ Loaded {ticker}: {df_features.shape}")

    if not feature_dfs:
        raise ValueError("No valid ticker CSVs found for training.")
    return feature_dfs


def train(
    ticker: str = None,
    csv_path: str = None,
    data_dir: str = None,
    tickers: list[str] = None,
    pred_days: int = PRED_DAYS,
    epochs: int = 80,
    batch_size: int = 32,
):
    print(f"\n{'='*50}")
    if data_dir:
        train_target = f"Fallback CSV basket ({', '.join(tickers or DEFAULT_FALLBACK_TICKERS)})"
    else:
        train_target = ticker or "Kaggle CSV"
    print(f"  Training LSTM for: {train_target}")
    print(f"{'='*50}\n")
    print(f"📅 Model prediction horizon: {pred_days} days")

    # ── Load Data ──────────────────────────────────────────────────────────────
    if data_dir:
        if tickers is None or len(tickers) == 0:
            tickers = DEFAULT_FALLBACK_TICKERS

        print(f"📂 Loading ticker CSVs from: {os.path.abspath(data_dir)}")
        feature_dfs = _load_features_from_ticker_csvs(data_dir, [t.upper() for t in tickers])

        # Fit one scaler across all configured tickers to improve cross-stock inference.
        scaler_fit_df = pd.concat(feature_dfs, axis=0)
        _, scaler = fit_scaler(scaler_fit_df)

        X_parts, y_parts = [], []
        for idx, df_part in enumerate(feature_dfs, start=1):
            scaled_part = scaler.transform(df_part.values)
            X_part, y_part = create_sequences(
                scaled_part,
                seq_len=SEQUENCE_LENGTH,
                pred_days=pred_days,
            )
            if len(X_part) == 0:
                continue
            X_parts.append(X_part)
            y_parts.append(y_part)
            print(f"   • Ticker {idx}: X={X_part.shape} | y={y_part.shape}")

        if not X_parts:
            raise ValueError("Training data is empty after sequence generation.")

        X = np.concatenate(X_parts, axis=0)
        y = np.concatenate(y_parts, axis=0)
        print(f"✅ Combined feature blocks: {len(feature_dfs)}")
        print(f"✅ Combined X shape: {X.shape}  |  y shape: {y.shape}")

    elif csv_path:
        print(f"📂 Loading from local CSV: {csv_path}")
        raw_df = load_local_csv(csv_path, ticker_col="Symbol", ticker=ticker)
        df_features = add_features(raw_df)
        print(f"✅ Data shape after feature engineering: {df_features.shape}")

        # ── Scale & Sequence ───────────────────────────────────────────────────
        scaled, _ = fit_scaler(df_features)
        X, y = create_sequences(scaled, seq_len=SEQUENCE_LENGTH, pred_days=pred_days)
        print(f"✅ X shape: {X.shape}  |  y shape: {y.shape}")
    else:
        print(f"🌐 Downloading from Yahoo Finance: {ticker}")
        raw_df = fetch_data(ticker, period="10y")
        df_features = add_features(raw_df)
        print(f"✅ Data shape after feature engineering: {df_features.shape}")

        # ── Scale & Sequence ───────────────────────────────────────────────────
        scaled, _ = fit_scaler(df_features)
        X, y = create_sequences(scaled, seq_len=SEQUENCE_LENGTH, pred_days=pred_days)
        print(f"✅ X shape: {X.shape}  |  y shape: {y.shape}")

    # ── Train/Val Split ────────────────────────────────────────────────────────
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.15, shuffle=False  # keep time order!
    )

    # ── Build & Train ──────────────────────────────────────────────────────────
    model = build_lstm_model(
        input_shape=(SEQUENCE_LENGTH, X.shape[2]),
        output_days=pred_days
    )
    model.summary()

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=get_callbacks(),
        verbose=1
    )

    # ── Save Model ─────────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    model.save(MODEL_SAVE_PATH)
    print(f"\n✅ Model saved to: {MODEL_SAVE_PATH}")

    # ── Quick Eval ─────────────────────────────────────────────────────────────
    val_loss = min(history.history["val_loss"])
    print(f"📊 Best val_loss: {val_loss:.6f}")
    print("\n🎯 Training complete! You can now run the FastAPI server.\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", type=str, default="RELIANCE.NS", help="NSE ticker with .NS suffix")
    parser.add_argument("--csv", type=str, default=None, help="Path to local CSV dataset")
    parser.add_argument("--data_dir", type=str, default=None, help="Directory containing fallback CSV files")
    parser.add_argument("--tickers", nargs="*", default=None, help="Tickers for --data_dir mode")
    parser.add_argument("--pred_days", type=int, default=PRED_DAYS, help="Prediction horizon used during training")
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--batch_size", type=int, default=32)
    args = parser.parse_args()

    if args.pred_days < 1:
        raise ValueError("pred_days must be >= 1")

    train(
        ticker=args.ticker,
        csv_path=args.csv,
        data_dir=args.data_dir,
        tickers=args.tickers,
        pred_days=args.pred_days,
        epochs=args.epochs,
        batch_size=args.batch_size
    )
