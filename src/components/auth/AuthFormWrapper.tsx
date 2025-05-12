
import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ZoomBarLogo } from '@/components/icons';
import Link from 'next/link';

interface AuthFormWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
  footerContent?: ReactNode;
}

export function AuthFormWrapper({ title, description, children, footerContent }: AuthFormWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/50 p-4">
      <div className="mb-8">
        <Link href="/">
          <ZoomBarLogo size="lg" />
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          {footerContent && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footerContent}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
