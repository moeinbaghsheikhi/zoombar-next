
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AnnouncementBar } from "@/lib/mockData";
import { Icons } from "@/components/icons";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(3, { message: "عنوان باید حداقل ۳ کاراکتر باشد." }),
  message: z.string().min(5, { message: "پیام باید حداقل ۵ کاراکتر باشد." }),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: "کد رنگ هگز نامعتبر است (مثال: #RRGGBB)." }),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: "کد رنگ هگز نامعتبر است (مثال: #RRGGBB)." }),
  imageUrl: z.string().url({ message: "لطفاً یک URL معتبر وارد کنید." }).optional().or(z.literal('')),
});

type BarEditorFormValues = z.infer<typeof formSchema>;

interface BarEditorProps {
  initialData?: Partial<AnnouncementBar>;
  onSubmit: (data: BarEditorFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  expiryDate?: Date;
  expiryTime?: string;
}

interface CountdownValues {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
}

export function BarEditor({ initialData, onSubmit, onCancel, isSubmitting, expiryDate, expiryTime }: BarEditorProps) {
  const [previewImageUrl, setPreviewImageUrl] = useState(initialData?.imageUrl || '');
  const [countdownValues, setCountdownValues] = useState<CountdownValues | null>(null);

  const form = useForm<BarEditorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      message: initialData?.message || "",
      backgroundColor: initialData?.backgroundColor || "#333333", // Default dark grey
      textColor: initialData?.textColor || "#ffffff",
      imageUrl: initialData?.imageUrl || "",
    },
  });

  useEffect(() => {
    if (initialData) {
       form.reset({
        title: initialData.title || "",
        message: initialData.message || "",
        backgroundColor: initialData.backgroundColor || "#333333",
        textColor: initialData.textColor || "#ffffff",
        imageUrl: initialData.imageUrl || "",
      });
      setPreviewImageUrl(initialData.imageUrl || '');
    } else {
      form.reset({
        title: "",
        message: "",
        backgroundColor: "#333333",
        textColor: "#ffffff",
        imageUrl: "",
      });
      setPreviewImageUrl('');
    }
  }, [initialData, form]);
  
  const watchedMessage = form.watch("message");
  const watchedImageUrl = form.watch("imageUrl");
  const watchedBgColor = form.watch("backgroundColor");
  const watchedTextColor = form.watch("textColor");

  useEffect(() => {
    if (watchedImageUrl !== previewImageUrl) {
        setPreviewImageUrl(watchedImageUrl);
    }
  }, [watchedImageUrl, previewImageUrl]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (expiryDate) {
        const updateCountdown = () => {
            const now = new Date().getTime();
            let targetTime: number;

            const datePart = new Date(expiryDate);
            let hours = 0;
            let minutes = 0;

            if (expiryTime) {
                const timeParts = expiryTime.split(':');
                if (timeParts.length === 2) {
                    hours = parseInt(timeParts[0], 10);
                    minutes = parseInt(timeParts[1], 10);
                }
            }
            
            targetTime = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), hours, minutes, 0, 0).getTime();
            
            const distance = targetTime - now;

            if (distance < 0) {
                setCountdownValues({ days: 0, hours: "00", minutes: "00", seconds: "00" });
                if (intervalId) clearInterval(intervalId);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const dHours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const dMinutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const dSeconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            setCountdownValues({
                days,
                hours: String(dHours).padStart(2, '0'),
                minutes: String(dMinutes).padStart(2, '0'),
                seconds: String(dSeconds).padStart(2, '0'),
            });
        };

        updateCountdown(); 
        intervalId = setInterval(updateCountdown, 1000);
    } else {
        setCountdownValues(null); 
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [expiryDate, expiryTime]);

  const TimerBox = ({ value, unit }: { value: string | number; unit: string }) => (
    <div className="bg-primary text-primary-foreground rounded-md p-2 flex flex-col items-center justify-center w-16 h-16 shadow-md">
      <span className="text-2xl font-bold">{String(value).padStart(2, '0')}</span>
      <span className="text-xs">{unit}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Input Fields Section */}
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Column 1: Title and Message */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان نوار (برای ارجاع شما)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: بنر فروش تابستانه" {...field} />
                    </FormControl>
                    <FormDescription>این عنوان به کاربران نمایش داده نمی‌شود.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>پیام</FormLabel>
                    <FormControl>
                      <Textarea placeholder="پیام اعلانات خود را وارد کنید" className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Column 2: Colors and Image URL */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                  control={form.control}
                  name="backgroundColor"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>رنگ پس‌زمینه</FormLabel>
                      <FormControl>
                          <div className="flex items-center gap-2">
                          <Input type="color" value={field.value} onChange={field.onChange} className="p-0 h-10 w-12 cursor-pointer appearance-none border-none bg-transparent" style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}/>
                          <Input dir="ltr" type="text" placeholder="#333333" value={field.value} onChange={field.onChange} />
                          </div>
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="textColor"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>رنگ متن</FormLabel>
                      <FormControl>
                          <div className="flex items-center gap-2">
                          <Input type="color" value={field.value} onChange={field.onChange} className="p-0 h-10 w-12 cursor-pointer appearance-none border-none bg-transparent" style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}/>
                          <Input dir="ltr" type="text" placeholder="#ffffff" value={field.value} onChange={field.onChange} />
                          </div>
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              </div>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL تصویر (اختیاری)</FormLabel>
                    <FormControl>
                      <Input dir="ltr" placeholder="https://example.com/image.png" {...field} />
                    </FormControl>
                    <FormDescription>لینک به تصویری برای نمایش در نوار.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Live Preview - Moved here */}
          <div className="space-y-4 pt-8 border-t">
            <h3 className="text-lg font-semibold text-center">پیش‌نمایش زنده</h3>
            <div 
              dir="rtl"
              className="p-3 rounded-lg shadow-xl w-full flex items-center justify-between gap-4 mx-auto"
              style={{ 
                backgroundColor: watchedBgColor || '#333333', 
                color: watchedTextColor || '#ffffff',
                minHeight: '80px',
              }}
            >
              {/* Message Content (Image + Text) - Placed first for RTL to appear on the right */}
              <div className="flex items-center gap-2 flex-grow justify-start text-right"> {/* Ensures content within is pushed to the right and text is right-aligned */}
                {previewImageUrl && form.getValues("imageUrl") && ( 
                  <Image 
                    src={previewImageUrl} 
                    alt="پیش‌نمایش" 
                    width={32} height={32} 
                    className="rounded-sm object-contain" 
                    data-ai-hint="icon logo"
                    onError={() => { /* console.error("Error loading preview image") */ }}
                  />
                )}
                <span className="text-sm">{watchedMessage || "پیام شما در اینجا نمایش داده می‌شود."}</span>
              </div>

              {/* Countdown Timer - Placed second for RTL to appear on the left */}
              {countdownValues && (
                <div className="flex gap-1.5 items-center shrink-0" dir="ltr"> {/* Timer elements are LTR */}
                  {countdownValues.days > 0 && (
                    <TimerBox value={countdownValues.days} unit="روز" />
                  )}
                  <TimerBox value={countdownValues.hours} unit="ساعت" />
                  <TimerBox value={countdownValues.minutes} unit="دقیقه" />
                  <TimerBox value={countdownValues.seconds} unit="ثانیه" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              توجه: این یک پیش‌نمایش ساده است. ظاهر واقعی ممکن است بر اساس CSS سایت شما متفاوت باشد. رنگ تایمر از رنگ اصلی برنامه گرفته شده است.
            </p>
          </div>
          
          {/* Buttons - At the end of the form */}
          <div className="flex space-x-2 rtl:space-x-reverse justify-end mt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <Icons.Cancel className="me-2 h-4 w-4" /> انصراف
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icons.Spinner className="me-2 h-4 w-4 animate-spin" />}
              <Icons.Save className="me-2 h-4 w-4" /> {initialData ? 'ذخیره تغییرات' : 'ایجاد نوار'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
    

    

    