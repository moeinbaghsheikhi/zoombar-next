
"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null; 

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">خوش آمدید، {user.email}!</h1>
          <p className="text-muted-foreground">در اینجا یک نمای کلی از فعالیت شما در زوم‌بار لایت آمده است.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create">
            <Icons.Create className="me-2 h-4 w-4" /> {/* Changed ml-2 to me-2 for RTL */}
            ایجاد نوار جدید
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مجموع نوارهای ایجاد شده</CardTitle>
            <Icons.Megaphone className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">
              شما هنوز هیچ نواری ایجاد نکرده‌اید.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مجموع کلیک‌ها</CardTitle>
            <Icons.View className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">
              در تمام نوارهای اعلانات شما.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اقدامات سریع</CardTitle>
            <Icons.Zap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
             <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/create"><Icons.Create className="me-2 h-4 w-4" /> ایجاد نوار جدید</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/statistics"><Icons.Statistics className="me-2 h-4 w-4" /> مشاهده آمار</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
            <CardTitle>با قالب‌ها شروع کنید</CardTitle>
            <CardDescription>قالب‌های از پیش طراحی شده ما را برای شروع سریع نوارهای اعلانات خود کاوش کنید.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                    <div key={i} className="border rounded-lg p-4 space-y-2 bg-secondary/30">
                        <Image src={`https://picsum.photos/seed/overview${i}/300/100`} alt={`قالب ${i}`} width={300} height={100} className="rounded" data-ai-hint="abstract design" />
                        <h3 className="font-semibold">قالب {i}</h3>
                        <Button size="sm" asChild><Link href="/dashboard/create">استفاده از قالب</Link></Button>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
