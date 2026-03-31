import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.prediction import router as prediction_router

try:
    from routes.sentiment import router as sentiment_router
    SENTIMENT_ENABLED = True
except Exception as exc:
    SENTIMENT_ENABLED = False
    SENTIMENT_IMPORT_ERROR = str(exc)

app = FastAPI(
    title="GamzStockz ML API",
    description="Stock price prediction and sentiment analysis for NSE stocks",
    version="1.0.0"
)

# Comma-separated list, e.g. "https://yourapp.vercel.app,https://yourapp.netlify.app"
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

# Allow requests from deployed frontend(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router, prefix="/predict", tags=["Price Prediction"])
if SENTIMENT_ENABLED:
    app.include_router(sentiment_router, prefix="/sentiment", tags=["Sentiment Analysis"])

@app.get("/")
def root():
    return {"status": "GamzStockz ML API is running ✅", "version": "1.0.0"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "sentiment_enabled": SENTIMENT_ENABLED,
        "sentiment_error": None if SENTIMENT_ENABLED else SENTIMENT_IMPORT_ERROR,
    }
