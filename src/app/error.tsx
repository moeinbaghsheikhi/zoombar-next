
"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <Icons.Warning className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-3xl font-bold text-destructive mb-2">اوپس! مشکلی پیش آمد.</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        با یک خطای غیرمنتظره مواجه شدیم. لطفاً دوباره تلاش کنید، یا اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.
      </p>
      {error?.message && (
        <pre dir="ltr" className="mb-6 whitespace-pre-wrap rounded-md bg-muted p-4 text-sm text-muted-foreground max-w-full overflow-x-auto text-left">
          خطا: {error.message}
        </pre>
      )}
      <Button
        onClick={() => reset()}
        size="lg"
      >
        دوباره تلاش کنید
      </Button>
    </div>
  );
}
