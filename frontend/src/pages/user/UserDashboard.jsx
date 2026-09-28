import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import storeService from '../../services/storeService';
import ratingService from '../../services/ratingService';
import SearchBar from '../../components/SearchBar';
import StarRating from '../../components/StarRating';
import RatingModal from '../../components/RatingModal';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Store, 
  MapPin, 
  Star, 
  RotateCcw, 
  Edit3, 
  CheckCircle2, 
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1
  });

  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');

  // Rating Modal state
  const [selectedStoreForRating, setSelectedStoreForRating] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order,
        ...(search && { search }),
        ...(nameFilter && { name: nameFilter }),
        ...(addressFilter && { address: addressFilter })
      };

      const res = await storeService.getStores(params);
      setStores(res.data || []);
      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: res.pagination.total,
          totalPages: res.pagination.totalPages
        }));
      }
    } catch (err) {
      toast.error('Failed to load stores.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, order, search, nameFilter, addressFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSearchSubmit = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchStores();
  };

  const handleResetSearch = () => {
    setSearch('');
    setNameFilter('');
    setAddressFilter('');
    setSortBy('name');
    setOrder('ASC');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOpenRatingModal = (store) => {
    setSelectedStoreForRating(store);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async (stars) => {
    if (!selectedStoreForRating) return;
    setSubmittingRating(true);

    try {
      const isUpdate = selectedStoreForRating.userSubmittedRating !== null;
      let res;
      if (isUpdate) {
        res = await ratingService.updateRating(selectedStoreForRating.id, stars);
        toast.success('Your rating has been updated successfully!');
      } else {
        res = await ratingService.createRating(selectedStoreForRating.id, stars);
        toast.success('Thank you! Your rating was submitted.');
      }

      // Optimistically or smoothly update the store record in local state
      setStores((prev) =>
        prev.map((s) => {
          if (s.id === selectedStoreForRating.id) {
            return {
              ...s,
              userSubmittedRating: stars,
              avgRating: res.data?.avgRating ?? s.avgRating,
              totalRatings: res.data?.totalRatings ?? s.totalRatings
            };
          }
          return s;
        })
      );

      setRatingModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating.';
      toast.error(msg);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-navy-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="text-xs uppercase font-bold text-brand-400 tracking-wider">
            Verified Community Reviews
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mt-1 mb-2 tracking-tight">
            Discover & Rate Stores
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Search nearby stores, submit honest ratings from 1 to 5 stars, and help others find the best local businesses.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
          <Store className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Search & Sort Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearchSubmit}
          onClear={() => {
            setSearch('');
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          placeholder="Search stores by name or address..."
          className="flex-1 max-w-xl"
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span>Sort:</span>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
            >
              <option value="name-ASC">Store Name (A-Z)</option>
              <option value="name-DESC">Store Name (Z-A)</option>
              <option value="avg_rating-DESC">Highest Rated</option>
              <option value="rating_count-DESC">Most Reviewed</option>
            </select>
          </div>

          {(search || sortBy !== 'name' || order !== 'ASC') && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Stores Grid / State */}
      {loading ? (
        <LoadingSpinner message="Searching registered stores..." />
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No stores found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            We couldn't find any store matching your search criteria. Try a different query.
          </p>
          <button
            type="button"
            onClick={handleResetSearch}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const hasUserRated = store.userSubmittedRating !== null;

            return (
              <div
                key={store.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Store Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                      <Store className="w-6 h-6" />
                    </div>
                    {hasUserRated && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>You Rated: {store.userSubmittedRating}★</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {store.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{store.address}</span>
                  </p>
                </div>

                {/* Overall Rating & Action Footer */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Overall Rating
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={store.avgRating} size="sm" readOnly showValue={false} />
                        <span className="font-bold text-slate-900 text-sm">
                          {store.totalRatings > 0 ? store.avgRating.toFixed(1) : '—'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({store.totalRatings} review{store.totalRatings === 1 ? '' : 's'})
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenRatingModal(store)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                      hasUserRated
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-brand-600/20'
                    }`}
                  >
                    {hasUserRated ? (
                      <>
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Modify My Rating ({store.userSubmittedRating}★)</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5" />
                        <span>Rate This Store</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {/* Rating Submission / Edit Modal */}
      <RatingModal
        isOpen={ratingModalOpen}
        store={selectedStoreForRating}
        initialRating={selectedStoreForRating?.userSubmittedRating || 0}
        isUpdate={selectedStoreForRating?.userSubmittedRating !== null}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        loading={submittingRating}
      />
    </div>
  );
};

export default UserDashboard;
