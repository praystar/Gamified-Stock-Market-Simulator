from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "../../"))
from sentiment_analysis.predict import get_sentiment

router = APIRouter()

class SentimentRequest(BaseModel):
    ticker: str          # e.g. "RELIANCE"
    company_name: str    # e.g. "Reliance Industries" — used for better news search

class SentimentResponse(BaseModel):
    ticker: str
    label: str           # "positive" | "negative" | "neutral"
    score: float         # confidence 0.0 to 1.0
    signal: str          # "BULLISH" | "BEARISH" | "NEUTRAL"
    headlines_analyzed: int
    top_headlines: list  # list of {"headline": "...", "label": "...", "score": ...}

@router.post("/", response_model=SentimentResponse)
def analyze_sentiment(req: SentimentRequest):
    try:
        result = get_sentiment(req.ticker.upper(), req.company_name)
        return SentimentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demo/{ticker}")
def demo_sentiment(ticker: str):
    """Quick GET endpoint to test sentiment without POST body."""
    company_map = {
        "RELIANCE": "Reliance Industries",
        "TCS": "Tata Consultancy Services",
        "INFY": "Infosys",
        "HDFCBANK": "HDFC Bank",
        "ICICIBANK": "ICICI Bank",
        "WIPRO": "Wipro",
        "SBIN": "State Bank of India",
    }
    company_name = company_map.get(ticker.upper(), ticker)
    try:
        result = get_sentiment(ticker.upper(), company_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
