
"use client"; 

export interface AnnouncementBar {
  id: string;
  userId: string;
  title: string;
  message: string;
  backgroundColor: string;
  textColor: string;
  imageUrl?: string;
  clicks: number;
  createdAt: string; 
  expiresAt?: string; // فیلد جدید برای تاریخ انقضا
}

// BarTemplate interface and barTemplates array are removed

const USER_BARS_STORAGE_KEY_PREFIX = 'zoombar_user_bars_';

export const getUserBars = (userId: string): AnnouncementBar[] => {
  if (typeof window === 'undefined') return [];
  const key = `${USER_BARS_STORAGE_KEY_PREFIX}${userId}`;
  const storedBars = localStorage.getItem(key);
  if (storedBars) {
    try {
      return JSON.parse(storedBars);
    } catch (e) {
      console.error("Error parsing user bars from localStorage", e);
      return [];
    }
  }
  return [];
};

const saveUserBars = (userId: string, bars: AnnouncementBar[]) => {
  if (typeof window === 'undefined') return;
  const key = `${USER_BARS_STORAGE_KEY_PREFIX}${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(bars));
  } catch (e) {
    console.error("Error saving user bars to localStorage", e);
  }
};

export const createAnnouncementBar = async (userId: string, barData: Omit<AnnouncementBar, 'id' | 'userId' | 'clicks' | 'createdAt'>): Promise<AnnouncementBar> => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 300));
  const userBars = getUserBars(userId);
  const newBar: AnnouncementBar = {
    ...barData, // includes expiresAt if provided
    id: Date.now().toString(), 
    userId,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };
  const updatedBars = [...userBars, newBar];
  saveUserBars(userId, updatedBars);
  return newBar;
};

export const updateAnnouncementBar = async (userId: string, updatedBar: AnnouncementBar): Promise<AnnouncementBar | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let userBars = getUserBars(userId);
  const barIndex = userBars.findIndex(bar => bar.id === updatedBar.id);
  if (barIndex === -1) return null;

  // Ensure expiresAt from the original editingBar is preserved if not explicitly changed
  userBars[barIndex] = { ...userBars[barIndex], ...updatedBar };
  saveUserBars(userId, userBars);
  return userBars[barIndex];
};

export const deleteAnnouncementBar = (userId: string, barId: string): boolean => {
  // This can remain sync for simplicity unless async is strictly needed for simulation
  let userBars = getUserBars(userId);
  const initialLength = userBars.length;
  userBars = userBars.filter(bar => bar.id !== barId);
  if (userBars.length < initialLength) {
    saveUserBars(userId, userBars);
    return true;
  }
  return false; 
};

export const recordBarClick = async (userId: string, barId: string): Promise<AnnouncementBar | null> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Shorter delay for click
  let userBars = getUserBars(userId);
  const barIndex = userBars.findIndex(bar => bar.id === barId);
  if (barIndex === -1) return null;

  userBars[barIndex].clicks += 1;
  saveUserBars(userId, userBars);
  return userBars[barIndex];
};
