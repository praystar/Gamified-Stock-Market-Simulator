/**
 * mlApi.js
 * --------
 * Service layer connecting the React frontend to the FastAPI ML backend.
 *
 * HOW TO USE:
 * 1. After deploying to Render, replace ML_API_BASE_URL with your Render URL.
 * 2. For local dev, set VITE_ML_API_URL in your frontend/.env.local file.
 *
 * frontend/.env.local (for local dev):
 *   VITE_ML_API_URL=http://localhost:8000
 *
 * frontend/.env.production (for Netlify/Vercel deploy):
 *   VITE_ML_API_URL=https://gamzstockz-ml-api.onrender.com
 */

const ML_API_BASE_URL =
  import.meta.env.VITE_ML_API_URL || "https://gamzstockz-ml-api.onrender.com";

// ── Helpers ────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(`${ML_API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "ML API error");
  }

  return res.json();
}

// ── Price Prediction ───────────────────────────────────────────────────────

/**
 * Get predicted closing prices for an NSE stock.
 *
 * @param {string} ticker   - NSE symbol e.g. "RELIANCE", "TCS"
 * @param {number} days     - Number of future days (1–30), default 7
 * @returns {Promise<{
 *   ticker: string,
 *   predictions: Array<{date: string, price: number}>,
 *   last_known_price: number,
 *   change_percent: number,
 *   model: string
 * }>}
 */
export async function getPricePrediction(ticker, days = 7) {
  return apiFetch("/predict/", {
    method: "POST",
    body: JSON.stringify({ ticker, days }),
  });
}

/**
 * Get the list of supported NSE tickers.
 * @returns {Promise<{tickers: string[]}>}
 */
export async function getSupportedStocks() {
  return apiFetch("/predict/supported-stocks");
}

// ── Sentiment Analysis ─────────────────────────────────────────────────────

/**
 * Get sentiment analysis (bullish/bearish/neutral) for a stock.
 *
 * @param {string} ticker       - e.g. "RELIANCE"
 * @param {string} companyName  - e.g. "Reliance Industries"
 * @returns {Promise<{
 *   ticker: string,
 *   label: "positive"|"negative"|"neutral",
 *   score: number,
 *   signal: "BULLISH"|"BEARISH"|"NEUTRAL",
 *   headlines_analyzed: number,
 *   top_headlines: Array<{headline: string, label: string, score: number}>
 * }>}
 */
export async function getStockSentiment(ticker, companyName) {
  return apiFetch("/sentiment/", {
    method: "POST",
    body: JSON.stringify({ ticker, company_name: companyName }),
  });
}

/**
 * Quick GET endpoint for sentiment (no POST body needed).
 * @param {string} ticker
 */
export async function getQuickSentiment(ticker) {
  return apiFetch(`/sentiment/demo/${ticker.toUpperCase()}`);
}

// ── Health Check ───────────────────────────────────────────────────────────

export async function checkApiHealth() {
  try {
    const data = await apiFetch("/health");
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}

// ── Company Name Map ───────────────────────────────────────────────────────
// Used to pass company_name automatically when you only have a ticker

export const COMPANY_NAMES = {
  RELIANCE:     "Reliance Industries",
  TCS:          "Tata Consultancy Services",
  INFY:         "Infosys",
  HDFCBANK:     "HDFC Bank",
  ICICIBANK:    "ICICI Bank",
  WIPRO:        "Wipro",
  SBIN:         "State Bank of India",
  BAJFINANCE:   "Bajaj Finance",
  HINDUNILVR:   "Hindustan Unilever",
  KOTAKBANK:    "Kotak Mahindra Bank",
  AXISBANK:     "Axis Bank",
  LT:           "Larsen and Toubro",
  ASIANPAINT:   "Asian Paints",
  MARUTI:       "Maruti Suzuki",
  TITAN:        "Titan Company",
  SUNPHARMA:    "Sun Pharmaceutical",
  ONGC:         "Oil and Natural Gas Corporation",
  POWERGRID:    "Power Grid Corporation",
  NTPC:         "NTPC Limited",
  TECHM:        "Tech Mahindra",
};
