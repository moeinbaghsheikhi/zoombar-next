
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
  password: z.string().min(1, { message: "رمز عبور الزامی است." }),
});

export function LoginForm() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const user = await signIn(values.email, values.password);
      if (user) {
        toast({
          title: "ورود موفقیت‌آمیز",
          description: `خوش آمدید، ${user.email}!`,
        });
        // Redirect is handled by AuthContext or LoginPage
      } else {
        toast({
          title: "ورود ناموفق",
          description: "ایمیل یا رمز عبور نامعتبر است. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "یک خطای غیرمنتظره رخ داد. لطفاً بعداً دوباره تلاش کنید.",
        variant: "destructive",
      });
      console.error("Login error:", error);
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Icons.Spinner className="ms-2 h-4 w-4 animate-spin" />}
          ورود
        </Button>
      </form>
    </Form>
  );
}
