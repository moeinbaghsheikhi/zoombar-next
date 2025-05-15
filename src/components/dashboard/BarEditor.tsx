
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  title: z.string().min(3, { message: "عنوان باید حداقل ۳ کاراکتر باشد." }),
  message: z.string().min(5, { message: "پیام باید حداقل ۵ کاراکتر باشد." }),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر است (مثال: #RRGGBB)." }),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر است (مثال: #RRGGBB)." }),
  imageUrl: z.string().url({ message: "لطفاً یک URL معتبر وارد کنید." }).optional().or(z.literal('')),
  timerBackgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر است." }).default('#FC4C1D'),
  timerTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر است." }).default('#FFFFFF'),
  timerStyle: z.enum(['square', 'circle', 'none'], { errorMap: () => ({ message: "یک نوع معتبر انتخاب کنید."}) }).default('square'),
  timerPosition: z.enum(['left', 'right'], { errorMap: () => ({ message: "یک موقعیت معتبر انتخاب کنید."}) }).default('right'),
  fontSize: z.number().min(8, {message: "اندازه فونت باید حداقل ۸ باشد."}).max(48, {message: "اندازه فونت باید حداکثر ۴۸ باشد."}).default(14),
  // CTA Fields
  ctaText: z.string().optional().or(z.literal('')),
  ctaLink: z.string().url({ message: "لینک CTA باید یک URL معتبر باشد." }).optional().or(z.literal('')),
  ctaBackgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر است." }).default('#FC4C1D'),
  ctaTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر است." }).default('#FFFFFF'),
  ctaLinkTarget: z.enum(['_self', '_blank'], { errorMap: () => ({ message: "یک گزینه معتبر انتخاب کنید."}) }).default('_self'),
}).refine(data => {
  if ((data.ctaText && data.ctaText.trim() !== '' && (!data.ctaLink || data.ctaLink.trim() === '')) ||
      (data.ctaLink && data.ctaLink.trim() !== '' && (!data.ctaText || data.ctaText.trim() === ''))) {
    return false;
  }
  return true;
}, {
  message: "متن دکمه و لینک دکمه هر دو باید پر شوند یا هر دو خالی باشند.",
  path: ["ctaText"],
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
      backgroundColor: initialData?.backgroundColor || "#333333",
      textColor: initialData?.textColor || "#ffffff",
      imageUrl: initialData?.imageUrl || "",
      timerBackgroundColor: initialData?.timerBackgroundColor || "#FC4C1D",
      timerTextColor: initialData?.timerTextColor || "#FFFFFF",
      timerStyle: initialData?.timerStyle || "square",
      timerPosition: initialData?.timerPosition || "right",
      fontSize: initialData?.fontSize || 14,
      ctaText: initialData?.ctaText !== undefined ? initialData.ctaText : "",
      ctaLink: initialData?.ctaLink !== undefined ? initialData.ctaLink : "",
      ctaBackgroundColor: initialData?.ctaBackgroundColor || "#FC4C1D",
      ctaTextColor: initialData?.ctaTextColor || "#FFFFFF",
      ctaLinkTarget: initialData?.ctaLinkTarget || "_self",
    },
  });

 useEffect(() => {
    const currentValues = form.getValues();

    const newDefaults = {
      title: (initialData?.title && initialData.title.trim() !== "") ? initialData.title : (currentValues.title || ""),
      message: (initialData?.message && initialData.message.trim() !== "") ? initialData.message : (currentValues.message || ""),
      imageUrl: initialData?.imageUrl !== undefined ? initialData.imageUrl : (currentValues.imageUrl || ""),

      backgroundColor: initialData?.backgroundColor || currentValues.backgroundColor || "#333333",
      textColor: initialData?.textColor || currentValues.textColor || "#ffffff",
      timerBackgroundColor: initialData?.timerBackgroundColor || currentValues.timerBackgroundColor || "#FC4C1D",
      timerTextColor: initialData?.timerTextColor || currentValues.timerTextColor || "#FFFFFF",
      ctaBackgroundColor: initialData?.ctaBackgroundColor || currentValues.ctaBackgroundColor || "#FC4C1D",
      ctaTextColor: initialData?.ctaTextColor || currentValues.ctaTextColor || "#FFFFFF",
      
      fontSize: currentValues.fontSize || initialData?.fontSize || 14,

      timerStyle: currentValues.timerStyle && ['square', 'circle', 'none'].includes(currentValues.timerStyle as string)
                    ? currentValues.timerStyle
                    : (initialData?.timerStyle || "square"),
      timerPosition: currentValues.timerPosition && (currentValues.timerPosition === 'left' || currentValues.timerPosition === 'right')
                    ? currentValues.timerPosition
                    : (initialData?.timerPosition || "right"),
      ctaLinkTarget: currentValues.ctaLinkTarget && (currentValues.ctaLinkTarget === '_self' || currentValues.ctaLinkTarget === '_blank')
                    ? currentValues.ctaLinkTarget
                    : (initialData?.ctaLinkTarget || "_self"),

      ctaText: (initialData?.ctaText && initialData.ctaText.trim() !== "") ? initialData.ctaText : (currentValues.ctaText || ""),
      ctaLink: (initialData?.ctaLink && initialData.ctaLink.trim() !== "") ? initialData.ctaLink : (currentValues.ctaLink || ""),
    };

    form.reset(newDefaults);
    setPreviewImageUrl(newDefaults.imageUrl);
  }, [initialData, form]);

  const watchedMessage = form.watch("message");
  const watchedImageUrl = form.watch("imageUrl");
  const watchedBgColor = form.watch("backgroundColor");
  const watchedTextColor = form.watch("textColor");
  const watchedTimerBgColor = form.watch("timerBackgroundColor");
  const watchedTimerTextColor = form.watch("timerTextColor");
  const watchedTimerStyle = form.watch("timerStyle");
  const watchedTimerPosition = form.watch("timerPosition");
  const watchedFontSize = form.watch("fontSize");
  const watchedCtaText = form.watch("ctaText");
  const watchedCtaLink = form.watch("ctaLink");
  const watchedCtaBgColor = form.watch("ctaBackgroundColor");
  const watchedCtaTextColor = form.watch("ctaTextColor");

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

  const TimerBox = ({ value, unit, bgColor, textColor, styleType }: { value: string | number; unit: string; bgColor: string; textColor: string; styleType: 'square' | 'circle' | 'none' }) => {
    const baseClasses = "p-2 flex flex-col items-center justify-center w-16 h-16 shadow-md";
    let styleClasses = "";

    if (styleType === 'square') {
        styleClasses = "rounded-md";
    } else if (styleType === 'circle') {
        styleClasses = "rounded-full !w-16 !h-16";
    } else if (styleType === 'none') {
        styleClasses = "p-0 w-auto h-auto shadow-none bg-transparent";
    }

    const effectiveBgColor = styleType === 'none' ? 'transparent' : bgColor;
    const effectiveTextColor = styleType === 'none' ? watchedTextColor : textColor; 

    return (
        <div
            className={cn(baseClasses, styleClasses)}
            style={{ backgroundColor: effectiveBgColor, color: effectiveTextColor }}
        >
            <span className={cn("text-2xl font-bold", styleType === 'none' && "text-base")}>{String(value).padStart(2, '0')}</span>
            <span className={cn("text-xs", styleType === 'none' && "text-[0.7rem] ms-1")}>{unit}</span>
        </div>
    );
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
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
                    <Textarea placeholder="پیام اعلانات خود را وارد کنید" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اندازه فونت پیام و دکمه (پیکسل)</FormLabel>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => form.setValue("fontSize", Math.max(8, (field.value || 14) - 1))}
                      disabled={isSubmitting || (field.value || 14) <= 8}
                    >
                      <Icons.Minus className="h-4 w-4" />
                    </Button>
                    <FormControl>
                      <Input
                        type="number"
                        min={8}
                        max={48}
                        {...field}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val)) field.onChange(14); // default if NaN
                            else if (val < 8) field.onChange(8);
                            else if (val > 48) field.onChange(48);
                            else field.onChange(val);
                        }}
                        value={field.value || 14}
                        className="w-20 text-center"
                        dir="ltr"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => form.setValue("fontSize", Math.min(48, (field.value || 14) + 1))}
                      disabled={isSubmitting || (field.value || 14) >= 48}
                    >
                      <Icons.Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>اندازه فونت برای متن اصلی پیام و متن دکمه فراخوان.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رنگ پس‌زمینه نوار</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={field.value} onChange={field.onChange} className="p-0 h-10 w-12 cursor-pointer appearance-none border-none bg-transparent" style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }} />
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
                    <FormLabel>رنگ متن نوار</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={field.value} onChange={field.onChange} className="p-0 h-10 w-12 cursor-pointer appearance-none border-none bg-transparent" style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }} />
                        <Input dir="ltr" type="text" placeholder="#ffffff" value={field.value} onChange={field.onChange} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator />
            <h4 className="text-md font-semibold">تنظیمات تایمر</h4>
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="timerBackgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رنگ پس‌زمینه تایمر</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={field.value} onChange={field.onChange} className="p-0 h-10 w-12 cursor-pointer" />
                        <Input dir="ltr" type="text" placeholder="#FC4C1D" value={field.value} onChange={field.onChange} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timerTextColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رنگ متن تایمر</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={field.value} onChange={field.onChange} className="p-0 h-10 w-12 cursor-pointer" />
                        <Input dir="ltr" type="text" placeholder="#FFFFFF" value={field.value} onChange={field.onChange} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="timerStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع نمایش تایمر</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue="square" dir="rtl">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="یک نوع را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="square">مربعی</SelectItem>
                      <SelectItem value="circle">دایره‌ای</SelectItem>
                      <SelectItem value="none">متن تنها (بدون کادر)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="timerPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>موقعیت تایمر</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue="right" dir="rtl">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="موقعیت تایمر را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="left">چپ پیام</SelectItem>
                      <SelectItem value="right">راست پیام</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <h4 className="text-md font-semibold">تنظیمات دکمه فراخوان (CTA)</h4>
             <FormField
              control={form.control}
              name="ctaText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>متن دکمه CTA (اختیاری)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: بیشتر بدانید" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ctaLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>لینک دکمه CTA (اختیاری)</FormLabel>
                  <FormControl>
                    <Input dir="ltr" placeholder="https://example.com/offer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ctaBackgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رنگ پس‌زمینه CTA</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={field.value} onChange={field.onChange} className="p-0 h-10 w-12 cursor-pointer" />
                        <Input dir="ltr" type="text" placeholder="#FC4C1D" value={field.value} onChange={field.onChange} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ctaTextColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رنگ متن CTA</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={field.value} onChange={field.onChange} className="p-0 h-10 w-12 cursor-pointer" />
                        <Input dir="ltr" type="text" placeholder="#FFFFFF" value={field.value} onChange={field.onChange} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="ctaLinkTarget"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>نحوه باز شدن لینک CTA</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue="_self"
                      className="flex space-x-2 rtl:space-x-reverse"
                      dir="rtl"
                    >
                      <FormItem className="flex items-center space-x-2 rtl:space-x-reverse space-y-0">
                        <FormControl>
                          <RadioGroupItem value="_self" />
                        </FormControl>
                        <FormLabel className="font-normal">در همین صفحه</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 rtl:space-x-reverse space-y-0">
                        <FormControl>
                          <RadioGroupItem value="_blank" />
                        </FormControl>
                        <FormLabel className="font-normal">در صفحه جدید</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-4 pt-8">
          <h3 className="text-lg font-semibold text-center">پیش‌نمایش زنده</h3>
          <div
            dir="rtl"
            className="p-3 rounded-lg shadow-xl w-full flex items-center justify-between gap-4 mx-auto overflow-hidden"
            style={{
              backgroundColor: watchedBgColor || '#333333',
              color: watchedTextColor || '#ffffff',
              minHeight: '80px',
            }}
          >
            <div className={cn(
                "flex items-center gap-3",
                watchedTimerPosition === 'right' ? "order-1 flex-grow" : "order-2 flex-grow", 
            )}>
              {previewImageUrl && form.getValues("imageUrl") && (
                <Image
                  src={previewImageUrl}
                  alt="پیش‌نمایش"
                  width={32} height={32}
                  className="rounded-sm object-contain shrink-0"
                  data-ai-hint="icon logo"
                  onError={() => {}} 
                />
              )}
              <span className="text-right" style={{ fontSize: `${watchedFontSize || 14}px` }}>{watchedMessage || "پیام شما در اینجا نمایش داده می‌شود."}</span>
               {watchedCtaText && watchedCtaLink && (
                <a
                  href={watchedCtaLink || '#'}
                  target={form.getValues("ctaLinkTarget")}
                  className="px-3 py-1.5 rounded-md font-medium shrink-0 whitespace-nowrap"
                  style={{
                    backgroundColor: watchedCtaBgColor,
                    color: watchedCtaTextColor,
                    fontSize: `${watchedFontSize || 14}px`,
                    textDecoration: 'none',
                  }}
                  onClick={(e) => e.preventDefault()} 
                >
                  {watchedCtaText}
                </a>
              )}
            </div>

            {countdownValues && (
              <div className={cn(
                  "flex gap-1.5 items-center shrink-0",
                   watchedTimerPosition === 'right' ? "order-2" : "order-1" 
              )} dir="ltr"> 
                {countdownValues.days > 0 && (
                  <TimerBox value={countdownValues.days} unit="روز" bgColor={watchedTimerBgColor} textColor={watchedTimerTextColor} styleType={watchedTimerStyle} />
                )}
                <TimerBox value={countdownValues.hours} unit="ساعت" bgColor={watchedTimerBgColor} textColor={watchedTimerTextColor} styleType={watchedTimerStyle} />
                <TimerBox value={countdownValues.minutes} unit="دقیقه" bgColor={watchedTimerBgColor} textColor={watchedTimerTextColor} styleType={watchedTimerStyle} />
                <TimerBox value={countdownValues.seconds} unit="ثانیه" bgColor={watchedTimerBgColor} textColor={watchedTimerTextColor} styleType={watchedTimerStyle} />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            توجه: این یک پیش‌نمایش ساده است. ظاهر واقعی ممکن است بر اساس CSS سایت شما متفاوت باشد.
          </p>
        </div>
        <Separator className="my-6" />

        <div className="flex space-x-2 rtl:space-x-reverse justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <Icons.Cancel className="me-2 h-4 w-4" /> انصراف
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Icons.Spinner className="me-2 h-4 w-4 animate-spin" />}
            <Icons.Save className="me-2 h-4 w-4" /> {initialData?.id ? 'ذخیره تغییرات' : 'ایجاد نوار'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
