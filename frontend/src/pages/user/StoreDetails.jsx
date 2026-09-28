import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import storeService from '../../services/storeService';
import ratingService from '../../services/ratingService';
import StarRating from '../../components/StarRating';
import RatingModal from '../../components/RatingModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { 
  Store, 
  MapPin, 
  Mail, 
  ArrowLeft, 
  Star, 
  CheckCircle2, 
  Edit3 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StoreDetails = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    setLoading(true);
    try {
      const res = await storeService.getStoreById(id);
      setStore(res.data);
    } catch {
      toast.error('Failed to load store details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (stars) => {
    if (!store) return;
    setSubmittingRating(true);

    try {
      const isUpdate = store.userSubmittedRating !== null;
      let res;
      if (isUpdate) {
        res = await ratingService.updateRating(store.id, stars);
        toast.success('Rating updated successfully!');
      } else {
        res = await ratingService.createRating(store.id, stars);
        toast.success('Rating submitted successfully!');
      }

      setStore((prev) => ({
        ...prev,
        userSubmittedRating: stars,
        avgRating: res.data?.avgRating ?? prev.avgRating,
        totalRatings: res.data?.totalRatings ?? prev.totalRatings
      }));

      setRatingModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating.';
      toast.error(msg);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading store details..." />;
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 font-semibold mb-4">Store not found.</p>
        <Link to="/dashboard" className="text-brand-600 text-sm hover:underline">
          Return to Stores Directory
        </Link>
      </div>
    );
  }

  const hasUserRated = store.userSubmittedRating !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Stores</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{store.email}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="py-6 space-y-4 text-xs border-b border-slate-100">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Store Location
            </span>
            <p className="text-slate-800 flex items-start gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>{store.address}</span>
            </p>
          </div>
        </div>

        {/* Rating Section */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Overall Community Score
            </span>
            <div className="flex items-center gap-3 mt-1">
              <StarRating rating={store.avgRating} size="lg" readOnly showValue={false} />
              <div>
                <span className="text-xl font-extrabold text-slate-900">
                  {store.totalRatings > 0 ? store.avgRating.toFixed(1) : 'No Ratings'}
                </span>
                <span className="text-xs text-slate-400 ml-1.5">
                  ({store.totalRatings} verified review{store.totalRatings === 1 ? '' : 's'})
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRatingModalOpen(true)}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
              hasUserRated
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-brand-600/20'
            }`}
          >
            {hasUserRated ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Modify Your Rating ({store.userSubmittedRating}★)</span>
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                <span>Submit Rating</span>
              </>
            )}
          </button>
        </div>
      </div>

      <RatingModal
        isOpen={ratingModalOpen}
        store={store}
        initialRating={store.userSubmittedRating || 0}
        isUpdate={hasUserRated}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        loading={submittingRating}
      />
    </div>
  );
};

export default StoreDetails;
