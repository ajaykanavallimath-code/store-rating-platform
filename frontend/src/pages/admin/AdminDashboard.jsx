import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StarRating from '../../components/StarRating';
import { formatDateTime } from '../../utils/formatters';
import { 
  Users, 
  Store, 
  Star, 
  Shield, 
  UserCheck, 
  Briefcase, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboard();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading platform overview..." />;
  }

  const counts = stats?.counts || {};
  const recentRatings = stats?.recentRatings || [];
  const ratingDistribution = stats?.ratingDistribution || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time platform statistics, user analytics, and review activities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/stores/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-brand-600" />
            <span>Add Store</span>
          </Link>
          <Link
            to="/admin/users/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add User</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{counts.totalUsers}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{counts.totalNormalUsers} Shoppers</span>
            <span>•</span>
            <span>{counts.totalOwners} Owners</span>
            <span>•</span>
            <span>{counts.totalAdmins} Admins</span>
          </div>
        </div>

        {/* Total Stores */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stores</span>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{counts.totalStores}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <Link to="/admin/stores" className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
              <span>View all stores</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Ratings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Ratings</span>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{counts.totalRatings}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Verified Customer Reviews</span>
          </div>
        </div>

        {/* Platform Avg Rating */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Score</span>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{counts.platformAvgRating || '0.0'}</span>
            <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Overall rating average</span>
          </div>
        </div>
      </div>

      {/* Analytics & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Breakdown Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Rating Breakdown</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const item = ratingDistribution.find((r) => r.rating === star);
              const count = item ? item.count : 0;
              const percentage = counts.totalRatings > 0 ? Math.round((count / counts.totalRatings) * 100) : 0;

              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 text-slate-600 font-semibold">
                    <span>{star}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>

                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-12 text-right font-medium text-slate-500">{count} ({percentage}%)</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Total Evaluations:</span>
              <span className="font-bold text-slate-900">{counts.totalRatings} ratings</span>
            </div>
          </div>
        </div>

        {/* Recent Ratings Stream */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Ratings Activity</h2>
              <span className="text-xs text-slate-400">Latest 5 submissions</span>
            </div>

            {recentRatings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No ratings submitted yet on the platform.
              </div>
            ) : (
              <div className="space-y-3">
                {recentRatings.map((rating) => (
                  <div
                    key={rating.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {rating.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{rating.userName}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          rated <span className="font-semibold text-slate-700">{rating.storeName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <StarRating rating={rating.rating} size="xs" readOnly showValue={false} />
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateTime(rating.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/admin/stores" className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
              <span>Manage all stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/admin/users" className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
              <span>Manage all users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
