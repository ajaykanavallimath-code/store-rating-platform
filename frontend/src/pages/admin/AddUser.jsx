import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import FormInput from '../../components/FormInput';
import { 
  validateName, 
  validateEmail, 
  validateAddress, 
  validatePassword, 
  getPasswordCriteria 
} from '../../utils/validation';
import { UserPlus, ArrowLeft, Check, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const AddUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER'
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

    if (!['ADMIN', 'USER', 'OWNER'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await adminService.createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
        password: formData.password,
        role: formData.role
      });

      toast.success(`${formData.role} account created successfully!`);
      navigate('/admin/users');
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to create user.';
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Link */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to User Directory</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="p-3 rounded-2xl bg-brand-50 text-brand-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add New User Account</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a new Administrator, Store Owner, or Normal Shopper account.
            </p>
          </div>
        </div>

        {errors.general && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Account Role"
              id="role"
              name="role"
              type="select"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              options={[
                { value: 'USER', label: 'Shopper / Normal User (USER)' },
                { value: 'OWNER', label: 'Store Owner (OWNER)' },
                { value: 'ADMIN', label: 'Platform Administrator (ADMIN)' }
              ]}
              required
            />

            <FormInput
              label="Email Address"
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
          </div>

          <FormInput
            label="Full Name (20 to 60 characters)"
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Eleanor Vance Quality Buyer"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            helperText={`${formData.name.trim().length}/60 characters (minimum 20)`}
            required
          />

          <FormInput
            label="Address (Max 400 characters)"
            id="address"
            name="address"
            type="textarea"
            placeholder="Enter physical address details"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            rows={2}
            required
          />

          <FormInput
            label="Initial Password (8-16 chars)"
            id="password"
            name="password"
            type="password"
            placeholder="Assign account password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          {/* Password Checklist */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-semibold text-slate-700 mb-1">Password Requirements:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/admin/users"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold shadow-sm shadow-brand-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
