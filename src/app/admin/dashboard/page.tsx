
// src/app/admin/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';


export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">داشبورد ادمین</h1>
          <p className="text-muted-foreground">مدیریت تنظیمات برنامه و مشاهده نمای کلی.</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>خوش آمدید، {user?.email || 'ادمین'}!</CardTitle>
          <CardDescription>این پنل کنترل ادمین است. ویژگی‌های بیشتر به زودی اضافه خواهد شد.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>شما دسترسی‌های مدیریتی برای مدیریت زوم‌بار لایت را دارید.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
                <CardTitle className="text-lg mb-2 flex items-center"><Icons.Settings className="me-2 h-5 w-5 text-primary"/> تنظیمات برنامه</CardTitle>
                <CardDescription className="mb-3">پیکربندی تنظیمات کلی برنامه.</CardDescription>
                <Button variant="outline" disabled>رفتن به تنظیمات (به زودی)</Button>
            </Card>
            <Card className="p-4">
                <CardTitle className="text-lg mb-2 flex items-center"><Icons.Users className="me-2 h-5 w-5 text-primary"/> مدیریت کاربران</CardTitle>
                <CardDescription className="mb-3">مشاهده و مدیریت حساب‌های کاربری.</CardDescription>
                <Button variant="outline" disabled>مدیریت کاربران (به زودی)</Button>
            </Card>
             <Card className="p-4">
                <CardTitle className="text-lg mb-2 flex items-center"><Icons.Statistics className="me-2 h-5 w-5 text-primary"/> تحلیل سیستم</CardTitle>
                <CardDescription className="mb-3">عملکرد کلی سیستم و تحلیل‌ها.</CardDescription>
                <Button variant="outline" disabled>مشاهده تحلیل‌ها (به زودی)</Button>
            </Card>
            <Card className="p-4">
                <CardTitle className="text-lg mb-2 flex items-center"><Icons.Megaphone className="me-2 h-5 w-5 text-primary"/> اطلاعیه‌های عمومی</CardTitle>
                <CardDescription className="mb-3">ایجاد اطلاعیه برای تمام کاربران.</CardDescription>
                <Button variant="outline" disabled>مدیریت اطلاعیه‌ها (به زودی)</Button>
            </Card>
          </div>
           <div className="mt-6">
             <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <Icons.Dashboard className="me-2 h-4 w-4" />
                مشاهده داشبورد کاربر (برای تست نقش‌ها)
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

