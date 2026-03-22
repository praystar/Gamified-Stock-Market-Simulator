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
PRED_DAYS = 7   # predict next 7 days


def train(ticker: str = None, csv_path: str = None, epochs: int = 80, batch_size: int = 32):
    print(f"\n{'='*50}")
    print(f"  Training LSTM for: {ticker or 'Kaggle CSV'}")
    print(f"{'='*50}\n")

    # ── Load Data ──────────────────────────────────────────────────────────────
    if csv_path:
        print(f"📂 Loading from local CSV: {csv_path}")
        raw_df = load_local_csv(csv_path, ticker_col="Symbol", ticker=ticker)
    else:
        print(f"🌐 Downloading from Yahoo Finance: {ticker}")
        raw_df = fetch_data(ticker, period="10y")

    df_features = add_features(raw_df)
    print(f"✅ Data shape after feature engineering: {df_features.shape}")

    # ── Scale & Sequence ───────────────────────────────────────────────────────
    scaled, scaler = fit_scaler(df_features)
    X, y = create_sequences(scaled, seq_len=SEQUENCE_LENGTH, pred_days=PRED_DAYS)
    print(f"✅ X shape: {X.shape}  |  y shape: {y.shape}")

    # ── Train/Val Split ────────────────────────────────────────────────────────
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.15, shuffle=False  # keep time order!
    )

    # ── Build & Train ──────────────────────────────────────────────────────────
    model = build_lstm_model(
        input_shape=(SEQUENCE_LENGTH, X.shape[2]),
        output_days=PRED_DAYS
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
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--batch_size", type=int, default=32)
    args = parser.parse_args()

    train(
        ticker=args.ticker,
        csv_path=args.csv,
        epochs=args.epochs,
        batch_size=args.batch_size
    )
