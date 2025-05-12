
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar'; // Added useSidebar
import { Icons } from '@/components/icons'; 
import { ThemeToggle } from '@/components/layout/ThemeToggle'; 
import { Button } from '@/components/ui/button'; // Added Button


function DashboardHeader() {
  const { user, isLoading } = useAuth();
  const { toggleSidebar, state: sidebarState, isMobile } = useSidebar();


  if (isLoading) return <div className="h-16 border-b flex items-center px-6"><Icons.Spinner className="animate-spin h-5 w-5" /></div>;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 justify-between">
      <div className="flex items-center gap-2">
        {/* Show sidebar trigger only if sidebar is collapsed or on mobile */}
        {(sidebarState === 'collapsed' || isMobile) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden" // Hidden on md+, but useSidebar handles actual logic for trigger in SidebarNav
          >
            <Icons.Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
         {/* Optional: Breadcrumbs or Page Title can go here */}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <div className="text-sm text-muted-foreground hidden sm:block"> {/* Hide on small screens if too crowded */}
            وارد شده با: <span className="font-semibold text-foreground">{user.email}</span>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login?next=/dashboard');
    } else if (!isLoading && user && user.role === 'admin') {
      // Allow admin to access user dashboard for testing if they navigate manually
      // router.replace('/admin/dashboard'); 
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) { // Simpler check, admin role check handled by admin layout
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.Spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultSide="right"> {/* Set default side to right for RTL */}
      <div className="flex min-h-screen w-full">
        <SidebarNav />
        <SidebarInset> 
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/20"> {/* Lightened background */}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

