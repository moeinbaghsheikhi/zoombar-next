
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { extractWebsiteColors, type ExtractColorsInput, type ExtractColorsOutput } from '@/ai/flows/extract-website-colors-flow';
import { Separator } from '@/components/ui/separator';

// Helper function to convert Persian/Arabic numerals to Western Arabic numerals
function persianToWesternNumerals(str: string): string {
  if (typeof str !== 'string') return str;
  return str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
}


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
    timerPosition: "right", 
    expiresAt: undefined,
    // CTA Defaults
    ctaText: "",
    ctaLink: "",
    ctaBackgroundColor: "#FC4C1D", 
    ctaTextColor: "#FFFFFF",
    ctaLinkTarget: "_self",
  });

  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [expiryTime, setExpiryTime] = useState<string>(''); 
  const [dateInputString, setDateInputString] = useState<string>('');

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isExtractingColors, setIsExtractingColors] = useState(false);

  useEffect(() => {
    let expirationDateTime: string | undefined = undefined;
    if (expiryDate) {
        const dateStr = format(expiryDate, "yyyy-MM-dd");
        const timeStr = expiryTime || "00:00"; 
        try {
            // Ensure expiryDate is treated as local time when combining with expiryTime
            const localDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate(), parseInt(timeStr.split(':')[0]), parseInt(timeStr.split(':')[1]));
            expirationDateTime = localDate.toISOString();
        } catch (e) {
            console.error("Invalid date/time for expiration:", e);
        }
    }
    setBarConfig(prevConfig => ({ 
      ...prevConfig,
      expiresAt: expirationDateTime 
    }));
  }, [expiryDate, expiryTime]);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDateInputString(rawValue); 

    const value = persianToWesternNumerals(rawValue); // Convert Persian numerals

    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(value)) {
      const parts = value.split('/');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript Date
      const day = parseInt(parts[2], 10);
      
      // WARNING: This creates a Gregorian date using the Shamsi year number.
      // For true Shamsi countdown, a Jalali date library is needed.
      const parsedDate = new Date(year, month, day); 
      
      if (!isNaN(parsedDate.getTime())) {
        setExpiryDate(parsedDate);
      } else {
        setExpiryDate(undefined); 
      }
    } else if (value === "") {
        setExpiryDate(undefined); 
    }
  };


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
          timerBackgroundColor: result.timerBackgroundColor,
          timerTextColor: result.timerTextColor,
          ctaBackgroundColor: result.ctaBackgroundColor,
          ctaTextColor: result.ctaTextColor,
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
    timerPosition: 'left' | 'right';
    ctaText?: string;
    ctaLink?: string;
    ctaBackgroundColor: string;
    ctaTextColor: string;
    ctaLinkTarget: '_self' | '_blank';
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
        timerPosition: data.timerPosition,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        ctaBackgroundColor: data.ctaBackgroundColor,
        ctaTextColor: data.ctaTextColor,
        ctaLinkTarget: data.ctaLinkTarget,
        ...(barConfig.expiresAt && { expiresAt: barConfig.expiresAt }),
    };

    try {
      await createAnnouncementBar(user.id, barPayload); 
      toast({ 
        title: "موفقیت!", 
        description: `نوار اعلانات "${data.title}" ${barConfig.expiresAt ? `با انقضا در ${format(new Date(barConfig.expiresAt), "PPPp", { locale: faIR })} (توجه: شمارش معکوس بر اساس تاریخ میلادی متناظر با اعداد ورودی است)` : 'بدون انقضا'} ایجاد شد.` 
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
            <Label htmlFor="MyDatePicker" className="text-sm font-medium mb-1 block">تاریخ انقضا شمسی (اختیاری - فرمت: YYYY/MM/DD)</Label>
            <Input 
                id="MyDatePicker" 
                placeholder="مثال: ۱۴۰۳/۰۵/۱۵"
                value={dateInputString}
                onChange={handleDateInputChange}
                className="w-full"
                dir="ltr" 
            />
             {expiryDate && (
                <p className="text-xs text-muted-foreground mt-1">تاریخ انتخاب شده (میلادی متناظر): {format(expiryDate, "PPP", { locale: faIR })}</p>
            )}
          </div>
          <div>
            <Label htmlFor="expiryTime" className="text-sm font-medium mb-1 block">زمان انقضا (اختیاری)</Label>
            <Input 
              type="time" 
              id="expiryTime" 
              value={expiryTime} 
              onChange={(e) => setExpiryTime(e.target.value)} 
              className="w-full"
              disabled={!expiryDate && !dateInputString} 
              dir="ltr" 
            />
             <p className="text-xs text-muted-foreground mt-1">در صورت انتخاب تاریخ، زمان نیز وارد شود.</p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="space-y-4 mb-8 p-6 border rounded-lg shadow-sm bg-muted/30">
          <h3 className="text-lg font-semibold">استخراج رنگ با هوش مصنوعی</h3>
          <p className="text-sm text-muted-foreground">
            یک اسکرین‌شات از وب‌سایت خود آپلود کنید تا هوش مصنوعی رنگ‌های مناسب برای پس‌زمینه و متن نوار اعلان، تایمر و دکمه CTA شما را پیشنهاد دهد.
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
          initialData={barConfig} 
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

