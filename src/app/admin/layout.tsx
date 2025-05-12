
// src/app/admin/layout.tsx
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/icons';
import { ZoomBarLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton'; // Added Skeleton import
import { ThemeToggle } from '@/components/layout/ThemeToggle'; // Added ThemeToggle

function AdminHeader() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading && !user) return <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6"><Icons.Spinner className="animate-spin h-5 w-5" /> <Skeleton className="h-8 w-24" /></div>;
  
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
      <Link href="/admin/dashboard" className="flex items-center gap-2">
        <ZoomBarLogo /> 
        <span className="font-semibold text-primary hidden sm:inline">[پنل ادمین]</span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 text-start"> {/* Ensure text aligns start for RTL */}
                  <p className="text-sm font-medium leading-none">حساب ادمین</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <Icons.Logout className="me-2 h-4 w-4" /> {/* Adjusted margin for RTL */}
                <span>خروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
         {!user && !isLoading && (
            <Button asChild size="sm">
                <Link href="/auth/login">ورود</Link>
            </Button>
        )}
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/auth/login?error=unauthenticated&next=/admin/dashboard'); 
      } else if (user.role !== 'admin') {
        router.replace('/dashboard?error=unauthorized'); 
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user?.role !== 'admin') {
    return (
      <div className="flex h-screen flex-col">
        <AdminHeader /> 
        <div className="flex flex-1 items-center justify-center">
            <Icons.Spinner className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/40">
            {children}
        </main>
    </div>
  );
}
