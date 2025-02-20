import React from "react";
import Sidebar from "../components/Sidebar";
import { Card, CardContent } from "../components/ui/card";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const fixedDepositsData = [
  { id: 1, bank: "HDFC Bank", interestRate: 7.1, tenure: "5 years", minAmount: 10000, taxBenefit: "Yes", icon: "🏦" },
  { id: 2, bank: "SBI Bank", interestRate: 6.75, tenure: "3 years", minAmount: 5000, taxBenefit: "No", icon: "🏦" },
  { id: 3, bank: "ICICI Bank", interestRate: 7.25, tenure: "10 years", minAmount: 25000, taxBenefit: "Yes", icon: "🏦" },
  { id: 4, bank: "Axis Bank", interestRate: 6.85, tenure: "2 years", minAmount: 20000, taxBenefit: "No", icon: "🏦" },
  { id: 5, bank: "Kotak Bank", interestRate: 7.0, tenure: "7 years", minAmount: 15000, taxBenefit: "Yes", icon: "🏦" },
  { id: 6, bank: "Punjab National Bank", interestRate: 6.9, tenure: "4 years", minAmount: 8000, taxBenefit: "No", icon: "🏦" },
];

// Chart Data - Bar Chart (Interest Rates)
const barChartData = {
  labels: fixedDepositsData.map((fd) => fd.bank),
  datasets: [
    {
      label: "Interest Rate (%)",
      data: fixedDepositsData.map((fd) => fd.interestRate),
      backgroundColor: ["#6366F1", "#EAB308", "#10B981", "#EF4444", "#F59E0B", "#3B82F6"],
      borderRadius: 5,
    },
  ],
};

// Chart Data - Pie Chart (Tax Benefits)
const pieChartData = {
  labels: ["Tax Benefit", "No Tax Benefit"],
  datasets: [
    {
      data: [
        fixedDepositsData.filter((fd) => fd.taxBenefit === "Yes").length,
        fixedDepositsData.filter((fd) => fd.taxBenefit === "No").length,
      ],
      backgroundColor: ["#22C55E", "#EF4444"],
    },
  ],
};

const FixedDeposits = () => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      

      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Fixed Deposits</h1>
          <input type="text" placeholder="Search FDs..." className="bg-gray-800 p-2 rounded-md text-gray-300" />
        </header>

        {/* Charts Section - Made Smaller */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-gray-800 rounded-lg shadow-md w-80 h-60">
            <h2 className="text-md font-semibold text-gray-300 mb-2">Interest Rates</h2>
            <CardContent>
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>

          <Card className="p-4 bg-gray-800 rounded-lg shadow-md w-80 h-60">
            <h2 className="text-md font-semibold text-gray-300 mb-2">Tax Benefit Distribution</h2>
            <CardContent>
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>
        </div>

        {/* Fixed Deposits Table */}
        <Card className="p-4 bg-gray-800 rounded-lg shadow-md">
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-gray-400">Bank</th>
                  <th className="p-3 text-gray-400">Interest Rate</th>
                  <th className="p-3 text-gray-400">Tenure</th>
                  <th className="p-3 text-gray-400">Min Amount</th>
                  <th className="p-3 text-gray-400">Tax Benefit</th>
                  <th className="p-3 text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {fixedDepositsData.map((fd) => (
                  <tr key={fd.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="p-3 flex items-center">
                      <span className="mr-3 text-lg">{fd.icon}</span> {fd.bank}
                    </td>
                    <td className="p-3 text-green-400 font-bold">{fd.interestRate}%</td>
                    <td className="p-3 text-gray-300">{fd.tenure}</td>
                    <td className="p-3 text-gray-300">₹{fd.minAmount.toLocaleString()}</td>
                    <td className="p-3 text-gray-300">{fd.taxBenefit}</td>
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

export default FixedDeposits;
