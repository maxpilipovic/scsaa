import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);

  useEffect(() => {
    const validateRecoveryLink = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));

        const code = searchParams.get('code');
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashErrorDescription = hashParams.get('error_description');

        if (hashErrorDescription) {
          throw new Error(decodeURIComponent(hashErrorDescription));
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
          setIsValidToken(true);
          return;
        }

        if (hashAccessToken && hashRefreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken,
          });

          if (error) {
            throw error;
          }

          setIsValidToken(true);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsValidToken(true);
          return;
        }

        throw new Error('Invalid or expired reset link. Please request a new one.');
      } catch (error) {
        console.error('Recovery link validation error:', error);
        toast.error(error.message || 'Invalid or expired reset link. Please request a new one.');
        setTimeout(() => {
          navigate('/forgot-password');
        }, 2000);
      } finally {
        setCheckingLink(false);
      }
    };

    validateRecoveryLink();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast.success('Password updated successfully!', {
        autoClose: 3000,
        position: 'top-right',
      });

      await supabase.auth.signOut();

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingLink) {
    return (
      <div className="page-shell flex items-center justify-center px-4">
        <div className="text-center panel-strong p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white mb-4">
            <span className="text-zinc-950 font-black text-xl tracking-tight">SP</span>
          </div>
          <p className="text-zinc-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return null;
  }

  return (
    <div className="page-shell flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white mb-4">
            <span className="text-zinc-950 font-black text-xl tracking-tight">SP</span>
          </div>
          <h2 className="text-3xl font-black text-zinc-950 mb-2 tracking-tight">Reset Password</h2>
          <p className="text-zinc-600">Enter your new password</p>
        </div>

        <div className="panel-strong p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-800 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-10 pr-10"
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-zinc-500 hover:text-zinc-950" />
                  ) : (
                    <Eye className="h-5 w-5 text-zinc-500 hover:text-zinc-950" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-800 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-dark pl-10 pr-10"
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-zinc-500 hover:text-zinc-950" />
                  ) : (
                    <Eye className="h-5 w-5 text-zinc-500 hover:text-zinc-950" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
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

export default ResetPassword;
