export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRating = (rating) => {
  if (rating === null || rating === undefined || rating === 0) {
    return 'No ratings yet';
  }
  return `${Number(rating).toFixed(1)} / 5`;
};

export const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'OWNER':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'USER':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};
