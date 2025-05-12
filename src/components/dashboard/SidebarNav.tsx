"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons, ZoomBarLogo } from '@/components/icons';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { href: '/dashboard', label: 'مرور کلی', icon: Icons.Dashboard },
  { href: '/dashboard/statistics', label: 'آمار', icon: Icons.Reports }, // Using Reports icon
  { href: '/dashboard/create', label: 'ایجاد نوار', icon: Icons.Create },
  // { href: '#', label: 'زمان‌بندی من', icon: Icons.MySchedule }, // Example based on image
  // { href: '#', label: 'مدیریت رویدادها', icon: Icons.ManageEvents }, // Example
  // { href: '#', label: 'تقویم', icon: Icons.Calendar }, // Example
  // { href: '#', label: 'افراد', icon: Icons.People }, // Example
];

const secondaryNavItems = [
  // { href: '#', label: 'اطلاعیه‌ها', icon: Icons.Notification, badge: '5' }, // Example
  // { href: '#', label: 'اسناد', icon: Icons.Documents }, // Example
  // { href: '#', label: 'راهنما', icon: Icons.Help }, // Example
];

function UserProfileSection() {
  const { user, signOut } = useAuth();
  const { state: sidebarState, isMobile } = useSidebar();

  if (!user) return null;
  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
  const userName = user.email.split('@')[0]; // Simple way to get a name part

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-start h-auto p-2", // Increased padding
                (sidebarState === 'collapsed' && !isMobile) && "justify-center p-0 w-11 h-11 aspect-square" // Adjusted collapsed size
              )}
              aria-label="منوی کاربر"
            >
              <div className="flex items-center gap-3"> {/* Increased gap */}
                <Avatar className="h-8 w-8 shrink-0"> {/* Kept avatar size */}
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <div className={cn("flex-grow overflow-hidden", (sidebarState === 'collapsed' && !isMobile) && "hidden")}>
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p> {/* Changed font-semibold to font-medium */}
                  <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
                </div>
                 {!((sidebarState === 'collapsed' && !isMobile)) && <Icons.Settings className="h-4 w-4 text-sidebar-foreground/70 shrink-0" /> }
              </div>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="left" hidden={(sidebarState === 'expanded' || isMobile)}>
            <p>{user.email}</p>
            <p className="text-xs text-muted-foreground">کلیک برای گزینه‌ها</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent side="top" align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 text-start">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.role === 'admin' ? 'حساب ادمین' : 'کاربر عادی'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <Icons.Logout className="me-2 h-4 w-4" />
          <span>خروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { state: sidebarState, isMobile, side } = useSidebar();

  // دکمه بازکننده سایدبار فقط وقتی بسته است نمایش داده شود
  return (
    <>
      {sidebarState === "collapsed" && (
        <SidebarTrigger
          style={{
            position: "fixed",
            top: "1rem",
            [side === "right" ? "right" : "left"]: 0,
            zIndex: 100,
          }}
        />
      )}
      <Sidebar collapsible="icon" side="right" variant="inset">
        <SidebarHeader className="flex items-center justify-between p-3 border-b border-sidebar-border h-16">
          <div className={cn("flex items-center gap-2", (sidebarState === 'collapsed' && !isMobile) && "hidden")}>
            <ZoomBarLogo size="md" showSubtitle={true} />
          </div>
          <Link href="/dashboard" className={cn("flex items-center justify-center", (sidebarState === 'expanded' || isMobile) && "hidden")}>
              <Icons.Logo className="h-7 w-7 text-primary" />
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu className="gap-1"> {/* Added gap-1 for spacing between items */}
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && item.href !== '#' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, side: "left" }}
                   className="h-10" // Ensure button height consistency
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          {/* <SidebarSeparator className="my-3" /> */}

          {/* <SidebarMenu className="gap-1">
             {secondaryNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={item.href !== '#' && pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: "left" }}
                  className="h-10" // Ensure button height consistency
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu> */}
        </SidebarContent>
        
        <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
          {user && <UserProfileSection />}
           {user?.role === 'user' && ( // For testing purposes, allow normal user to see admin link
                <SidebarMenu className={cn("mt-1", (sidebarState === 'collapsed' && !isMobile) && "border-t border-sidebar-border pt-1")}>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={{children: "پنل ادمین (تست)", side: "left"}} className="h-10">
                    <Link href="/admin/dashboard">
                      <Icons.Settings /> 
                      <span>پنل ادمین</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                </SidebarMenu>
              )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
