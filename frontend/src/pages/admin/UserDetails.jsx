import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StarRating from '../../components/StarRating';
import { getRoleBadgeClass, formatDateTime, formatDate } from '../../utils/formatters';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  Store, 
  Star,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UserDetails = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUserById(id);
      setUserData(res.data);
    } catch (err) {
      toast.error('Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading user details..." />;
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 font-semibold mb-4">User account not found.</p>
        <Link to="/admin/users" className="text-brand-600 text-sm hover:underline">
          Return to User Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Link */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to User Directory</span>
      </Link>

      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 font-bold text-2xl flex items-center justify-center flex-shrink-0">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{userData.name}</h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getRoleBadgeClass(userData.role)}`}>
                  {userData.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{userData.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-xs">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Physical Address
            </span>
            <p className="text-slate-800 flex items-start gap-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>{userData.address}</span>
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Account Created
              </span>
              <p className="text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDateTime(userData.created_at)}</span>
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Last Updated
              </span>
              <p className="text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{formatDateTime(userData.updated_at)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Content: STORE OWNER STORES */}
      {userData.role === 'OWNER' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Assigned Stores & Ratings</h2>
            </div>
            <span className="text-xs text-slate-400">
              {userData.stores?.length || 0} Assigned Store{userData.stores?.length === 1 ? '' : 's'}
            </span>
          </div>

          {!userData.stores || userData.stores.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              This owner currently has no stores assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData.stores.map((store) => (
                <div
                  key={store.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{store.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{store.email}</p>
                    <p className="text-xs text-slate-600 mt-2 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <StarRating rating={store.avgRating} size="sm" readOnly showValue={false} />
                      <span className="font-bold text-slate-800">
                        {store.totalRatings > 0 ? `${store.avgRating.toFixed(1)} / 5` : 'No ratings'}
                      </span>
                    </div>
                    <span className="text-slate-500">({store.totalRatings} ratings)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Role-Specific Content: USER RATINGS ACTIVITY */}
      {userData.role === 'USER' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Submitted Ratings History</h2>
            </div>
            <span className="text-xs text-slate-400">
              {userData.ratings?.length || 0} Review{userData.ratings?.length === 1 ? '' : 's'}
            </span>
          </div>

          {!userData.ratings || userData.ratings.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              This user has not submitted any ratings yet.
            </div>
          ) : (
            <div className="space-y-3">
              {userData.ratings.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{r.storeName}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{r.storeAddress}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Submitted on {formatDate(r.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <StarRating rating={r.rating} size="xs" readOnly showValue={false} />
                    <span className="font-bold text-slate-800 text-xs">{r.rating}★</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetails;
