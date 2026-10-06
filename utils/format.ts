export const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m yang lalu`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}j yang lalu`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Kemarin";
  if (diffInDays < 7) return `${diffInDays}h yang lalu`;
  
  return date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
};
