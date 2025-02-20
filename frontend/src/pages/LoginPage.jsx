import { Link } from 'react-router-dom';

export default function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempted");
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full h-auto max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden flex-grow">
        {/* Left Side - Sign In */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-teal-600 text-center mb-4">StocKZ</h2>
          
          <div className="flex justify-center space-x-4 mb-4">
            <button className="bg-gray-200 p-2 rounded-full">F</button>
            <button className="bg-gray-200 p-2 rounded-full">G+</button>
            <button className="bg-gray-200 p-2 rounded-full">in</button>
          </div>
          
          <p className="text-gray-500 text-center mb-4">or use your email account:</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <a href="#" className="text-sm text-teal-500 hover:underline text-right block">
              Forgot your password?
            </a>
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 rounded-md font-semibold hover:bg-teal-600 transition"
            >
              LOG IN
            </button>
          </form>
        </div>

        {/* Right Side - Sign Up */}
        <div className="w-1/2 bg-teal-500 text-white flex flex-col justify-center items-center p-8">
          <h2 className="text-3xl font-bold mb-4">Hello, Investors!</h2>
          <p className="text-center mb-6">Enter your personal details and start your journey with us</p>
          <Link to="/signup">
            <button className="bg-white text-teal-500 px-6 py-2 rounded-md font-semibold hover:bg-gray-200 transition">SIGN UP</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
