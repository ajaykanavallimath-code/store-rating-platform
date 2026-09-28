import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import FormInput from '../../components/FormInput';
import { validateEmail, validateAddress } from '../../utils/validation';
import { Store, ArrowLeft, PlusCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const AddStore = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });

  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const res = await adminService.getUsers({ role: 'OWNER', limit: 100 });
      setOwners(res.data || []);
    } catch {
      // Ignore owner loading error
    } finally {
      setLoadingOwners(false);
    }
  };

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

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Store name must be at least 3 characters.';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Store name must not exceed 100 characters.';
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const addressErr = validateAddress(formData.address);
    if (addressErr) newErrors.address = addressErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await adminService.createStore({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
        owner_id: formData.owner_id ? parseInt(formData.owner_id, 10) : null
      });

      toast.success('Store created successfully!');
      navigate('/admin/stores');
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to create store.';
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
        to="/admin/stores"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store Directory</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add New Store</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Register a business entity and optionally assign an existing Store Owner.
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
            label="Store Business Name (3 to 100 characters)"
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Apex Fitness & Sports Hub"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            helperText={`${formData.name.trim().length}/100 characters`}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Store Contact Email"
              id="email"
              name="email"
              type="email"
              placeholder="contact@business.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <FormInput
              label="Assigned Store Owner (Optional)"
              id="owner_id"
              name="owner_id"
              type="select"
              value={formData.owner_id}
              onChange={handleChange}
              error={errors.owner_id}
              options={[
                { value: '', label: loadingOwners ? 'Loading owners...' : '-- Unassigned (No Owner) --' },
                ...owners.map((o) => ({
                  value: o.id.toString(),
                  label: `${o.name} (${o.email})`
                }))
              ]}
              helperText={
                owners.length === 0 && !loadingOwners
                  ? 'No store owner accounts registered yet. You can create one under Add User.'
                  : ''
              }
            />
          </div>

          <FormInput
            label="Store Physical Address (Max 400 characters)"
            id="address"
            name="address"
            type="textarea"
            placeholder="Enter physical retail store location or suite address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            rows={3}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/admin/stores"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold shadow-sm shadow-brand-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Creating Store...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStore;
