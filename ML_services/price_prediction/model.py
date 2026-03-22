"""
LSTM model for NSE stock price prediction.
Architecture: Stacked LSTM → Dropout → Dense
Input:  60-day window of [Close, Volume, RSI, MACD, BollingerBand_upper, BollingerBand_lower]
Output: Next N days of predicted closing prices
"""

import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau


def build_lstm_model(input_shape: tuple, output_days: int = 1) -> Sequential:
    """
    Build and compile the LSTM model.
    
    Args:
        input_shape: (sequence_length, n_features) e.g. (60, 6)
        output_days: number of future days to predict
    
    Returns:
        Compiled Keras model
    """
    model = Sequential([
        Input(shape=input_shape),
        LSTM(128, return_sequences=True),
        Dropout(0.2),
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(64, activation="relu"),
        Dense(output_days)  # predict N days ahead
    ])

    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss="mean_squared_error",
        metrics=["mae"]
    )

    return model


def get_callbacks():
    """Training callbacks: early stopping + LR reduction."""
    return [
        EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=5, min_lr=1e-6)
    ]
