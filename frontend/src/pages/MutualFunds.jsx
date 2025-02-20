import React from "react";
import Sidebar from "../components/Sidebar";
import { Card, CardContent } from "../components/ui/card";

const mutualFundsData = [
  { id: 1, name: "Axis Bluechip Fund Direct Plan Growth", category: "Equity Fund", returns: "+8.2%", nav: "$123.15", icon: "📈" },
  { id: 2, name: "ICICI Prudential Technology Plan Growth", category: "Technology Fund", returns: "-2.4%", nav: "$98.75", icon: "💻" },
  { id: 3, name: "SBI Liquid Fund Direct Plan Growth", category: "Debt Fund", returns: "+4.1%", nav: "$101.50", icon: "🏦" },
  { id: 4, name: "HDFC Mid-Cap Opportunities Fund", category: "Mid-Cap Fund", returns: "+10.5%", nav: "$145.30", icon: "📊" },
  { id: 5, name: "Kotak Small Cap Fund", category: "Small-Cap Fund", returns: "+12.7%", nav: "$89.45", icon: "📉" },
  { id: 6, name: "Mirae Asset Emerging Bluechip Fund", category: "Equity Fund", returns: "+9.8%", nav: "$110.90", icon: "🌍" },
  { id: 7, name: "Aditya Birla Sun Life Corporate Bond Fund", category: "Debt Fund", returns: "+5.3%", nav: "$103.75", icon: "🏛" },
  { id: 8, name: "Franklin India Feeder - US Opportunities Fund", category: "International Fund", returns: "-1.8%", nav: "$95.20", icon: "🇺🇸" },
];

const MutualFunds = () => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      

      <div className="flex-1 p-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold mb-6">Mutual Funds</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search mutual funds..."
          className="bg-gray-800 p-2 rounded-md text-gray-300 w-full mb-4"
        />

        {/* Mutual Funds Table */}
        <Card className="p-4 bg-gray-800 rounded-lg shadow-md">
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-gray-400">Fund Name</th>
                  <th className="p-3 text-gray-400">Category</th>
                  <th className="p-3 text-gray-400">Returns</th>
                  <th className="p-3 text-gray-400">NAV</th>
                  <th className="p-3 text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {mutualFundsData.map((fund) => (
                  <tr key={fund.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="p-3 flex items-center">
                      <span className="mr-3 text-lg">{fund.icon}</span> {fund.name}
                    </td>
                    <td className="p-3 text-gray-300">{fund.category}</td>
                    <td className={`p-3 font-bold ${fund.returns.includes("-") ? "text-red-500" : "text-green-400"}`}>
                      {fund.returns}
                    </td>
                    <td className="p-3 text-gray-300">{fund.nav}</td>
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

export default MutualFunds;
