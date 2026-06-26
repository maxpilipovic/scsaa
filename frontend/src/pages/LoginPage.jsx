import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        throw error;
      }

      if (!data.user.confirmed_at) {
        toast.info("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      toast.success("Login successful!", {
        autoClose: 3000,
        position: "top-right",
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white mb-4">
            <span className="text-zinc-950 font-black text-xl tracking-tight">SP</span>
          </div>
          <h2 className="text-3xl font-black text-zinc-950 mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-zinc-600">Sign in to your SCSAA account</p>
        </div>

        <div className="panel-strong p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-zinc-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-dark pl-10 pr-4"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-800 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-dark pl-10 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-950"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <a
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-zinc-700 hover:text-zinc-950 font-medium cursor-pointer"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full py-3 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-zinc-500">New to SCSAA?</span>
            </div>
          </div>

          <div className="text-center">
            <a
              onClick={() => navigate('/register')}
              className="text-zinc-950 hover:text-zinc-950 font-semibold cursor-pointer"
            >
              Create an account
            </a>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            onClick={() => navigate('/')}
            className="text-zinc-600 hover:text-zinc-950 text-sm cursor-pointer"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
