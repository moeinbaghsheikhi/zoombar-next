
"use client";

import { LoginForm } from '@/components/auth/LoginForm';
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams for next param
import { useEffect } from 'react';
import { Icons } from '@/components/icons';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // To get query parameters

  useEffect(() => {
    if (!isLoading && user) {
      const nextUrl = searchParams.get('next');
      if (user.role === 'admin') {
        router.replace(nextUrl && nextUrl.startsWith('/admin') ? nextUrl : '/admin/dashboard');
      } else {
        router.replace(nextUrl && !nextUrl.startsWith('/admin') ? nextUrl : '/dashboard');
      }
    }
  }, [user, isLoading, router, searchParams]);

  if (isLoading || (!isLoading && user)) { 
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/50">
        <Icons.Spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthFormWrapper
      title="خوش آمدید!"
      description="وارد حساب کاربری زوم‌بار لایت خود شوید."
      footerContent={
        <>
          حساب کاربری ندارید؟{' '}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            ثبت نام کنید
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthFormWrapper>
  );
}
