import type { Exercise } from "../types";

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
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use the hash to generate HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
};

// Storage functions for persisting workout configuration
const STORAGE_KEY = "workout-timer-config";

export interface StoredConfig {
  exercises: Exercise[];
  sets: number;
  betweenSetRest: number;
  betweenExerciseRest: number;
}

export function loadStoredConfig(): StoredConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        exercises: Array.isArray(parsed.exercises) ? parsed.exercises : [],
        sets: typeof parsed.sets === "number" ? parsed.sets : 1,
        betweenSetRest:
          typeof parsed.betweenSetRest === "number" ? parsed.betweenSetRest : 0,
        betweenExerciseRest:
          typeof parsed.betweenExerciseRest === "number"
            ? parsed.betweenExerciseRest
            : 0,
      };
    }
  } catch (e) {
    console.error("Failed to load config from localStorage:", e);
  }
  return null;
}

export function saveConfig(config: StoredConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save config to localStorage:", e);
  }
}
