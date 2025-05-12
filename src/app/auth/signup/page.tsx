
"use client";

import { SignupForm } from '@/components/auth/SignupForm';
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icons } from '@/components/icons';

export default function SignupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || (!isLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/50">
        <Icons.Spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <AuthFormWrapper
      title="حساب کاربری خود را ایجاد کنید"
      description="همین امروز با زوم‌بار لایت شروع کنید."
      footerContent={
        <>
          قبلاً حساب کاربری ساخته‌اید؟{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            وارد شوید
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthFormWrapper>
  );
}
