import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { 
  validateName, 
  validateEmail, 
  validateAddress, 
  validatePassword, 
  getPasswordCriteria 
} from '../utils/validation';
import { Store, UserPlus, Check, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const criteria = getPasswordCriteria(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const addressErr = validateAddress(formData.address);
    if (addressErr) newErrors.address = addressErr;

    const passwordErr = validatePassword(formData.password);
    if (passwordErr) newErrors.password = passwordErr;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await signup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
        password: formData.password
      });

      toast.success('Account created successfully! Welcome to StoreRate.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to create account.';
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);
      } else {
        toast.error(serverMessage);
        setErrors({ general: serverMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30 mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Shopper Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Sign up to search local stores, submit ratings, and share honest reviews
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          {errors.general && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormInput
              label="Full Name (20 to 60 characters)"
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Jonathan David Doe Consumer"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              helperText={`${formData.name.trim().length}/60 characters (min 20)`}
              required
            />

            <FormInput
              label="Email Address"
              id="email"
              name="email"
              type="email"
              placeholder="e.g. user@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <FormInput
              label="Residential Address (Max 400 characters)"
              id="address"
              name="address"
              type="textarea"
              placeholder="Enter your street address, apartment/suite, city, state, zip"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              rows={2}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Password (8-16 chars)"
                id="password"
                name="password"
                type="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <FormInput
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />
            </div>

            {/* Live Password Requirements Checklist */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p className="font-semibold text-slate-700 mb-1">Password Requirements:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                <div className={`flex items-center gap-1.5 ${criteria.minLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {criteria.minLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>8 to 16 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasUpper ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {criteria.hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>At least 1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasLower ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {criteria.hasLower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>At least 1 lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {criteria.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>At least 1 number</span>
                </div>
                <div className={`flex items-center gap-1.5 sm:col-span-2 ${criteria.hasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {criteria.hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>At least 1 special character (!@#$%^&*...)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-md shadow-brand-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign In to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
