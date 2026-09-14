export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  // Assume HH:MM format
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const statusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': case 'PRESENT': case 'COMPLETED': case 'PAID':
      return 'badge-success';
    case 'INACTIVE': case 'CANCELLED': case 'ABSENT': case 'OVERDUE': case 'EXPIRED':
      return 'badge-danger';
    case 'SUSPENDED': case 'DROPPED': case 'LATE': case 'PARTIALLY PAID': case 'ONGOING':
      return 'badge-warning';
    default:
      return 'badge-gray';
  }
};

export const gradeColor = (grade) => {
  switch (grade) {
    case 'A+': case 'A': return 'text-green-600 bg-green-100';
    case 'B+': case 'B': return 'text-blue-600 bg-blue-100';
    case 'C': return 'text-yellow-600 bg-yellow-100';
    case 'D': return 'text-orange-600 bg-orange-100';
    case 'F': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};
