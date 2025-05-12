
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons, ZoomBarLogo } from '@/components/icons';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Removed AvatarImage as it's not used
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React from "react";
import { ThemeToggle } from './ThemeToggle'; // Added ThemeToggle

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
  <Button variant="ghost" asChild>
    <Link href={href} onClick={onClick}>{children}</Link>
  </Button>
);

const UserMenu = () => {
  const { user, signOut, isLoading } = useAuth();

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!user) return null;

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : '?';
  const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
  const dashboardLabel = user.role === 'admin' ? 'پنل ادمین' : 'داشبورد';

  return (
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
          <div className="flex flex-col space-y-1 text-start">
            <p className="text-sm font-medium leading-none">وارد شده با حساب</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardPath}>
            <Icons.Dashboard className="ms-2 h-4 w-4" />
            <span>{dashboardLabel}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <Icons.Logout className="ms-2 h-4 w-4" />
          <span>خروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export function Header() {
  const { user, signOut, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const commonLinks = (
    <>
      <NavLink href="/#features" onClick={() => setIsMobileMenuOpen(false)}>ویژگی‌ها</NavLink>
      {/* <NavLink href="/#pricing" onClick={() => setIsMobileMenuOpen(false)}>قیمت‌گذاری</NavLink> */}
      {/* <NavLink href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>تماس با ما</NavLink> */}
    </>
  );
  
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
  const dashboardLabel = user?.role === 'admin' ? 'پنل ادمین' : 'داشبورد';

  const authLinksDesktop = isLoading ? (
    <Skeleton className="h-9 w-20" />
  ) : user ? (
    <UserMenu />
  ) : (
    <>
      <Button variant="outline" asChild>
        <Link href="/auth/login">ورود</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">ثبت نام</Link>
      </Button>
    </>
  );
  
  const authLinksMobile = isLoading ? (
     <div className="flex flex-col space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
  ) : user ? (
    <>
      <Button variant="ghost" asChild onClick={() => setIsMobileMenuOpen(false)} className="justify-start">
        <Link href={dashboardPath}>{dashboardLabel}</Link>
      </Button>
      <Button variant="outline" onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="w-full justify-center">خروج</Button>
    </>
  ) : (
     <>
      <Button variant="outline" asChild onClick={() => setIsMobileMenuOpen(false)} className="w-full justify-center">
        <Link href="/auth/login">ورود</Link>
      </Button>
      <Button asChild onClick={() => setIsMobileMenuOpen(false)} className="w-full justify-center">
        <Link href="/auth/signup">ثبت نام</Link>
      </Button>
    </>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center"> {/* Group logo and theme toggle */}
          <Link href="/" className="me-6 flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
            <ZoomBarLogo />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 mx-auto">
          {commonLinks}
        </nav>

        <div className="flex items-center space-x-2"> {/* Contains auth links and theme toggle */}
          <div className="hidden md:flex items-center space-x-2">
            {authLinksDesktop}
          </div>
          <ThemeToggle /> {/* Added ThemeToggle */}
          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icons.Menu className="h-6 w-6" />
                  <span className="sr-only">باز کردن منو</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]"> {/* Changed side to left for RTL */}
                <div className="p-4">
                  <Link href="/" className="mb-4 block" onClick={() => setIsMobileMenuOpen(false)}>
                    <ZoomBarLogo />
                  </Link>
                  <nav className="flex flex-col space-y-3">
                    {commonLinks}
                    <div className="flex flex-col space-y-3 pt-4 border-t">
                      {authLinksMobile}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
