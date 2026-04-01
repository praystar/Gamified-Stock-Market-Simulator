import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from '../components/ui/card';
import { getStockSentiment, getQuickSentiment, COMPANY_NAMES } from "../services/mlApi";

// Format currency in Indian Rupees
const formatRupees = (value) => {
  return value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR'
  });
};

// Generate random stock data
const generateStockData = (start, count) => {
  const companies = [
    { name: "Tata Consultancy Services", symbol: "TCS", icon: "💻" },
    { name: "Reliance Industries", symbol: "RELIANCE", icon: "🏭" },
    { name: "HDFC Bank", symbol: "HDFCBANK", icon: "🏦" },
    { name: "Infosys Ltd", symbol: "INFY", icon: "🖥️" },
    { name: "Wipro", symbol: "WIPRO", icon: "🧩" },
    { name: "State Bank of India", symbol: "SBIN", icon: "💰" },
    { name: "Axis Bank", symbol: "AXISBANK", icon: "🏢" },
    { name: "Hindustan Unilever", symbol: "HINDUNILVR", icon: "🧴" },
    { name: "ICICI Bank", symbol: "ICICIBANK", icon: "💳" },
    { name: "Kotak Mahindra Bank", symbol: "KOTAKBANK", icon: "🏛️" }
  ];

  return Array.from({ length: count }, (_, i) => {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const price = (Math.random() * 5000 + 500).toFixed(2);
    const change = (Math.random() * 10 - 5).toFixed(1);
    const marketCap = Math.random() > 0.5 ? 
      `${(Math.random() * 20 + 5).toFixed(2)} Lakh Cr` : 
      `${(Math.random() * 90 + 10).toFixed(0)} Thousand Cr`;

    return {
      id: start + i,
      name: company.name,
      symbol: company.symbol,
      price: `₹${price}`,
      change: `${change}%`,
      marketCap,
      icon: company.icon,
    };
  });
};

const Stocks = () => {
  const [stocks, setStocks] = useState(() => generateStockData(1, 20));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentError, setSentimentError] = useState("");
  const [sentimentTicker, setSentimentTicker] = useState("RELIANCE");
  const [selectedSentimentTicker, setSelectedSentimentTicker] = useState("RELIANCE");
  const [sentimentUpdatedAt, setSentimentUpdatedAt] = useState("");
  const observer = useRef();
  const lastStockElementRef = useRef();

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMoreStocks();
      }
    }, options);

    if (lastStockElementRef.current) {
      observer.current.observe(lastStockElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [stocks, loading, hasMore]);

  const loadMoreStocks = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const newStocks = generateStockData(stocks.length + 1, 10);
      setStocks((prev) => [...prev, ...newStocks]);
      setLoading(false);
      // Stop loading more after reaching 100 stocks
      if (stocks.length >= 90) {
        setHasMore(false);
      }
    }, 1000);
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sentimentTickerOptions = Array.from(
    new Set(stocks.map((stock) => stock.symbol.toUpperCase()))
  ).sort();

  const getCompanyNameForTicker = (ticker) => {
    const normalizedTicker = ticker.toUpperCase();
    const stockMatch = stocks.find(
      (stock) => stock.symbol.toUpperCase() === normalizedTicker
    );

    return COMPANY_NAMES[normalizedTicker] || stockMatch?.name || normalizedTicker;
  };

  const getSentimentTarget = (tickerOverride) => {
    if (tickerOverride) {
      return {
        ticker: tickerOverride.toUpperCase(),
        companyName: getCompanyNameForTicker(tickerOverride),
      };
    }

    if (selectedSentimentTicker) {
      return {
        ticker: selectedSentimentTicker.toUpperCase(),
        companyName: getCompanyNameForTicker(selectedSentimentTicker),
      };
    }

    if (filteredStocks.length > 0) {
      const topMatch = filteredStocks[0];
      return {
        ticker: topMatch.symbol.toUpperCase(),
        companyName: getCompanyNameForTicker(topMatch.symbol),
      };
    }

    return {
      ticker: "RELIANCE",
      companyName: COMPANY_NAMES.RELIANCE,
    };
  };

  const handleGetSentiment = async (tickerOverride) => {
    setSentimentLoading(true);
    setSentimentError("");

    try {
      const target = getSentimentTarget(tickerOverride);
      let result;

      try {
        result = await getStockSentiment(target.ticker, target.companyName);
      } catch {
        // Seamless fallback to quick endpoint if full pipeline fails.
        result = await getQuickSentiment(target.ticker);
      }

      setSentimentData(result);
      setSentimentTicker(target.ticker);
      setSelectedSentimentTicker(target.ticker);
      setSentimentUpdatedAt(new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }));
    } catch (error) {
      setSentimentError(error.message || "Failed to fetch sentiment.");
    } finally {
      setSentimentLoading(false);
    }
  };

  useEffect(() => {
    const initialTarget = filteredStocks[0]?.symbol?.toUpperCase() || "RELIANCE";
    setSelectedSentimentTicker(initialTarget);
    handleGetSentiment(initialTarget);
    // Run once on first page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sentimentDirection =
    sentimentData?.label === "positive"
      ? "Up"
      : sentimentData?.label === "negative"
      ? "Down"
      : "Neutral";

  const sentimentIsUp = sentimentDirection === "Up";
  const sentimentIsDown = sentimentDirection === "Down";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Stock Market</h1>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Market Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">NIFTY 50</span>
                <span className="text-green-600 font-medium">+1.2%</span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SENSEX</span>
                <span className="text-red-600 font-medium">-0.8%</span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Trading Volume</h3>
          <div className="text-3xl font-bold text-indigo-600 mb-2">₹2,400 Cr</div>
          <p className="text-sm text-gray-500">Traded value today</p>
        </Card>

        <Card className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Market Sentiment</h3>
          <div className="flex items-center space-x-2 min-h-8">
            {!sentimentData && !sentimentLoading && !sentimentError && (
              <>
                <div className="text-2xl">📊</div>
                <div className="text-sm font-medium text-gray-600">Run model to get live sentiment</div>
              </>
            )}

            {sentimentLoading && (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                <div className="text-sm font-medium text-gray-600">Analyzing recent financial headlines...</div>
              </>
            )}

            {sentimentData && !sentimentLoading && (
              <>
                <div className="text-2xl">{sentimentIsUp ? "📈" : sentimentIsDown ? "📉" : "➖"}</div>
                <div className={`text-lg font-medium ${
                  sentimentIsUp ? "text-green-600" : sentimentIsDown ? "text-red-600" : "text-yellow-600"
                }`}>
                  {sentimentDirection} Sentiment
                </div>
              </>
            )}
          </div>

          {sentimentData && !sentimentLoading && (
            <p className="text-sm text-gray-500 mt-2">
              {sentimentTicker}: {sentimentData.signal} ({Math.round((sentimentData.score || 0) * 100)}% confidence)
              {sentimentUpdatedAt ? ` • Updated ${sentimentUpdatedAt}` : ""}
            </p>
          )}

          {sentimentError && !sentimentLoading && (
            <p className="text-sm text-red-600 mt-2">{sentimentError}</p>
          )}

          <label className="block text-xs text-gray-500 mt-3 mb-1">Choose stock for sentiment</label>
          <select
            value={selectedSentimentTicker}
            onChange={(e) => setSelectedSentimentTicker(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sentimentTickerOptions.map((ticker) => (
              <option key={ticker} value={ticker}>
                {ticker}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleGetSentiment(selectedSentimentTicker)}
            disabled={sentimentLoading}
            className="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sentimentLoading ? "Running sentiment model..." : "Get Sentiment Analysis"}
          </button>

          <p className="text-xs text-gray-400 mt-2">
            Auto-runs once on page load. You can choose a stock and rerun anytime.
          </p>
        </Card>
      </div>

      {/* Stocks Table */}
      <Card className="bg-white rounded-lg shadow">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Cap</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStocks.map((stock, index) => {
                  if (index === filteredStocks.length - 1) {
                    return (
                      <tr key={stock.id} ref={lastStockElementRef} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{stock.icon}</span>
                            <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.symbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.price}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          stock.change.includes('-') ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {stock.change}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.marketCap}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                            Buy
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={stock.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{stock.icon}</span>
                          <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.price}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        stock.change.includes('-') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {stock.change}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.marketCap}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                          Buy
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
};

export default Stocks;
