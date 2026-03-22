"""
Generate synthetic test data for training the LSTM model locally.
Simulates realistic NIFTY-50 stock data with trends and volatility.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Create 1000 days of synthetic data
np.random.seed(42)
n_days = 1000
dates = pd.date_range(end=datetime.now(), periods=n_days, freq='D')

# Realistic price movement (Reliance-like)
base_price = 1200
returns = np.random.normal(0.0005, 0.02, n_days)  # ~0.1% drift, 2% volatility
prices = base_price * np.exp(np.cumsum(returns))

# Create OHLCV data
open_prices = prices + np.random.uniform(-10, 10, n_days)
high_prices = np.maximum(prices, open_prices) + np.random.uniform(0, 20, n_days)
low_prices = np.minimum(prices, open_prices) - np.random.uniform(0, 20, n_days)
close_prices = prices
volumes = np.random.uniform(10e6, 50e6, n_days)  # 10M to 50M shares

close_series = pd.Series(close_prices, index=dates)

df = pd.DataFrame({
    'Date': dates,
    'Symbol': 'RELIANCE',
    'Series': 'EQ',
    'Prev Close': close_series.shift(1).values,
    'Open': open_prices,
    'High': high_prices,
    'Low': low_prices,
    'Close': close_prices,
    'VWAP': (high_prices + low_prices) / 2,  # Simplified
    'Volume': volumes,
    'Turnover': volumes * close_prices,
    'Trades': np.random.uniform(50000, 200000, n_days),
    'Deliverable Volume': volumes * np.random.uniform(0.3, 0.6, n_days),
    '%Deliverble': np.random.uniform(30, 60, n_days),
})

df = df.dropna()
csv_path = '/home/prayash/Music/Gamified-Stock-Market-Simulator/ML_services/data/RELIANCE.csv'
df.to_csv(csv_path, index=False)
print(f"✅ Test data created: {csv_path}")
print(f"   Rows: {len(df)}, Date range: {df['Date'].min()} to {df['Date'].max()}")
print(f"\nUsage for training:")
print(f"   cd price_prediction")
print(f"   python train.py --csv ../data/RELIANCE.csv --ticker RELIANCE --epochs 5")
