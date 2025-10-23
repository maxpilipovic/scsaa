import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Phone, Calendar, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    pledge_class: '',
    phone_number: '',
    address: '',
    dob: '', //Stored as YYYY-MM-DD
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    pledge_class: formData.pledge_class ? String(formData.pledge_class) : null,
                    phone_number: formData.phone_number,
                    address: formData.address,
                    dob: formData.dob //Stored as YYYY-MM-DD
                }
            }
        });

        if (error) {
            throw error;
        }

        toast.success("Registration successful! Please check your email to verify your account.", { 
            autoClose: 5000,
            position: "top-right",
        });

        //Timeout and navigate.
        setTimeout(() => {
            navigate('/');
        }, 2000);

    } catch (err) {
        console.error("Sign up error:", err);
        toast.error(err.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-xl mb-4">
            <span className="text-white font-bold text-3xl">ΣΠ</span>
          </div>
          <h2 className="text-3xl font-bold text-purple-900 mb-2">Join SCSAA</h2>
          <p className="text-purple-700">Create your alumni association account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                  <input
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                  <input
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-purple-900 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                />
              </div>
            </div>

            {/* Phone & Pledge Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                  <input
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="555-123-4567"
                    className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">Pledge Class</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                  <input
                    name="pledge_class"
                    type="number"
                    required
                    min="1950"
                    max="2030"
                    value={formData.pledge_class}
                    onChange={handleChange}
                    placeholder="2020"
                    className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-purple-900 mb-2">Address</label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Elm Street"
                  className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                />
              </div>
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-semibold text-purple-900 mb-2">Date of Birth</label>
              <input
                name="dob"
                type="date"
                required
                value={formData.dob}
                onChange={handleChange}
                className="w-full py-3 px-4 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-purple-900 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-purple-900 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Create Account
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-purple-600">
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="font-semibold hover:text-purple-800 cursor-pointer"
              >
                Sign in instead
              </span>
            </p>
          </div>

          <div className="text-center mt-4">
            <span
              onClick={() => navigate('/')}
              className="text-purple-700 hover:text-purple-900 text-sm cursor-pointer"
            >
              ← Back to Home
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;