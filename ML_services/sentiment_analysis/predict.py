"""
Full sentiment pipeline:
1. Fetch latest news headlines for a stock from NewsAPI (free tier)
2. Run FinBERT on each headline
3. Aggregate and return structured result

Setup:
    Get a free API key at https://newsapi.org (500 req/day free)
    Set env var: NEWS_API_KEY=your_key_here
    Or create a .env file in ML_services/api/ with NEWS_API_KEY=...
"""

import os
import requests
from dotenv import load_dotenv
from model import analyze_headlines, aggregate_sentiment

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
NEWS_API_URL = "https://newsapi.org/v2/everything"

# Fallback headlines if NewsAPI is not configured (for demo/testing)
DEMO_HEADLINES = {
    "RELIANCE": [
        "Reliance Industries reports strong Q3 results beating analyst estimates",
        "Reliance Jio adds 10 million subscribers in a single quarter",
        "Reliance to invest 75000 crore in green energy by 2030",
    ],
    "TCS": [
        "TCS wins $2 billion deal with European banking giant",
        "TCS reports healthy margin expansion in Q3",
        "Tata Consultancy Services faces headwinds in BFSI segment",
    ],
    "DEFAULT": [
        "Indian markets remain cautious amid global cues",
        "FIIs continue buying in Indian equities",
        "RBI holds repo rate steady in latest policy meet",
    ]
}


def fetch_headlines(ticker: str, company_name: str, max_results: int = 10) -> list[str]:
    """
    Fetch latest financial news headlines for a company.
    Falls back to demo headlines if NewsAPI key is not set.
    """
    if not NEWS_API_KEY:
        print("⚠️  NEWS_API_KEY not set — using demo headlines.")
        return DEMO_HEADLINES.get(ticker, DEMO_HEADLINES["DEFAULT"])

    params = {
        "q": f"{company_name} OR {ticker} NSE stock",
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": max_results,
        "apiKey": NEWS_API_KEY,
    }

    try:
        resp = requests.get(NEWS_API_URL, params=params, timeout=10)
        resp.raise_for_status()
        articles = resp.json().get("articles", [])
        headlines = [
            a["title"] for a in articles
            if a.get("title") and "[Removed]" not in a["title"]
        ]
        return headlines[:max_results] if headlines else DEMO_HEADLINES.get(ticker, DEMO_HEADLINES["DEFAULT"])
    except Exception as e:
        print(f"NewsAPI error: {e} — using demo headlines.")
        return DEMO_HEADLINES.get(ticker, DEMO_HEADLINES["DEFAULT"])


def get_sentiment(ticker: str, company_name: str) -> dict:
    """
    Full pipeline: fetch news → FinBERT → aggregate.
    Called by FastAPI route.
    """
    headlines = fetch_headlines(ticker, company_name, max_results=10)
    analyzed = analyze_headlines(headlines)
    overall_label, overall_score = aggregate_sentiment(analyzed)

    signal_map = {
        "positive": "BULLISH",
        "negative": "BEARISH",
        "neutral":  "NEUTRAL"
    }

    return {
        "ticker": ticker,
        "label": overall_label,
        "score": overall_score,
        "signal": signal_map[overall_label],
        "headlines_analyzed": len(analyzed),
        "top_headlines": analyzed[:5]  # return top 5 for display
    }
