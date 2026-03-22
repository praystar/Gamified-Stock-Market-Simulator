"""
Inference module for price prediction.
Called by FastAPI route at runtime — fetches live data from yfinance,
runs the trained LSTM, and returns predicted prices for the next N days.
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from tensorflow.keras.models import load_model

from preprocess import (
    fetch_data, add_features, load_scaler,
    prepare_inference_input, SEQUENCE_LENGTH, FEATURES
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_model", "lstm_model.keras")

# Cache model in memory so we don't reload on every request
_model = None

def _get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. "
                "Please run: python price_prediction/train.py first."
            )
        _model = load_model(MODEL_PATH)
    return _model


def get_prediction(ticker_nse: str, pred_days: int = 7) -> dict:
    """
    Fetch live NSE data, run LSTM, return predicted prices.
    
    Args:
        ticker_nse: e.g. "RELIANCE.NS"
        pred_days:  number of future business days to predict
    
    Returns:
        {
            "predictions": [{"date": "...", "price": ...}, ...],
            "last_known_price": float,
            "change_percent": float
        }
    """
    # 1. Fetch last ~2 years so we have 60+ rows after indicators drop NaN
    raw_df = fetch_data(ticker_nse, period="2y")
    df_features = add_features(raw_df)

    # 2. Grab last known price (Close of today / last trading day)
    last_known_price = float(raw_df["Close"].iloc[-1])

    # 3. Prepare model input
    X_input = prepare_inference_input(df_features)   # shape (1, 60, 6)

    # 4. Run model — outputs (1, pred_days) normalised values
    model = _get_model()
    scaler = load_scaler()

    raw_pred = model.predict(X_input, verbose=0)  # shape (1, pred_days)

    # 5. Inverse-transform: rebuild a full-feature dummy array so scaler works
    n_features = len(FEATURES)
    dummy = np.zeros((pred_days, n_features))
    dummy[:, 0] = raw_pred[0]  # Close is column 0
    inv = scaler.inverse_transform(dummy)
    predicted_closes = inv[:, 0].tolist()

    # 6. Generate future business dates
    last_date = raw_df.index[-1]
    future_dates = []
    d = last_date
    while len(future_dates) < pred_days:
        d += timedelta(days=1)
        if d.weekday() < 5:  # Mon–Fri only
            future_dates.append(d.strftime("%Y-%m-%d"))

    predictions = [
        {"date": date, "price": round(price, 2)}
        for date, price in zip(future_dates, predicted_closes)
    ]

    # 7. Compute expected % change
    change_percent = round(
        ((predicted_closes[-1] - last_known_price) / last_known_price) * 100, 2
    )

    return {
        "predictions": predictions,
        "last_known_price": round(last_known_price, 2),
        "change_percent": change_percent
    }
