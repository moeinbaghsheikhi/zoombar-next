
"use client";

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'; // Tooltip از recharts حذف شد چون از shadcn استفاده می‌شود
import type { AnnouncementBar } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale'; 
import Link from 'next/link';

interface StatsDisplayProps {
  bars: AnnouncementBar[];
  onEditBar: (bar: AnnouncementBar) => void;
  onDeleteBarRequest: (barId: string) => void;
  onBarSelectForSnippet: (bar: AnnouncementBar) => void;
}

export function StatsDisplay({ bars, onEditBar, onDeleteBarRequest, onBarSelectForSnippet }: StatsDisplayProps) {
  const chartData = useMemo(() => {
    return bars.map(bar => ({
      name: bar.title.length > 20 ? bar.title.substring(0, 17) + '...' : bar.title,
      کلیک‌ها: bar.clicks, // تغییر نام کلید برای نمایش در نمودار
    })).sort((a,b) => b['کلیک‌ها'] - a['کلیک‌ها']).slice(0, 10);
  }, [bars]);

  if (bars.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <Icons.Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle>هنوز هیچ نوار اعلانی وجود ندارد</CardTitle>
          <CardDescription>
            شما هنوز هیچ نوار اعلانی ایجاد نکرده‌اید. یکی ایجاد کنید تا آمار آن را اینجا ببینید و کد جاسازی دریافت کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild>
                <Link href="/dashboard/create">
                    <Icons.Create className="me-2 h-4 w-4" /> 
                    اولین نوار خود را ایجاد کنید
                </Link>
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>کلیک‌ها برای هر نوار اعلانات</CardTitle>
          <CardDescription>عملکرد برترین نوارهای اعلانات شما بر اساس کلیک. برای دریافت کد جاسازی روی یک ردیف در جدول پایین کلیک کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={{ 'کلیک‌ها': { label: "کلیک‌ها", color: "hsl(var(--primary))" } }} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} layout="horizontal" barGap={4}> 
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis orientation="right" allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} /> 
                   <ChartTooltip
                      cursor={true}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                  <Bar dataKey="کلیک‌ها" fill="var(--color-کلیک‌ها)" radius={[4, 4, 0, 0]} barSize={30}/> 
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">داده‌ای برای نمایش نمودار کلیک موجود نیست.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>تمام نوارهای اعلانات</CardTitle>
          <CardDescription>جزئیات تمام نوارهای ایجاد شده خود را مشاهده و مدیریت کنید. روی یک ردیف کلیک کنید تا کد جاسازی آن را دریافت نمایید.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان</TableHead>
                <TableHead>پیام</TableHead>
                <TableHead className="text-center">کلیک‌ها</TableHead>
                <TableHead>ایجاد شده</TableHead>
                <TableHead className="text-left">اقدامات</TableHead> 
              </TableRow>
            </TableHeader>
            <TableBody>
              {bars.map((bar) => (
                <TableRow 
                  key={bar.id} 
                  onClick={() => onBarSelectForSnippet(bar)} 
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  aria-label={`انتخاب نوار ${bar.title} برای دریافت کد`}
                >
                  <TableCell className="font-medium max-w-[150px] truncate">{bar.title}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{bar.message}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={bar.clicks > 0 ? "default" : "secondary"}>{bar.clicks}</Badge>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(bar.createdAt), { addSuffix: true, locale: faIR })}</TableCell>
                  <TableCell className="text-left space-x-2 rtl:space-x-reverse"> 
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); onEditBar(bar); }} 
                      aria-label="ویرایش نوار"
                    >
                      <Icons.Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); onDeleteBarRequest(bar.id); }} 
                      aria-label="حذف نوار" 
                      className="text-destructive hover:text-destructive"
                    >
                      <Icons.Delete className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

