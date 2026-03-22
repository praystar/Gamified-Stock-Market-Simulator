"""
Sentiment Analysis using FinBERT.
HuggingFace model: ProsusAI/finbert
- Pretrained on financial news (Reuters, WSJ, Bloomberg)
- Labels: positive / negative / neutral
- Much better than VADER for financial text
"""

from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_NAME = "ProsusAI/finbert"

# Cache the pipeline in memory
_sentiment_pipeline = None


def get_pipeline():
    """Load FinBERT once and cache it."""
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
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
        output = pipe(headline[:512])[0]  # truncate to BERT max length
        # output is list of [{"label": "positive", "score": x}, ...]
        best = max(output, key=lambda x: x["score"])
        results.append({
            "headline": headline,
            "label": best["label"].lower(),
            "score": round(best["score"], 4)
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
