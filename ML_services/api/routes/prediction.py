from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "../../"))
from price_prediction.predict import get_prediction

router = APIRouter()

class PredictRequest(BaseModel):
    ticker: str          # e.g. "RELIANCE", "TCS", "INFY"
    days: int = 7        # number of days to predict ahead (1–30)

class PredictResponse(BaseModel):
    ticker: str
    predictions: list    # list of {"date": "...", "price": ...}
    last_known_price: float
    change_percent: float
    model: str = "LSTM"

@router.post("/", response_model=PredictResponse)
def predict_price(req: PredictRequest):
    if req.days < 1 or req.days > 30:
        raise HTTPException(status_code=400, detail="days must be between 1 and 30")

    ticker_nse = req.ticker.upper() + ".NS"  # Append NSE suffix for yfinance

    try:
        result = get_prediction(ticker_nse, req.days)
        return PredictResponse(
            ticker=req.ticker.upper(),
            predictions=result["predictions"],
            last_known_price=result["last_known_price"],
            change_percent=result["change_percent"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/supported-stocks")
def supported_stocks():
    """Returns a list of recommended NSE tickers that work well with the model."""
    return {
        "tickers": [
            "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
            "WIPRO", "SBIN", "BAJFINANCE", "HINDUNILVR", "KOTAKBANK",
            "AXISBANK", "LT", "ASIANPAINT", "MARUTI", "TITAN",
            "SUNPHARMA", "ONGC", "POWERGRID", "NTPC", "TECHM"
        ]
    }
