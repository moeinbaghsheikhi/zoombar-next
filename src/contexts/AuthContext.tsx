
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser as libGetCurrentUser, signIn as mockSignIn, signUp as mockSignUp, signOut as mockSignOut, type User } from '@/lib/mockAuth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<User | null>;
  signUp: (email: string, password?: string) => Promise<User | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const syncUser = useCallback(() => {
    const currentUser = libGetCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
    };
  }, [syncUser]);

  const signIn = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    const signedInUser = await mockSignIn(email, password);
    setUser(signedInUser);
    setIsLoading(false);
    if (signedInUser) {
      if (signedInUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
    return signedInUser;
  }, [router]);

  const signUp = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    const signedUpUser = await mockSignUp(email, password);
    setUser(signedUpUser);
    setIsLoading(false);
    if (signedUpUser) {
      // New users are 'user' role, so redirect to user dashboard
      router.push('/dashboard');
    }
    return signedUpUser;
  }, [router]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    await mockSignOut();
    setUser(null);
    setIsLoading(false);
    // Ensure redirection happens even if current page is an auth page
    if (pathname.startsWith('/auth')) {
        router.push('/auth/login');
    } else {
        router.replace('/auth/login'); // Use replace to prevent back button to protected page
    }
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
