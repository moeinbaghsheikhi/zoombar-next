import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Vazirmatn } from 'next/font/google'; // Import Vazirmatn
import './globals.css';
import { Providers } from '@/components/Providers';
import { cn } from '@/lib/utils';
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: 'زوم‌بار لایت - نوارهای اعلانات مدرن',
  description: 'به راحتی نوارهای اعلانات را برای وب‌سایت خود ایجاد و مدیریت کنید.',
};

// Configure Vazirmatn font
const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'], // Include 'arabic' for Persian characters
  variable: '--font-vazirmatn', // CSS variable name
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={cn(vazirmatn.variable, GeistSans.variable, GeistMono.variable)}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
