import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { validatePassword, getPasswordCriteria } from '../utils/validation';
import { Key, Check, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChangePassword = () => {
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const criteria = getPasswordCriteria(formData.newPassword);

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

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
    }

    const passwordErr = validatePassword(formData.newPassword);
    if (passwordErr) {
      newErrors.newPassword = passwordErr;
    }

    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password.';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      toast.success('Password updated successfully! Please log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to change password.';
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
    <div className="max-w-xl mx-auto py-4 sm:py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="p-3 rounded-2xl bg-brand-50 text-brand-600">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Change Password</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your password securely. You will be asked to sign in again.
            </p>
          </div>
        </div>

        {errors.general && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormInput
            label="Current Password"
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="Enter your current password"
            value={formData.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            required
            autoComplete="current-password"
          />

          <FormInput
            label="New Password (8-16 chars)"
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="Enter new strong password"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            required
            autoComplete="new-password"
          />

          <FormInput
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repeat new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          {/* Requirements Checklist */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <p className="font-semibold text-slate-700 mb-1">New Password Requirements:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className={`flex items-center gap-1.5 ${criteria.minLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                {criteria.minLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                <span>8 to 16 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${criteria.hasUpper ? 'text-emerald-600' : 'text-slate-400'}`}>
                {criteria.hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                <span>1 uppercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${criteria.hasLower ? 'text-emerald-600' : 'text-slate-400'}`}>
                {criteria.hasLower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                <span>1 lowercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                {criteria.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                <span>1 number</span>
              </div>
              <div className={`flex items-center gap-1.5 sm:col-span-2 ${criteria.hasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
                {criteria.hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                <span>1 special character (!@#$%^&*...)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-md shadow-brand-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Updating Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
