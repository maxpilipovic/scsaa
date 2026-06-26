import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw error;
      }

      toast.success('Password reset email sent! Please check your inbox.', {
        autoClose: 5000,
        position: 'top-right',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
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
          <h2 className="text-3xl font-black text-zinc-950 mb-2 tracking-tight">Forgot Password</h2>
          <p className="text-zinc-600">Enter your email to reset your password</p>
        </div>

        <div className="panel-strong p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-zinc-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-10 pr-3"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm text-zinc-700 hover:text-zinc-950 font-medium transition"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
