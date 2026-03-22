/**
 * MLDashboard.jsx
 * ---------------
 * Full-page ML insights dashboard.
 * Add this as a route in App.jsx:
 *   import MLDashboard from './pages/MLDashboard';
 *   <Route path="/ml-insights" element={<MLDashboard />} />
 *
 * Then link to it from your Navbar:
 *   <Link to="/ml-insights">AI Insights</Link>
 */

import { useState } from "react";
import StockPrediction from "../components/StockPrediction";
import { COMPANY_NAMES } from "../services/mlApi";

const POPULAR_STOCKS = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK",
  "ICICIBANK", "WIPRO", "SBIN", "BAJFINANCE",
  "MARUTI", "TITAN"
];

export default function MLDashboard() {
  const [selectedTicker, setSelectedTicker] = useState("RELIANCE");
  const [customTicker, setCustomTicker]     = useState("");

  function handleCustomSearch(e) {
    e.preventDefault();
    if (customTicker.trim()) {
      setSelectedTicker(customTicker.trim().toUpperCase());
      setCustomTicker("");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🤖</span>
            <h1 className="text-3xl font-bold text-gray-900">AI Market Insights</h1>
          </div>
          <p className="text-gray-500">
            Powered by LSTM price prediction &amp; FinBERT sentiment analysis on NSE stocks.
          </p>
        </div>

        {/* ── Stock Selector ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Select a Stock</h2>

          {/* Popular tickers */}
          <div className="flex flex-wrap gap-2 mb-4">
            {POPULAR_STOCKS.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTicker(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTicker === t
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Custom ticker search */}
          <form onSubmit={handleCustomSearch} className="flex gap-2">
            <input
              type="text"
              value={customTicker}
              onChange={e => setCustomTicker(e.target.value.toUpperCase())}
              placeholder="Type any NSE ticker e.g. ZOMATO"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Analyze
            </button>
          </form>
        </div>

        {/* ── Prediction + Sentiment Card ── */}
        <StockPrediction
          ticker={selectedTicker}
          companyName={COMPANY_NAMES[selectedTicker]}
        />

        {/* ── Info Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold text-gray-800 mb-1">LSTM Price Model</h3>
            <p className="text-sm text-gray-500">
              Trained on 5+ years of NSE OHLCV data with RSI, MACD, and Bollinger Band features.
              Uses a 60-day sliding window to predict the next 1–30 days.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-800 mb-1">FinBERT Sentiment</h3>
            <p className="text-sm text-gray-500">
              Uses ProsusAI/FinBERT — a BERT model fine-tuned on financial news — to classify
              the latest headlines as Bullish, Bearish, or Neutral.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Data sourced from NSE via Yahoo Finance. Predictions are for simulation purposes only.
        </p>
      </div>
    </div>
  );
}
