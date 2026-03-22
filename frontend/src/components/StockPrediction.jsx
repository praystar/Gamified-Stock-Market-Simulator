/**
 * StockPrediction.jsx
 * -------------------
 * Drop this anywhere in your app — e.g. inside your Stocks page or Dashboard.
 * It calls the ML API and renders a prediction chart + sentiment badge.
 *
 * Usage:
 *   import StockPrediction from '../components/StockPrediction';
 *   <StockPrediction ticker="RELIANCE" companyName="Reliance Industries" />
 */

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  getPricePrediction,
  getStockSentiment,
  checkApiHealth,
  COMPANY_NAMES,
} from "../services/mlApi";

// ── Sentiment Badge ────────────────────────────────────────────────────────

function SentimentBadge({ signal, score, label }) {
  const config = {
    BULLISH:  { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300",  icon: "↑" },
    BEARISH:  { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300",    icon: "↓" },
    NEUTRAL:  { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", icon: "→" },
  };
  const c = config[signal] || config.NEUTRAL;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${c.bg} ${c.text} ${c.border}`}>
      <span className="text-lg">{c.icon}</span>
      <span>{signal}</span>
      <span className="opacity-70">({Math.round(score * 100)}% confidence)</span>
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-sm font-semibold">
            {entry.name}: ₹{entry.value?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function StockPrediction({ ticker = "RELIANCE", companyName = null }) {
  const company = companyName || COMPANY_NAMES[ticker] || ticker;

  const [predData,      setPredData]      = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [loadingPred,   setLoadingPred]   = useState(false);
  const [loadingSent,   setLoadingSent]   = useState(false);
  const [error,         setError]         = useState(null);
  const [apiOnline,     setApiOnline]     = useState(null);
  const [days,          setDays]          = useState(7);

  // Check API health on mount
  useEffect(() => {
    checkApiHealth().then(r => setApiOnline(r.online));
  }, []);

  // Fetch prediction + sentiment whenever ticker or days changes
  useEffect(() => {
    if (!ticker) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, days]);

  async function fetchAll() {
    setError(null);
    fetchPrediction();
    fetchSentiment();
  }

  async function fetchPrediction() {
    setLoadingPred(true);
    try {
      const data = await getPricePrediction(ticker, days);
      setPredData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingPred(false);
    }
  }

  async function fetchSentiment() {
    setLoadingSent(true);
    try {
      const data = await getStockSentiment(ticker, company);
      setSentimentData(data);
    } catch (e) {
      console.error("Sentiment error:", e.message);
    } finally {
      setLoadingSent(false);
    }
  }

  // Build chart data: predictions only (you can prepend historical data too)
  const chartData = predData?.predictions?.map(p => ({
    date: p.date.slice(5),   // show MM-DD
    "Predicted Price": p.price,
  })) || [];

  const changePositive = predData?.change_percent >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{company}</h2>
          <p className="text-sm text-gray-500">NSE: {ticker}</p>
        </div>

        {/* API status indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${apiOnline === true ? "bg-green-500" : apiOnline === false ? "bg-red-500" : "bg-gray-300"}`} />
          <span className="text-gray-500">{apiOnline === true ? "ML API Online" : apiOnline === false ? "ML API Offline" : "Checking API…"}</span>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-gray-600 font-medium">Predict next:</span>
        {[3, 7, 14, 30].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              days === d
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d}d
          </button>
        ))}
        <button
          onClick={fetchAll}
          className="ml-auto text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* ── Price Summary ── */}
      {predData && !loadingPred && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Last Price</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{predData.last_known_price.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Predicted ({days}d)</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{predData.predictions?.at(-1)?.price.toLocaleString("en-IN")}
            </p>
          </div>
          <div className={`rounded-xl p-4 ${changePositive ? "bg-green-50" : "bg-red-50"}`}>
            <p className="text-xs text-gray-500 mb-1">Expected Change</p>
            <p className={`text-lg font-bold ${changePositive ? "text-green-600" : "text-red-600"}`}>
              {changePositive ? "+" : ""}{predData.change_percent}%
            </p>
          </div>
        </div>
      )}

      {/* ── Prediction Chart ── */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Prediction Chart</h3>
        {loadingPred ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11 }}
                tickFormatter={v => `₹${v.toLocaleString("en-IN")}`}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="Predicted Price"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#6366f1" }}
                activeDot={{ r: 6 }}
                strokeDasharray="6 3"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No prediction data yet. Click Refresh.
          </div>
        )}
      </div>

      {/* ── Sentiment Section ── */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Market Sentiment (FinBERT AI)</h3>
        {loadingSent ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
            Analyzing news headlines…
          </div>
        ) : sentimentData ? (
          <div>
            <SentimentBadge
              signal={sentimentData.signal}
              score={sentimentData.score}
              label={sentimentData.label}
            />
            <p className="text-xs text-gray-400 mt-2 mb-3">
              Based on {sentimentData.headlines_analyzed} recent news headlines
            </p>
            <div className="space-y-2">
              {sentimentData.top_headlines?.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                  <span className={`mt-0.5 shrink-0 font-bold ${
                    h.label === "positive" ? "text-green-600" :
                    h.label === "negative" ? "text-red-600" : "text-yellow-600"
                  }`}>
                    {h.label === "positive" ? "+" : h.label === "negative" ? "−" : "~"}
                  </span>
                  <span>{h.headline}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sentiment data unavailable.</p>
        )}
      </div>

      {/* ── Footer ── */}
      <p className="text-xs text-gray-400 mt-4">
        ⚠️ AI predictions are for educational/simulation purposes only. Not financial advice.
      </p>
    </div>
  );
}
