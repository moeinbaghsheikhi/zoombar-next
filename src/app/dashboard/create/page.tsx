
"use client";

import React, { useState } from 'react';
import { BarEditor } from '@/components/dashboard/BarEditor';
import { TemplateCard } from '@/components/dashboard/TemplateCard';
import { barTemplates, createAnnouncementBar, type BarTemplate, type AnnouncementBar } from '@/lib/mockData'; 
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Calendar } from '@/components/ui/calendar'; // برای انتخاب تاریخ
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // برای نمایش تقویم
import { Input } from '@/components/ui/input'; // برای ورودی زمان
import { Label } from '@/components/ui/label'; // برای برچسب‌ها
import { format } from 'date-fns'; // برای فرمت تاریخ
import { faIR } from 'date-fns/locale'; // برای فرمت فارسی تاریخ


export default function CreateBarPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<BarTemplate | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [expiryTime, setExpiryTime] = useState<string>(''); // e.g., "14:30"

  const handleSelectTemplate = (template: BarTemplate) => {
    setSelectedTemplate(template);
    setShowEditor(true);
    setExpiryDate(undefined); // Reset expiry when selecting template
    setExpiryTime('');
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(undefined); 
    setShowEditor(true);
    setExpiryDate(undefined); // Reset expiry
    setExpiryTime('');
  };

  const handleCancel = () => {
    setShowEditor(false);
    setSelectedTemplate(undefined);
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
            expirationDateTime = new Date(`${dateStr}T${timeStr}:00`).toISOString();
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

  if (showEditor) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{selectedTemplate ? `سفارشی‌سازی: ${selectedTemplate.name}` : 'ایجاد نوار اعلانات جدید'}</CardTitle>
          <CardDescription>
            {selectedTemplate ? 'جزئیات قالب انتخابی خود را تغییر دهید یا تاریخ انقضا تعیین کنید.' : 'نوار اعلانات خود را از ابتدا طراحی کنید و تاریخ انقضا تعیین کنید.'}
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
                dir="ltr"
              />
               <p className="text-xs text-muted-foreground mt-1">در صورت انتخاب تاریخ، زمان نیز وارد شود.</p>
            </div>
          </div>

          <BarEditor
            template={selectedTemplate}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ایجاد نوار اعلانات جدید</h1>
        <p className="text-muted-foreground">یک قالب انتخاب کنید یا از ابتدا شروع کنید و تاریخ انقضا تعیین نمایید.</p>
      </div>

      <Button onClick={handleStartFromScratch} size="lg" variant="outline" className="mb-8">
        <Icons.Create className="me-2 h-5 w-5" />
        شروع از ابتدا
      </Button>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">یا، یک قالب انتخاب کنید</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelectTemplate={handleSelectTemplate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
