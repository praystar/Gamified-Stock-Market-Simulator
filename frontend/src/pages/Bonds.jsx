import React from "react";
import Sidebar from "../components/Sidebar";
import { Card, CardContent } from "../components/ui/card";

const bondsData = [
  { id: 1, name: "US Treasury Bond", symbol: "USTB", price: "$102.35", yield: "3.5%", maturity: "2030", rating: "AAA", icon: "🇺🇸" },
  { id: 2, name: "Corporate Bond (Apple)", symbol: "AAPL-BND", price: "$98.75", yield: "4.2%", maturity: "2028", rating: "AA", icon: "🍏" },
  { id: 3, name: "Indian Govt Bond", symbol: "INBND", price: "₹94.20", yield: "6.5%", maturity: "2032", rating: "AAA", icon: "🇮🇳" },
  { id: 4, name: "Tesla Corporate Bond", symbol: "TSLA-BND", price: "$96.10", yield: "5.8%", maturity: "2029", rating: "A", icon: "🚗" },
  { id: 5, name: "UK Gilt Bond", symbol: "UKBND", price: "£88.50", yield: "3.2%", maturity: "2031", rating: "AAA", icon: "🇬🇧" },
  { id: 6, name: "Germany Govt Bond", symbol: "DEBND", price: "€92.30", yield: "2.8%", maturity: "2035", rating: "AAA", icon: "🇩🇪" },
  { id: 7, name: "Reliance Corporate Bond", symbol: "RELBND", price: "₹89.60", yield: "6.8%", maturity: "2030", rating: "A+", icon: "🏢" },
  { id: 8, name: "JP Morgan Bond", symbol: "JPM-BND", price: "$97.20", yield: "4.5%", maturity: "2027", rating: "AA", icon: "🏦" },
];

const Bonds = () => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      

      <div className="flex-1 p-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold mb-6">Bonds Market</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search bonds..."
          className="bg-gray-800 p-2 rounded-md text-gray-300 w-full mb-4"
        />

        {/* Bonds Table */}
        <Card className="p-4 bg-gray-800 rounded-lg shadow-md">
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-gray-400">Bond</th>
                  <th className="p-3 text-gray-400">Symbol</th>
                  <th className="p-3 text-gray-400">Price</th>
                  <th className="p-3 text-gray-400">Yield</th>
                  <th className="p-3 text-gray-400">Maturity</th>
                  <th className="p-3 text-gray-400">Rating</th>
                  <th className="p-3 text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {bondsData.map((bond) => (
                  <tr key={bond.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="p-3 flex items-center">
                      <span className="mr-3 text-lg">{bond.icon}</span> {bond.name}
                    </td>
                    <td className="p-3 text-gray-300">{bond.symbol}</td>
                    <td className="p-3 text-gray-300">{bond.price}</td>
                    <td className="p-3 text-green-400 font-bold">{bond.yield}</td>
                    <td className="p-3 text-gray-300">{bond.maturity}</td>
                    <td className="p-3 text-gray-300">{bond.rating}</td>
                    <td className="p-3">
                      <button className="bg-purple-600 text-white px-4 py-1 rounded-md hover:bg-purple-700 transition">
                        Invest
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

export default Bonds;
