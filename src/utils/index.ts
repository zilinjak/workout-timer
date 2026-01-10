export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
    return mins * 60 + secs;
  }
  return parseInt(timeStr) || 0;
};

// Generate a consistent color from a string (exercise name)
export const getColorFromName = (name: string): string => {
  // Normalize the name (lowercase, trim)
  const normalizedName = name.toLowerCase().trim();
  
  // Generate a hash from the string
  let hash = 0;
  for (let i = 0; i < normalizedName.length; i++) {
    const char = normalizedName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use the hash to generate HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
};
