import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // CAPTCHA state
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [captchaError, setCaptchaError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Generate new CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2, answer: num1 + num2 });
    setCaptchaAnswer('');
    setCaptchaError('');
  };

  const handleCaptchaSubmit = (e) => {
    e.preventDefault();
    if (parseInt(captchaAnswer) === captchaQuestion.answer) {
      setCaptchaSolved(true);
      setCaptchaError('');
    } else {
      setCaptchaError('Incorrect answer. Try again!');
      generateCaptcha(); // Generate new question on wrong answer
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your Xeno account</p>
          </div>

          {/* CAPTCHA Section - Shows first */}
          {!captchaSolved ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Demo Access Available</p>
                    <p>Solve the math problem below to reveal demo credentials</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCaptchaSubmit} className="space-y-4">
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Security Check
                  </label>
                  
                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {captchaQuestion.num1} + {captchaQuestion.num2} = ?
                    </p>
                  </div>

                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-center text-lg font-medium focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    placeholder="Your answer"
                    required
                    autoFocus
                  />

                  {captchaError && (
                    <p className="text-red-600 text-sm mt-2 text-center">{captchaError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg"
                >
                  Verify & Show Credentials
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={generateCaptcha}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Generate new question
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Demo Credentials - Shows after CAPTCHA solved */}
              <div className="mb-6 space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 mb-3">✅ Demo Credentials:</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded p-3 border border-green-300">
                      <p className="text-gray-600 mb-1">Store 1 (Admin):</p>
                      <p className="font-mono text-gray-900">
                        <span className="font-semibold">Email:</span> admin@xeno.com
                      </p>
                      <p className="font-mono text-gray-900">
                        <span className="font-semibold">Pass:</span> password123
                      </p>
                    </div>

                    <div className="bg-white rounded p-3 border border-green-300">
                      <p className="text-gray-600 mb-1">Store 2:</p>
                      <p className="font-mono text-gray-900">
                        <span className="font-semibold">Email:</span> store3@xeno.com
                      </p>
                      <p className="font-mono text-gray-900">
                        <span className="font-semibold">Pass:</span> password123
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCaptchaSolved(false)}
                    className="text-xs text-green-700 hover:text-green-900 underline mt-3"
                  >
                    Hide credentials
                  </button>
                </div>
              </div>

              {/* Login Form - Shows after CAPTCHA solved */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-gray-900 font-medium hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
