
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
import type { AnnouncementBar, BarTemplate } from "@/lib/mockData";
import { Icons } from "@/components/icons";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  template?: BarTemplate; 
  onSubmit: (data: BarEditorFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export function BarEditor({ initialData, template, onSubmit, onCancel, isSubmitting }: BarEditorProps) {
  const [previewImageUrl, setPreviewImageUrl] = useState(initialData?.imageUrl || template?.defaultConfig.imageUrl || '');

  const form = useForm<BarEditorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || template?.name || "",
      message: initialData?.message || template?.defaultConfig.message || "",
      backgroundColor: initialData?.backgroundColor || template?.defaultConfig.backgroundColor || "#fc4c1d",
      textColor: initialData?.textColor || template?.defaultConfig.textColor || "#ffffff",
      imageUrl: initialData?.imageUrl || template?.defaultConfig.imageUrl || "",
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        title: template.name,
        message: template.defaultConfig.message,
        backgroundColor: template.defaultConfig.backgroundColor,
        textColor: template.defaultConfig.textColor,
        imageUrl: template.defaultConfig.imageUrl || "",
      });
      setPreviewImageUrl(template.defaultConfig.imageUrl || '');
    } else if (initialData) {
       form.reset({
        title: initialData.title || "",
        message: initialData.message || "",
        backgroundColor: initialData.backgroundColor || "#fc4c1d",
        textColor: initialData.textColor || "#ffffff",
        imageUrl: initialData.imageUrl || "",
      });
      setPreviewImageUrl(initialData.imageUrl || '');
    }
  }, [template, initialData, form]);
  
  const watchedMessage = form.watch("message");
  const watchedImageUrl = form.watch("imageUrl");

  useEffect(() => {
    if (watchedImageUrl !== previewImageUrl) {
        setPreviewImageUrl(watchedImageUrl);
    }
  }, [watchedImageUrl, previewImageUrl]);


  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Textarea placeholder="پیام اعلانات خود را وارد کنید" {...field} />
                </FormControl>
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
                  <FormLabel>رنگ پس‌زمینه</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                       <Input type="color" {...field} className="p-0 h-10 w-12 cursor-pointer appearance-none border-none bg-transparent" style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}/>
                       <Input dir="ltr" type="text" placeholder="#fc4c1d" {...field} />
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
                      <Input type="color" {...field} className="p-0 h-10 w-12 cursor-pointer appearance-none border-none bg-transparent" style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}/>
                      <Input dir="ltr" type="text" placeholder="#ffffff" {...field} />
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
          
          <div className="flex space-x-2 rtl:space-x-reverse justify-end">
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">پیش‌نمایش زنده</h3>
        <div 
          className="p-4 rounded-md shadow-md text-center flex items-center justify-center gap-4"
          style={{ 
            backgroundColor: form.getValues("backgroundColor") || '#cccccc', 
            color: form.getValues("textColor") || '#000000',
            minHeight: '60px',
          }}
        >
          {previewImageUrl && form.getValues("imageUrl") && ( // Check form.getValues("imageUrl") to ensure it's not an empty string causing an error
            <Image 
              src={previewImageUrl} 
              alt="پیش‌نمایش" 
              width={40} height={40} 
              className="rounded-sm object-contain" 
              data-ai-hint="icon logo"
              onError={() => { /* console.error("Error loading preview image") */ }}
            />
          )}
          <span>{watchedMessage || "پیام شما در اینجا نمایش داده می‌شود."}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          توجه: این یک پیش‌نمایش ساده است. ظاهر واقعی ممکن است بر اساس CSS سایت شما متفاوت باشد.
        </p>
      </div>
    </div>
  );
}
