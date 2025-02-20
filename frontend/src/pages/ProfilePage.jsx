import React from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { Card, CardContent } from "../components/ui/card";
import Progress from "../components/ui/progress";
import Sidebar from "../components/Sidebar";

// Stock Line Chart Data
const stockData = [
  { name: "Jan", value: 6000 },
  { name: "Feb", value: 6200 },
  { name: "Mar", value: 6100 },
  { name: "Apr", value: 6300 },
  { name: "May", value: 6480 },
];

// Pie Chart Data
const accountHoldings = [
  { name: "Equity", value: 51.08, color: "#4ade80" },
  { name: "Debt", value: 24.14, color: "#38bdf8" },
  { name: "Gold", value: 2.41, color: "#facc15" },
];

const sectorAllocation = [
  { name: "Finance", value: 25.59, color: "#4f46e5" },
  { name: "Energy", value: 23.37, color: "#f43f5e" },
  { name: "Tech", value: 11.97, color: "#22d3ee" },
];

const stockAllocation = [
  { name: "Large Cap", value: 38.85, color: "#eab308" },
  { name: "Mid Cap", value: 7.02, color: "#9333ea" },
  { name: "Small Cap", value: 5.25, color: "#06b6d4" },
];

const ProfilePage = () => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      

      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-800 p-2 rounded-md text-gray-300"
          />
        </header>

        {/* Stock Market Graph */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardContent>
              <h2 className="text-lg mb-4">Stock Exchange</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strength Meter */}
          <Card className="h-[320px] bg-gray-800 text-white rounded-lg shadow-lg p-6">
  <CardContent className="flex flex-col justify-between h-full">
    <h2 className="text-lg font-semibold mb-4 text-gray-300">Strength Meter</h2>
    
    {/* ROI, Invested & Current Amount */}
    <div className="flex justify-between items-center text-center">
      <div>
        <p className="text-sm text-gray-400">Your Investment</p>
        <p className="text-xl font-semibold text-white">$7,000</p>
      </div>
      
      <div>
        <p className="text-sm text-gray-400">Current Value</p>
        <p className="text-xl font-semibold text-green-400">$8,241</p>
      </div>
      
      <div>
        <p className="text-sm text-gray-400">ROI</p>
        <p className="text-xl font-semibold text-green-500">+20.2%</p>
      </div>
    </div>

    {/* Progress Bar */}
    <div className="mt-4">
      <Progress value={75} className="bg-green-500 h-3 rounded-full" />
    </div>

    {/* Invest Button */}
    <button className="mt-6 w-full bg-purple-600 text-white font-semibold py-2 rounded-md hover:bg-purple-700 transition">
      Invest
    </button>
  </CardContent>
</Card>


        </div>

        {/* Stock Information Rectangles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="bg-gray-800 text-white">
            <CardContent>
              <h3 className="text-md font-medium mb-2">RELIANCE</h3>
              <p className="text-lg font-bold">₹3,200</p>
              <p className="text-sm text-green-400">+2.3% Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 text-white">
            <CardContent>
              <h3 className="text-md font-medium mb-2">HDFCBANK</h3>
              <p className="text-lg font-bold">₹1,720</p>
              <p className="text-sm text-red-400">-0.5% Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 text-white">
            <CardContent>
              <h3 className="text-md font-medium mb-2">Gold</h3>
              <p className="text-lg font-bold">₹58,900</p>
              <p className="text-sm text-green-400">+1.2% Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Overview with Pie Charts */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Holdings Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Holdings Pie Chart */}
            <Card>
              <CardContent>
                <h3 className="text-md font-medium mb-4">Account Holdings</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie 
                      data={accountHoldings} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={60} 
                      fill="#8884d8"
                      label
                    >
                      {accountHoldings.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sector Allocation Pie Chart */}
            <Card>
              <CardContent>
                <h3 className="text-md font-medium mb-4">Sector Allocation</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie 
                      data={sectorAllocation} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={60} 
                      fill="#8884d8"
                      label
                    >
                      {sectorAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stock Allocation Pie Chart */}
            <Card>
              <CardContent>
                <h3 className="text-md font-medium mb-4">Stock Allocation</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie 
                      data={stockAllocation} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={60} 
                      fill="#8884d8"
                      label
                    >
                      {stockAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
