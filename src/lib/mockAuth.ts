
// For demo purposes, this uses localStorage.
// In a real application, use a proper authentication backend.

const USER_STORAGE_KEY = 'zoombar_user';
const ALL_USERS_STORAGE_KEY = 'zoombar_all_users'; // To check for existing emails

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

// Helper to get all users (for checking existing email)
const getAllUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const storedUsers = localStorage.getItem(ALL_USERS_STORAGE_KEY);
  return storedUsers ? JSON.parse(storedUsers) : [];
};

// Helper to save all users
const saveAllUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(users));
};


export const signUp = async (email: string, password?: string): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (typeof window === 'undefined') return null;

  const allUsers = getAllUsers();
  const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    console.warn(`ایمیل از قبل وجود دارد: ${email}`);
    throw new Error("Email already exists"); // More specific error
  }
  
  if (email.toLowerCase() === 'admin@example.com' || email.toLowerCase() === 'user@example.com') {
      console.warn(`تلاش برای ثبت نام با ایمیل رزرو شده: ${email}`);
      throw new Error("Cannot sign up with this email.");
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    role: 'user',
  };

  allUsers.push(newUser);
  saveAllUsers(allUsers);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser)); // Also set current user
  return newUser;
};

export const signIn = async (email: string, password?: string): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (typeof window === 'undefined') return null;

  const lowerEmail = email.toLowerCase();

  if (lowerEmail === 'admin@example.com' && password === '12345678') {
    const adminUser: User = { id: 'admin-special-id', email, role: 'admin' };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(adminUser));
    // Ensure admin is in all_users list too, if not already
    const allUsers = getAllUsers();
    if (!allUsers.find(u => u.email.toLowerCase() === lowerEmail)) {
        allUsers.push(adminUser);
        saveAllUsers(allUsers);
    }
    return adminUser;
  }

  if (lowerEmail === 'user@example.com' && password === '12345678') {
    const regularUser: User = { id: 'user-special-id', email, role: 'user' };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(regularUser));
     // Ensure user is in all_users list too, if not already
    const allUsers = getAllUsers();
    if (!allUsers.find(u => u.email.toLowerCase() === lowerEmail)) {
        allUsers.push(regularUser);
        saveAllUsers(allUsers);
    }
    return regularUser;
  }
  
  const allUsers = getAllUsers();
  const foundUser = allUsers.find(u => u.email.toLowerCase() === lowerEmail);

  if (foundUser) {
    // This simple mock doesn't store/check passwords for generically signed-up users beyond the special ones
    // For generically signed up users, we assume password check passed if user is found (for demo)
     if (!foundUser.role) { // Ensure role consistency
        foundUser.role = 'user'; 
        saveAllUsers(allUsers); // Persist role change in the list
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser));
    return foundUser;
  }

  return null;
};

export const signOut = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser) {
    try {
      const user: User = JSON.parse(storedUser);
      if (!user.role) {
        user.role = user.email.toLowerCase() === 'admin@example.com' ? 'admin' : 'user';
      }
      return user;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }
  return null;
};
