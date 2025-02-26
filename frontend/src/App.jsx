import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import Stocks from "./pages/Stock";
import Bonds from "./pages/Bonds";
import MutualFunds from "./pages/MutualFunds";
import FixedDeposits from "./pages/FixedDeposits";
import Sidebar from "./components/Sidebar";
import Library from "./pages/Library";

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-900">
        <Routes>
          {/* Centered Login & Signup Pages */}
          <Route path="/login" element={<CenteredPage component={<LoginPage />} />} />
          <Route path="/signup" element={<CenteredPage component={<SignupPage />} />} />

          {/* Protected Routes (Show Sidebar) */}
          <Route
            path="*"
            element={
              <div className="flex w-full">
                <Sidebar />
                <div className="flex-1 p-4 overflow-auto">
                  <Routes>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/stocks" element={<Stocks />} />
                    <Route path="/bonds" element={<Bonds />} />
                    <Route path="/mutualfunds" element={<MutualFunds />} />
                    <Route path="/fixeddeposits" element={<FixedDeposits />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="*" element={<Navigate to="/profile" />} />
                  </Routes>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

/* Utility Component to Center Login & Signup */
const CenteredPage = ({ component }) => (
  <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-300 text-lg font-semibold mb-4">
    {component}
  </div>
);

export default App;