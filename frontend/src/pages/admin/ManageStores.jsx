import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';
import StarRating from '../../components/StarRating';
import { formatDate } from '../../utils/formatters';
import { 
  Store, 
  PlusCircle, 
  Filter, 
  RotateCcw, 
  User, 
  MapPin, 
  Mail,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const [filters, setFilters] = useState({
    search: '',
    name: '',
    email: '',
    address: ''
  });

  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [showFilters, setShowFilters] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order,
        ...(filters.search && { search: filters.search }),
        ...(filters.name && { name: filters.name }),
        ...(filters.email && { email: filters.email }),
        ...(filters.address && { address: filters.address })
      };

      const res = await adminService.getStores(params);
      setStores(res.data || []);
      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: res.pagination.total,
          totalPages: res.pagination.totalPages
        }));
      }
    } catch (err) {
      toast.error('Failed to load store list.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, order, filters]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      name: '',
      email: '',
      address: ''
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field, newOrder) => {
    setSortBy(field);
    setOrder(newOrder);
  };

  const columns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">{val}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 sm:hidden">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Store Email',
      sortable: true,
      cellClassName: 'hidden sm:table-cell',
      headerClassName: 'hidden sm:table-cell',
      render: (val) => <span className="text-slate-600 font-medium text-xs">{val}</span>
    },
    {
      key: 'address',
      label: 'Store Address',
      sortable: true,
      cellClassName: 'hidden md:table-cell max-w-xs',
      headerClassName: 'hidden md:table-cell',
      render: (val) => <span className="text-slate-500 text-xs line-clamp-1">{val}</span>
    },
    {
      key: 'ownerName',
      label: 'Assigned Owner',
      sortable: false,
      render: (val, row) => (
        val ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{val}</span>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 italic">Unassigned</span>
        )
      )
    },
    {
      key: 'avg_rating',
      label: 'Overall Rating',
      sortable: true,
      align: 'right',
      render: (_, row) => (
        <div className="flex flex-col items-end">
          {row.totalRatings > 0 ? (
            <div className="flex items-center gap-1.5">
              <StarRating rating={row.avgRating} size="xs" readOnly showValue={false} />
              <span className="font-bold text-slate-800 text-xs">
                {row.avgRating.toFixed(1)} <span className="text-slate-400 text-[10px]">({row.totalRatings})</span>
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No ratings yet</span>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      cellClassName: 'hidden lg:table-cell text-slate-500 text-xs',
      headerClassName: 'hidden lg:table-cell',
      render: (val) => formatDate(val)
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Stores</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View, search, filter, and inspect all registered stores on the platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              showFilters
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <Link
            to="/admin/stores/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Store</span>
          </Link>
        </div>
      </div>

      {/* Search Bar & Reset */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SearchBar
          value={filters.search}
          onChange={(val) => handleFilterChange('search', val)}
          onSearch={fetchStores}
          onClear={() => handleFilterChange('search', '')}
          placeholder="Search by store name, email, or address..."
        />

        <div className="flex items-center gap-2">
          {Object.values(filters).some((v) => v !== '') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Store Name</label>
            <input
              type="text"
              placeholder="e.g. Nexus Electronics"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Email</label>
            <input
              type="text"
              placeholder="e.g. support@store.com"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Address</label>
            <input
              type="text"
              placeholder="e.g. Market Square"
              value={filters.address}
              onChange={(e) => handleFilterChange('address', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={stores}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        emptyMessage="No stores found matching your query."
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
  );
};

export default ManageStores;
