import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';
import { getRoleBadgeClass, formatDate } from '../../utils/formatters';
import { 
  Users, 
  PlusCircle, 
  Filter, 
  RotateCcw, 
  Eye, 
  Store,
  ShieldCheck,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
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
    address: '',
    role: ''
  });

  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(async () => {
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
        ...(filters.address && { address: filters.address }),
        ...(filters.role && { role: filters.role })
      };

      const res = await adminService.getUsers(params);
      setUsers(res.data || []);
      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: res.pagination.total,
          totalPages: res.pagination.totalPages
        }));
      }
    } catch (err) {
      toast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, order, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      name: '',
      email: '',
      address: '',
      role: ''
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
      label: 'User Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
            {val.charAt(0).toUpperCase()}
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
      label: 'Email Address',
      sortable: true,
      cellClassName: 'hidden sm:table-cell',
      headerClassName: 'hidden sm:table-cell',
      render: (val) => <span className="text-slate-600 font-medium">{val}</span>
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      cellClassName: 'hidden md:table-cell max-w-xs',
      headerClassName: 'hidden md:table-cell',
      render: (val) => <span className="text-slate-500 text-xs line-clamp-1">{val}</span>
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getRoleBadgeClass(val)}`}>
          {val}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      cellClassName: 'hidden lg:table-cell text-slate-500 text-xs',
      headerClassName: 'hidden lg:table-cell',
      render: (val) => formatDate(val)
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <Link
          to={`/admin/users/${row.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 text-xs font-semibold transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, filter and inspect all registered accounts in the system.
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
            to="/admin/users/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add User</span>
          </Link>
        </div>
      </div>

      {/* Search & Quick Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SearchBar
          value={filters.search}
          onChange={(val) => handleFilterChange('search', val)}
          onSearch={fetchUsers}
          onClear={() => handleFilterChange('search', '')}
          placeholder="Search by name, email, or address..."
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
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Name</label>
            <input
              type="text"
              placeholder="e.g. Jonathan"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Email</label>
            <input
              type="text"
              placeholder="e.g. @example.com"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Address</label>
            <input
              type="text"
              placeholder="e.g. Seattle or Suite"
              value={filters.address}
              onChange={(e) => handleFilterChange('address', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Roles</option>
              <option value="USER">Shopper (USER)</option>
              <option value="OWNER">Store Owner (OWNER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>
          </div>
        </div>
      )}

      {/* Users Data Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        emptyMessage="No users found matching your search criteria."
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

export default ManageUsers;
