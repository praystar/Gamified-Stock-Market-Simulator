"""
Preprocessing for NSE stock data.
- Downloads data via yfinance (falls back to local CSV if offline)
- Adds technical indicators: RSI, MACD, Bollinger Bands
- Normalises with MinMaxScaler
- Creates sliding window sequences for LSTM input
"""

import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

SEQUENCE_LENGTH = 60   # days of history per training sample
FEATURES = ["Close", "Volume", "RSI", "MACD", "BB_upper", "BB_lower"]
SCALER_PATH = os.path.join(os.path.dirname(__file__), "saved_model", "scaler.pkl")


# ── Technical Indicators ──────────────────────────────────────────────────────

def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = -delta.clip(upper=0).rolling(period).mean()
    rs = gain / (loss + 1e-9)
    return 100 - (100 / (1 + rs))


def compute_macd(series: pd.Series, fast=12, slow=26, signal=9) -> pd.Series:
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    return macd_line  # returning MACD line only


def compute_bollinger(series: pd.Series, window=20):
    sma = series.rolling(window).mean()
    std = series.rolling(window).std()
    return sma + 2 * std, sma - 2 * std  # upper, lower


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["RSI"]      = compute_rsi(df["Close"])
    df["MACD"]     = compute_macd(df["Close"])
    df["BB_upper"], df["BB_lower"] = compute_bollinger(df["Close"])
    df.dropna(inplace=True)
    return df[FEATURES]


# ── Data Fetching ─────────────────────────────────────────────────────────────

def fetch_data(ticker: str, period: str = "5y") -> pd.DataFrame:
    """
    Fetch OHLCV data from Yahoo Finance.
    ticker: NSE ticker with .NS suffix, e.g. "RELIANCE.NS"
    """
    df = yf.download(ticker, period=period, progress=False, auto_adjust=True)
    if df.empty:
        raise ValueError(f"No data returned for ticker {ticker}. Check the symbol.")
    df.index = pd.to_datetime(df.index)
    return df


def load_local_csv(csv_path: str, ticker_col: str = None, ticker: str = None) -> pd.DataFrame:
    """
    Load from a local Kaggle-downloaded CSV.
    Expects columns: Date, Open, High, Low, Close, Volume
    If the CSV has multiple tickers, filter by ticker_col.
    """
    df = pd.read_csv(csv_path, parse_dates=["Date"], index_col="Date")
    if ticker_col and ticker:
        df = df[df[ticker_col] == ticker]
    df.sort_index(inplace=True)
    return df


# ── Scaling & Sequences ───────────────────────────────────────────────────────

def fit_scaler(df: pd.DataFrame) -> tuple[np.ndarray, MinMaxScaler]:
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(df.values)
    os.makedirs(os.path.dirname(SCALER_PATH), exist_ok=True)
    joblib.dump(scaler, SCALER_PATH)
    return scaled, scaler


def load_scaler() -> MinMaxScaler:
    return joblib.load(SCALER_PATH)


def create_sequences(data: np.ndarray, seq_len: int = SEQUENCE_LENGTH, pred_days: int = 1):
    """
    Sliding window sequences.
    X shape: (n_samples, seq_len, n_features)
    y shape: (n_samples, pred_days)  — Close price index = 0
    """
    X, y = [], []
    for i in range(seq_len, len(data) - pred_days + 1):
        X.append(data[i - seq_len: i])
        y.append(data[i: i + pred_days, 0])  # index 0 = Close
    return np.array(X), np.array(y)


def prepare_inference_input(df_features: pd.DataFrame) -> np.ndarray:
    """
    Takes the last SEQUENCE_LENGTH rows, scales them, and returns
    a (1, 60, n_features) array ready for model.predict().
    """
    scaler = load_scaler()
    scaled = scaler.transform(df_features.values)
    last_seq = scaled[-SEQUENCE_LENGTH:]  # shape (60, n_features)
    return last_seq.reshape(1, SEQUENCE_LENGTH, len(FEATURES))
