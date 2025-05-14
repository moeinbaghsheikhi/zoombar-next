
"use client";

import React, { useState } from 'react';
import { BarEditor } from '@/components/dashboard/BarEditor';
// TemplateCard and barTemplates are removed
import { createAnnouncementBar, type AnnouncementBar } from '@/lib/mockData'; 
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';

export default function CreateBarPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [expiryTime, setExpiryTime] = useState<string>(''); // e.g., "14:30"

  // selectedTemplate, handleSelectTemplate, handleStartFromScratch are removed
  // showEditor state is removed as editor is always shown

  const handleCancel = () => {
    router.push('/dashboard'); // Navigate back to dashboard overview on cancel
  };

  const handleSubmit = async (data: {
    title: string;
    message: string;
    backgroundColor: string;
    textColor: string;
    imageUrl?: string;
  }) => {
    if (!user) {
      toast({ title: "خطا", description: "برای ایجاد نوار باید وارد شده باشید.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    let expirationDateTime: string | undefined = undefined;
    if (expiryDate) {
        const dateStr = format(expiryDate, "yyyy-MM-dd");
        const timeStr = expiryTime || "00:00"; // Default to start of day if no time
        try {
            // Construct date in local timezone, then get ISO string.
            // Avoids issues with new Date("YYYY-MM-DDTHH:mm:ss") which can be UTC or local depending on browser.
            const localDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate(), parseInt(timeStr.split(':')[0]), parseInt(timeStr.split(':')[1]));
            expirationDateTime = localDate.toISOString();
        } catch (e) {
            console.error("Invalid date/time for expiration:", e);
            toast({ title: "خطای تاریخ", description: "فرمت تاریخ یا زمان انقضا نامعتبر است.", variant: "destructive"});
            setIsSubmitting(false);
            return;
        }
    }
    
    const barPayload: Omit<AnnouncementBar, 'id' | 'userId' | 'clicks' | 'createdAt'> = {
        ...data,
        ...(expirationDateTime && { expiresAt: expirationDateTime }),
    };

    try {
      await createAnnouncementBar(user.id, barPayload); 
      toast({ 
        title: "موفقیت!", 
        description: `نوار اعلانات "${data.title}" ${expirationDateTime ? `با انقضا در ${format(new Date(expirationDateTime), "PPPp", { locale: faIR })}` : 'بدون انقضا'} ایجاد شد.` 
      });
      router.push('/dashboard/statistics'); 
    } catch (error) {
      toast({ title: "خطا", description: "ایجاد نوار اعلانات ناموفق بود.", variant: "destructive" });
      console.error("Failed to create bar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">ایجاد نوار اعلانات جدید</CardTitle>
        <CardDescription>
          نوار اعلانات خود را طراحی کنید و در صورت نیاز تاریخ انقضا تعیین کنید.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b pb-6">
          <div>
            <Label htmlFor="expiryDate" className="text-sm font-medium mb-1 block">تاریخ انقضا (اختیاری)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  id="expiryDate"
                  variant={"outline"} 
                  className="w-full justify-start text-left font-normal"
                >
                  <Icons.Calendar className="me-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP", { locale: faIR }) : <span>تاریخ را انتخاب کنید</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                  dir="rtl"
                  locale={faIR} // افزودن لوکیل فارسی به تقویم
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="expiryTime" className="text-sm font-medium mb-1 block">زمان انقضا (اختیاری)</Label>
            <Input 
              type="time" 
              id="expiryTime" 
              value={expiryTime} 
              onChange={(e) => setExpiryTime(e.target.value)} 
              className="w-full"
              disabled={!expiryDate} // Enable time input only if date is selected
              dir="ltr" // Time input should generally be LTR for consistency
            />
             <p className="text-xs text-muted-foreground mt-1">در صورت انتخاب تاریخ، زمان نیز وارد شود.</p>
          </div>
        </div>

        <BarEditor
          // template prop removed
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

