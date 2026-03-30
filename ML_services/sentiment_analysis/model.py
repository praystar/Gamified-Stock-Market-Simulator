"""
Sentiment analysis with a resilient FinBERT pipeline.

Primary path:
- ProsusAI/finbert via transformers

Fallback path:
- Lightweight keyword heuristic when FinBERT/dependencies are unavailable
  (keeps API responsive instead of failing with 500).
"""

import re

MODEL_NAME = "ProsusAI/finbert"

# Cache the pipeline in memory
_sentiment_pipeline = None
_pipeline_backend = "unknown"

POSITIVE_WORDS = {
    "gain", "gains", "growth", "surge", "rally", "beat", "beats", "strong",
    "up", "profit", "profits", "expansion", "rise", "rises", "record", "bullish",
    "outperform", "upgrade", "adds", "add", "invest", "investment", "wins",
    "win", "deal", "deals", "contract", "contracts", "guidance", "healthy",
    "resilient", "improves", "improve", "boost", "boosts", "higher", "recovery",
    "stable", "stability", "expands", "expand", "better", "expected"
}

NEGATIVE_WORDS = {
    "loss", "losses", "drop", "falls", "fall", "decline", "declines", "miss",
    "misses", "weak", "down", "cut", "cuts", "bearish", "downgrade", "risk",
    "lawsuit", "penalty", "slump", "headwind", "headwinds", "pressure", "pressures",
    "concern", "concerns", "volatile", "volatility", "lower", "cautious", "moderation"
}


def _keyword_headline_sentiment(headline: str) -> dict:
    tokens = re.findall(r"[a-zA-Z]+", headline.lower())
    pos_hits = sum(1 for token in tokens if token in POSITIVE_WORDS)
    neg_hits = sum(1 for token in tokens if token in NEGATIVE_WORDS)

    if pos_hits > neg_hits:
        label = "positive"
        score = 0.55 + min(0.4, (pos_hits - neg_hits) * 0.08)
    elif neg_hits > pos_hits:
        label = "negative"
        score = 0.55 + min(0.4, (neg_hits - pos_hits) * 0.08)
    else:
        label = "neutral"
        score = 0.5

    return {"label": label, "score": round(min(score, 0.95), 4)}


def get_pipeline():
    """Load FinBERT once and cache it, else fallback to keyword mode."""
    global _sentiment_pipeline, _pipeline_backend
    if _sentiment_pipeline is None:
        try:
            from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
            import torch

            print("Loading FinBERT... (first load takes ~30s)")
            tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
            model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
            device = 0 if torch.cuda.is_available() else -1
            _sentiment_pipeline = pipeline(
                "text-classification",
                model=model,
                tokenizer=tokenizer,
                device=device,
                return_all_scores=True
            )
            _pipeline_backend = "finbert"
        except Exception as exc:
            print(f"FinBERT unavailable, switching to heuristic sentiment: {exc}")
            _pipeline_backend = "keyword"
            _sentiment_pipeline = "keyword-fallback"
    return _sentiment_pipeline


def analyze_headlines(headlines: list[str]) -> list[dict]:
    """
    Analyze a list of news headlines.
    Returns: [{"headline": "...", "label": "positive", "score": 0.92}, ...]
    """
    pipe = get_pipeline()
    results = []

    for headline in headlines:
        if not headline.strip():
            continue

        if _pipeline_backend == "finbert":
            output = pipe(headline[:512])[0]  # truncate to BERT max length
            # output is list of [{"label": "positive", "score": x}, ...]
            best = max(output, key=lambda x: x["score"])
            label = best["label"].lower()
            score = best["score"]
        else:
            heuristic = _keyword_headline_sentiment(headline)
            label = heuristic["label"]
            score = heuristic["score"]

        results.append({
            "headline": headline,
            "label": label,
            "score": round(score, 4)
        })

    return results


def aggregate_sentiment(analyzed: list[dict]) -> tuple[str, float]:
    """
    Aggregate multiple headlines into one overall sentiment.
    Returns: (label, confidence_score)
    """
    if not analyzed:
        return "neutral", 0.5

    score_map = {"positive": 1, "neutral": 0, "negative": -1}
    total = sum(score_map.get(r["label"], 0) * r["score"] for r in analyzed)
    avg = total / len(analyzed)

    if avg > 0.15:
        label = "positive"
    elif avg < -0.15:
        label = "negative"
    else:
        label = "neutral"

    confidence = abs(avg)
    return label, round(min(confidence, 1.0), 4)
