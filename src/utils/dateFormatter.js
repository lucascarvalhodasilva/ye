export const formatDate = (dateString) => {
  if (!dateString) return '';
  // Parse YYYY-MM-DD manually to ensure local time interpretation
  // and avoid timezone shifts when using new Date(string)
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};
