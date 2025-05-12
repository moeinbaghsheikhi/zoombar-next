
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "../icons";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "آدرس ایمیل نامعتبر است." }),
  password: z.string().min(6, { message: "رمز عبور باید حداقل ۶ کاراکتر باشد." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "رمزهای عبور مطابقت ندارند",
  path: ["confirmPassword"],
});

export function SignupForm() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const user = await signUp(values.email, values.password);
      if (user) {
        toast({
          title: "ثبت نام موفقیت‌آمیز",
          description: `خوش آمدید، ${user.email}! حساب شما ایجاد شد.`,
        });
        // Redirect is handled by AuthContext or SignupPage
      } else {
        toast({
          title: "ثبت نام ناموفق",
          description: "امکان ایجاد حساب شما وجود نداشت. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
       let errorMessage = "یک خطای غیرمنتظره رخ داد. لطفاً بعداً دوباره تلاش کنید.";
      if (error.message === "Email already exists") {
        errorMessage = "این ایمیل قبلاً ثبت شده است. لطفاً با ایمیل دیگری امتحان کنید یا وارد شوید."
      }
      toast({
        title: "خطا",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ایمیل</FormLabel>
              <FormControl>
                <Input dir="ltr" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رمز عبور</FormLabel>
              <FormControl>
                <Input dir="ltr" type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تکرار رمز عبور</FormLabel>
              <FormControl>
                <Input dir="ltr" type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Icons.Spinner className="ms-2 h-4 w-4 animate-spin" />}
          ایجاد حساب کاربری
        </Button>
      </form>
    </Form>
  );
}
