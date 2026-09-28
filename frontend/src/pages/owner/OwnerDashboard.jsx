import React, { useState, useEffect, useCallback } from 'react';
import ownerService from '../../services/ownerService';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { 
  Store, 
  Star, 
  Users, 
  TrendingUp, 
  MapPin, 
  Mail, 
  ChevronDown,
  Building2,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(selectedStoreId && { storeId: selectedStoreId }),
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order
      };

      const res = await ownerService.getDashboard(params);
      setDashboardData(res.data);

      if (res.data?.currentStore && !selectedStoreId) {
        setSelectedStoreId(res.data.currentStore.id);
      }

      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: res.pagination.total,
          totalPages: res.pagination.totalPages
        }));
      }
    } catch (err) {
      toast.error('Failed to load store owner dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [selectedStoreId, pagination.page, pagination.limit, sortBy, order]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStoreChange = (e) => {
    setSelectedStoreId(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field, newOrder) => {
    setSortBy(field);
    setOrder(newOrder);
  };

  const stores = dashboardData?.stores || [];
  const currentStore = dashboardData?.currentStore || null;
  const ratings = dashboardData?.ratings || [];

  const columns = [
    {
      key: 'name',
      label: 'Customer Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
            {row.customerName ? row.customerName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">{row.customerName}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 sm:hidden">{row.customerEmail}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Customer Email',
      sortable: true,
      cellClassName: 'hidden sm:table-cell text-slate-600 text-xs font-medium',
      headerClassName: 'hidden sm:table-cell',
      render: (_, row) => row.customerEmail
    },
    {
      key: 'rating',
      label: 'Rating Score',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
          <StarRating rating={val} size="xs" readOnly showValue={false} />
          <span className="font-extrabold text-slate-900 text-xs">{val}★</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Submitted Date',
      sortable: true,
      cellClassName: 'text-slate-500 text-xs',
      render: (val) => formatDateTime(val)
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      sortable: true,
      cellClassName: 'hidden md:table-cell text-slate-500 text-xs',
      headerClassName: 'hidden md:table-cell',
      render: (val) => formatDateTime(val)
    }
  ];

  if (loading && !dashboardData) {
    return <LoadingSpinner fullPage message="Loading store owner dashboard..." />;
  }

  if (stores.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto mt-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Stores Assigned</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Your account does not currently have any store assigned. Please contact the platform administrator to associate your store.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Store Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Store Owner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Store Ratings & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time customer ratings and review history for your assigned business.
          </p>
        </div>

        {/* Store Selector if multiple stores assigned */}
        {stores.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStoreId}
              onChange={handleStoreChange}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      {currentStore && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Store Name Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Store</span>
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-3 line-clamp-1">{currentStore.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{currentStore.address}</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Contact: {currentStore.email}
            </div>
          </div>

          {/* Average Rating Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Rating</span>
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
                  <Star className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {currentStore.totalRatings > 0 ? currentStore.avgRating.toFixed(1) : '—'}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <StarRating rating={currentStore.avgRating} size="sm" readOnly showValue={false} />
            </div>
          </div>

          {/* Total Ratings Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ratings</span>
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900">{currentStore.totalRatings}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Verified customer submissions
            </div>
          </div>
        </div>
      )}

      {/* Customer Ratings Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Ratings & Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of individual shopper ratings for {currentStore?.name}
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={ratings}
          loading={loading}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          emptyMessage="No customer ratings submitted for this store yet."
        />

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;
