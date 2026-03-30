"""
Generate synthetic fallback CSVs for common NSE tickers.
Used when live Yahoo/Kaggle data is unavailable.
"""

import argparse
import os
from datetime import datetime

import numpy as np
import pandas as pd

TICKER_CONFIG = {
    "RELIANCE": {"base": 2550, "drift": 0.00045, "vol": 0.016, "vol_mult": 1.0},
    "TCS": {"base": 3850, "drift": 0.00040, "vol": 0.014, "vol_mult": 0.9},
    "INFY": {"base": 1620, "drift": 0.00042, "vol": 0.017, "vol_mult": 1.1},
    "HDFCBANK": {"base": 1580, "drift": 0.00035, "vol": 0.013, "vol_mult": 0.95},
    "ICICIBANK": {"base": 1120, "drift": 0.00038, "vol": 0.015, "vol_mult": 1.0},
    "WIPRO": {"base": 520, "drift": 0.00030, "vol": 0.018, "vol_mult": 1.15},
    "SBIN": {"base": 780, "drift": 0.00036, "vol": 0.020, "vol_mult": 1.2},
    "BAJFINANCE": {"base": 7050, "drift": 0.00047, "vol": 0.019, "vol_mult": 1.05},
    "MARUTI": {"base": 12100, "drift": 0.00033, "vol": 0.012, "vol_mult": 0.85},
    "TITAN": {"base": 3480, "drift": 0.00041, "vol": 0.017, "vol_mult": 1.0},
}


def _generate_ticker_df(ticker: str, cfg: dict, n_days: int, seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    dates = pd.date_range(end=datetime.now(), periods=n_days, freq="B")

    daily_returns = rng.normal(cfg["drift"], cfg["vol"], n_days)
    close_prices = cfg["base"] * np.exp(np.cumsum(daily_returns))

    open_noise = rng.normal(0, cfg["base"] * 0.0025 * cfg["vol_mult"], n_days)
    open_prices = close_prices + open_noise
    high_spread = rng.uniform(0.001, 0.018, n_days) * close_prices
    low_spread = rng.uniform(0.001, 0.018, n_days) * close_prices
    high_prices = np.maximum(open_prices, close_prices) + high_spread
    low_prices = np.minimum(open_prices, close_prices) - low_spread

    base_volume = rng.uniform(8e6, 35e6)
    volume_noise = rng.lognormal(mean=0.0, sigma=0.25, size=n_days)
    volumes = np.maximum(base_volume * cfg["vol_mult"] * volume_noise, 1e6)

    close_series = pd.Series(close_prices, index=dates)
    prev_close = close_series.shift(1).bfill().values
    vwap = (open_prices + high_prices + low_prices + close_prices) / 4
    turnover = volumes * close_prices
    trades = (volumes / rng.uniform(70, 200, n_days)).clip(25000, 600000)
    deliverable_ratio = rng.uniform(0.35, 0.68, n_days)
    deliverable_volume = volumes * deliverable_ratio

    df = pd.DataFrame({
        "Date": dates,
        "Symbol": ticker,
        "Series": "EQ",
        "Prev Close": prev_close,
        "Open": open_prices,
        "High": high_prices,
        "Low": low_prices,
        "Close": close_prices,
        "VWAP": vwap,
        "Volume": volumes,
        "Turnover": turnover,
        "Trades": trades,
        "Deliverable Volume": deliverable_volume,
        "%Deliverble": deliverable_ratio * 100,
    })

    # Keep values in a realistic market format.
    float_cols = [
        "Prev Close", "Open", "High", "Low", "Close", "VWAP",
        "Turnover", "Deliverable Volume", "%Deliverble"
    ]
    df[float_cols] = df[float_cols].round(2)
    df["Volume"] = df["Volume"].round().astype("int64")
    df["Trades"] = df["Trades"].round().astype("int64")
    return df


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=1200, help="Business days per ticker")
    parser.add_argument("--seed", type=int, default=42, help="Base random seed")
    parser.add_argument(
        "--output-dir",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "data"),
        help="Directory to write ticker CSV files",
    )
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    created_files = []
    for idx, (ticker, cfg) in enumerate(TICKER_CONFIG.items()):
        df = _generate_ticker_df(
            ticker=ticker,
            cfg=cfg,
            n_days=args.days,
            seed=args.seed + (idx * 17),
        )
        csv_path = os.path.join(args.output_dir, f"{ticker}.csv")
        df.to_csv(csv_path, index=False)
        created_files.append((ticker, csv_path, len(df), df["Date"].min(), df["Date"].max()))

    print("\n✅ Fallback CSV generation complete")
    for ticker, csv_path, rows, start_dt, end_dt in created_files:
        print(f" - {ticker}: {csv_path} | rows={rows} | {start_dt.date()} -> {end_dt.date()}")

    print("\nUsage for model training:")
    print("  cd price_prediction")
    print("  python train.py --data_dir ../data --pred_days 30 --epochs 30")


if __name__ == "__main__":
    main()
