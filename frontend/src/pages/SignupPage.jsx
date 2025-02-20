import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full h-auto max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Side - Welcome Back */}
        <div className="w-1/2 bg-teal-500 text-white flex flex-col justify-center items-center p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-center mb-6">To keep connected with us please login with your personal info</p>
          <Link to="/login">
            <button className="bg-white text-teal-500 px-6 py-2 rounded-md font-semibold hover:bg-gray-200 transition">LOG IN</button>
          </Link>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Create Account</h2>
          
          <div className="flex justify-center space-x-4 mb-4">
            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition">F</button>
            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition">G+</button>
            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition">in</button>
          </div>
          <p className="text-center text-gray-500 mb-4">or use your email for registration:</p>
          
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 rounded-md font-semibold hover:bg-teal-600 transition"
            >
              SIGN UP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
