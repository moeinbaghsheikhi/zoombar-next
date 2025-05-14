
"use client";

import React, { useState, useEffect } from 'react';
import { BarEditor } from '@/components/dashboard/BarEditor';
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
import { extractWebsiteColors, type ExtractColorsInput, type ExtractColorsOutput } from '@/ai/flows/extract-website-colors-flow';
import { Separator } from '@/components/ui/separator';

export default function CreateBarPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [barConfig, setBarConfig] = useState<Partial<AnnouncementBar>>({
    title: "",
    message: "",
    backgroundColor: "#333333",
    textColor: "#ffffff",
    imageUrl: "",
    timerBackgroundColor: "#FC4C1D",
    timerTextColor: "#FFFFFF",
    timerStyle: "square",
    expiresAt: undefined,
  });

  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [expiryTime, setExpiryTime] = useState<string>(''); 

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isExtractingColors, setIsExtractingColors] = useState(false);

  useEffect(() => {
    let expirationDateTime: string | undefined = undefined;
    if (expiryDate) {
        const dateStr = format(expiryDate, "yyyy-MM-dd");
        const timeStr = expiryTime || "00:00"; 
        try {
            const localDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate(), parseInt(timeStr.split(':')[0]), parseInt(timeStr.split(':')[1]));
            expirationDateTime = localDate.toISOString();
        } catch (e) {
            console.error("Invalid date/time for expiration:", e);
        }
    }
    setBarConfig(prevConfig => ({ ...prevConfig, expiresAt: expirationDateTime }));
  }, [expiryDate, expiryTime]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setScreenshotFile(event.target.files[0]);
    } else {
      setScreenshotFile(null);
    }
  };

  const handleExtractColors = async () => {
    if (!screenshotFile) {
      toast({ title: "خطا", description: "لطفاً ابتدا یک تصویر انتخاب کنید.", variant: "destructive" });
      return;
    }
    setIsExtractingColors(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(screenshotFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const input: ExtractColorsInput = { imageDataUri: base64data };
        const result: ExtractColorsOutput = await extractWebsiteColors(input);
        
        setBarConfig(prevConfig => ({
          ...prevConfig,
          backgroundColor: result.backgroundColor,
          textColor: result.textColor,
        }));

        toast({ title: "موفقیت", description: "رنگ‌ها با موفقیت استخراج و اعمال شدند." });
      };
      reader.onerror = () => {
        throw new Error("خطا در خواندن فایل تصویر.");
      }
    } catch (error: any) {
      console.error("AI color extraction error:", error);
      toast({ title: "خطای هوش مصنوعی", description: error.message || "خطا در استخراج رنگ‌ها.", variant: "destructive" });
    } finally {
      setIsExtractingColors(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard'); 
  };

  const handleSubmit = async (data: {
    title: string;
    message: string;
    backgroundColor: string;
    textColor: string;
    imageUrl?: string;
    timerBackgroundColor: string;
    timerTextColor: string;
    timerStyle: 'square' | 'circle' | 'none';
  }) => {
    if (!user) {
      toast({ title: "خطا", description: "برای ایجاد نوار باید وارد شده باشید.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    const barPayload: Omit<AnnouncementBar, 'id' | 'userId' | 'clicks' | 'createdAt'> = {
        title: data.title,
        message: data.message,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        imageUrl: data.imageUrl,
        timerBackgroundColor: data.timerBackgroundColor,
        timerTextColor: data.timerTextColor,
        timerStyle: data.timerStyle,
        ...(barConfig.expiresAt && { expiresAt: barConfig.expiresAt }),
    };

    try {
      await createAnnouncementBar(user.id, barPayload); 
      toast({ 
        title: "موفقیت!", 
        description: `نوار اعلانات "${data.title}" ${barConfig.expiresAt ? `با انقضا در ${format(new Date(barConfig.expiresAt), "PPPp", { locale: faIR })}` : 'بدون انقضا'} ایجاد شد.` 
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
          نوار اعلانات خود را طراحی کنید. می‌توانید از هوش مصنوعی برای پیشنهاد رنگ بر اساس وب‌سایت خود استفاده کنید.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  locale={faIR} 
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
              disabled={!expiryDate} 
              dir="ltr" 
            />
             <p className="text-xs text-muted-foreground mt-1">در صورت انتخاب تاریخ، زمان نیز وارد شود.</p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="space-y-4 mb-8 p-6 border rounded-lg shadow-sm bg-muted/30">
          <h3 className="text-lg font-semibold">استخراج رنگ با هوش مصنوعی</h3>
          <p className="text-sm text-muted-foreground">
            یک اسکرین‌شات از وب‌سایت خود آپلود کنید تا هوش مصنوعی رنگ‌های مناسب برای پس‌زمینه و متن نوار اعلان شما را پیشنهاد دهد.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="screenshotFile">فایل اسکرین‌شات (PNG, JPG)</Label>
              <Input 
                id="screenshotFile" 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileChange} 
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleExtractColors} 
              disabled={!screenshotFile || isExtractingColors}
              className="w-full sm:w-auto"
            >
              {isExtractingColors ? (
                <>
                  <Icons.Spinner className="me-2 h-4 w-4 animate-spin" />
                  در حال پردازش...
                </>
              ) : (
                <>
                  <Icons.Palette className="me-2 h-4 w-4" />
                  استخراج رنگ‌ها
                </>
              )}
            </Button>
          </div>
          {screenshotFile && (
            <p className="text-xs text-muted-foreground mt-1">فایل انتخاب شده: {screenshotFile.name}</p>
          )}
        </div>
        
        <Separator className="my-8" />

        <BarEditor
          initialData={barConfig} // Pass the full config, which includes AI suggested colors if any
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          expiryDate={expiryDate}
          expiryTime={expiryTime}
        />
      </CardContent>
    </Card>
  );
}
