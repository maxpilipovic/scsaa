import React, { useState } from 'react';
import { Calendar, Eye, EyeOff, Home, Lock, Mail, Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';
import legalPdf from '../assets/SCSAA_Legal_Final.pdf';

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
    dob: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!formData.acceptedTerms) {
      toast.error("You must agree to the Terms and Conditions before signing up.");
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            pledge_class: formData.pledge_class ? Number(formData.pledge_class) : 0,
            phone_number: formData.phone_number,
            address: formData.address,
            dob: formData.dob
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

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error("Sign up error:", err);
      toast.error(err.message || "Registration failed.");
    }
  };

  const inputClass = "input-dark pl-10 pr-4";
  const labelClass = "block text-sm font-semibold text-zinc-800 mb-2";
  const iconClass = "absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500";

  return (
    <div className="page-shell flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white mb-4">
            <span className="text-zinc-950 font-black text-xl tracking-tight">SP</span>
          </div>
          <h2 className="text-3xl font-black text-zinc-950 mb-2 tracking-tight">Join SCSAA</h2>
          <p className="text-zinc-600">Create your alumni association account</p>
        </div>

        <div className="panel-strong p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <div className="relative">
                  <User className={iconClass} size={20} />
                  <input name="first_name" type="text" required value={formData.first_name} onChange={handleChange} placeholder="John" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Last Name</label>
                <div className="relative">
                  <User className={iconClass} size={20} />
                  <input name="last_name" type="text" required value={formData.last_name} onChange={handleChange} placeholder="Doe" className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className={iconClass} size={20} />
                <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="your.email@example.com" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <Phone className={iconClass} size={20} />
                  <input name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} placeholder="555-123-4567" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Pledge Class</label>
                <div className="relative">
                  <Calendar className={iconClass} size={20} />
                  <input name="pledge_class" type="number" required min="1950" max="2030" value={formData.pledge_class} onChange={handleChange} placeholder="2020" className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <div className="relative">
                <Home className={iconClass} size={20} />
                <input name="address" type="text" value={formData.address} onChange={handleChange} placeholder="123 Elm Street" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                name="dob"
                type="date"
                required
                value={formData.dob}
                onChange={handleChange}
                className="input-dark"
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className={iconClass} size={20} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-dark pl-10 pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-950" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <Lock className={iconClass} size={20} />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="input-dark pl-10 pr-12"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-950" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="border border-zinc-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <input id="acceptedTerms" name="acceptedTerms" type="checkbox" checked={formData.acceptedTerms} onChange={handleChange} required className="mt-1 h-4 w-4 border-zinc-600 bg-zinc-50 text-zinc-950 focus:ring-white" />
                <div>
                  <label htmlFor="acceptedTerms" className="block text-sm font-semibold text-zinc-950">
                    I agree to the Terms and Conditions
                  </label>
                  <p className="mt-1 text-sm text-zinc-600">
                    You must review and accept the SCSAA terms before creating an account.
                  </p>
                  <a href={legalPdf} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-sm font-semibold text-zinc-950 underline underline-offset-4 hover:text-zinc-950">
                    View Terms and Conditions (PDF)
                  </a>
                </div>
              </div>
            </div>

            <button type="submit" disabled={!formData.acceptedTerms} className="btn-primary w-full py-3">
              Create Account
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-zinc-600">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="font-semibold text-zinc-950 hover:text-zinc-950 cursor-pointer">
                Sign in instead
              </span>
            </p>
          </div>

          <div className="text-center mt-4">
            <span onClick={() => navigate('/')} className="text-zinc-600 hover:text-zinc-950 text-sm cursor-pointer">
              Back to Home
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
