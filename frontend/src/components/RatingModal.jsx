import React, { useState, useEffect } from 'react';
import { X, Star, Store as StoreIcon } from 'lucide-react';
import StarRating from './StarRating';

export const RatingModal = ({
  isOpen = false,
  store = null,
  initialRating = 0,
  isUpdate = false,
  onClose = () => {},
  onSubmit = () => {},
  loading = false
}) => {
  const [selectedRating, setSelectedRating] = useState(initialRating || 0);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedRating(initialRating || 0);
    setError('');
  }, [isOpen, initialRating, store]);

  if (!isOpen || !store) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }
    setError('');
    onSubmit(selectedRating);
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 1: return '1 Star - Poor experience';
      case 2: return '2 Stars - Fair experience';
      case 3: return '3 Stars - Good / Average';
      case 4: return '4 Stars - Very Good';
      case 5: return '5 Stars - Excellent / Outstanding';
      default: return 'Click a star to rate';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 transform transition-all animate-scaleUp">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
              <StoreIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {isUpdate ? 'Update Your Rating' : 'Rate This Store'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{store.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center text-center">
          <p className="text-sm text-slate-600 mb-6">
            How would you rate your overall experience with <span className="font-semibold text-slate-800">{store.name}</span>?
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl w-full flex flex-col items-center justify-center gap-2 mb-4 border border-slate-100">
            <StarRating
              rating={selectedRating}
              size="xl"
              readOnly={false}
              onChange={(val) => {
                setSelectedRating(val);
                setError('');
              }}
              showValue={false}
            />
            <span className="text-xs font-semibold text-amber-600 transition-all h-4">
              {getRatingLabel(selectedRating)}
            </span>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 mb-4 animate-fadeIn">{error}</p>
          )}

          <div className="flex items-center gap-3 w-full mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedRating === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting...' : isUpdate ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
