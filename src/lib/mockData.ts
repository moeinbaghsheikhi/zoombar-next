
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
  expiresAt?: string;
  timerBackgroundColor?: string; // New: Timer box background color
  timerTextColor?: string;     // New: Timer box text color
  timerStyle?: 'square' | 'circle' | 'none'; // New: Timer box style
}

const USER_BARS_STORAGE_KEY_PREFIX = 'zoombar_user_bars_';

export const getUserBars = (userId: string): AnnouncementBar[] => {
  if (typeof window === 'undefined') return [];
  const key = `${USER_BARS_STORAGE_KEY_PREFIX}${userId}`;
  const storedBars = localStorage.getItem(key);
  if (storedBars) {
    try {
      return JSON.parse(storedBars).map((bar: AnnouncementBar) => ({
        ...bar,
        timerBackgroundColor: bar.timerBackgroundColor || '#FC4C1D', // Default primary
        timerTextColor: bar.timerTextColor || '#FFFFFF',           // Default primary-foreground
        timerStyle: bar.timerStyle || 'square',                     // Default square
      }));
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
  await new Promise(resolve => setTimeout(resolve, 300));
  const userBars = getUserBars(userId);
  const newBar: AnnouncementBar = {
    title: barData.title,
    message: barData.message,
    backgroundColor: barData.backgroundColor,
    textColor: barData.textColor,
    imageUrl: barData.imageUrl,
    expiresAt: barData.expiresAt,
    timerBackgroundColor: barData.timerBackgroundColor || '#FC4C1D',
    timerTextColor: barData.timerTextColor || '#FFFFFF',
    timerStyle: barData.timerStyle || 'square',
    id: Date.now().toString(), 
    userId,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };
  const updatedBars = [...userBars, newBar];
  saveUserBars(userId, updatedBars);
  return newBar;
};

export const updateAnnouncementBar = async (userId: string, updatedBarData: Partial<AnnouncementBar> & { id: string }): Promise<AnnouncementBar | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let userBars = getUserBars(userId);
  const barIndex = userBars.findIndex(bar => bar.id === updatedBarData.id);
  if (barIndex === -1) return null;

  userBars[barIndex] = { 
    ...userBars[barIndex], 
    ...updatedBarData,
    // Ensure defaults are applied if somehow missing during update
    timerBackgroundColor: updatedBarData.timerBackgroundColor || userBars[barIndex].timerBackgroundColor || '#FC4C1D',
    timerTextColor: updatedBarData.timerTextColor || userBars[barIndex].timerTextColor || '#FFFFFF',
    timerStyle: updatedBarData.timerStyle || userBars[barIndex].timerStyle || 'square',
  };
  saveUserBars(userId, userBars);
  return userBars[barIndex];
};

export const deleteAnnouncementBar = (userId: string, barId: string): boolean => {
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
  await new Promise(resolve => setTimeout(resolve, 100)); 
  let userBars = getUserBars(userId);
  const barIndex = userBars.findIndex(bar => bar.id === barId);
  if (barIndex === -1) return null;

  userBars[barIndex].clicks += 1;
  saveUserBars(userId, userBars);
  return userBars[barIndex];
};
