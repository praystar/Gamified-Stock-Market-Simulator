import React from "react";
import Sidebar from "../components/Sidebar";
import { Card, CardContent } from "../components/ui/card";

const stockData = [
  {
    id: 1,
    name: "Apple Inc.",
    symbol: "AAPL",
    price: "$182.52",
    change: "+2.1%",
    marketCap: "2.85T",
    icon: "🍏",
  },
  {
    id: 2,
    name: "Tesla Inc.",
    symbol: "TSLA",
    price: "$678.24",
    change: "-1.8%",
    marketCap: "850B",
    icon: "🚗",
  },
  {
    id: 3,
    name: "Microsoft Corp.",
    symbol: "MSFT",
    price: "$312.48",
    change: "+0.9%",
    marketCap: "2.40T",
    icon: "💻",
  },
  {
    id: 4,
    name: "Amazon.com Inc.",
    symbol: "AMZN",
    price: "$142.89",
    change: "-0.6%",
    marketCap: "1.35T",
    icon: "📦",
  },
];

const Stocks = () => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      

      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Stocks</h1>
          <input
            type="text"
            placeholder="Search stocks..."
            className="bg-gray-800 p-2 rounded-md text-gray-300"
          />
        </header>

        {/* Stocks Table */}
        <Card className="p-4 bg-gray-800 rounded-lg shadow-md">
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-gray-400">Stock</th>
                  <th className="p-3 text-gray-400">Symbol</th>
                  <th className="p-3 text-gray-400">Price</th>
                  <th className="p-3 text-gray-400">Change</th>
                  <th className="p-3 text-gray-400">Market Cap</th>
                  <th className="p-3 text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((stock) => (
                  <tr key={stock.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="p-3 flex items-center">
                      <span className="mr-3 text-lg">{stock.icon}</span> {stock.name}
                    </td>
                    <td className="p-3 text-gray-300">{stock.symbol}</td>
                    <td className="p-3 text-gray-300">{stock.price}</td>
                    <td className={`p-3 font-bold ${stock.change.includes("-") ? "text-red-500" : "text-green-400"}`}>
                      {stock.change}
                    </td>
                    <td className="p-3 text-gray-300">{stock.marketCap}</td>
                    <td className="p-3">
                      <button className="bg-purple-600 text-white px-4 py-1 rounded-md hover:bg-purple-700 transition">
                        Buy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stocks;
