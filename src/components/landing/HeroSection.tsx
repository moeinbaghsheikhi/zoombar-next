
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          ایجاد <span className="text-primary">نوارهای اعلانات</span> خیره‌کننده
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          مخاطبان خود را جذب کرده و با نوارهای اعلانات زیبا و قابل تنظیم، نرخ تبدیل را افزایش دهید. بدون نیاز به کدنویسی.
        </p>
        <div className="flex justify-center space-x-4 rtl:space-x-reverse mb-16">
          <Button size="lg" asChild>
            <Link href="/auth/signup">شروع رایگان</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/#features">بیشتر بدانید</Link>
          </Button>
        </div>
        <div className="relative max-w-4xl mx-auto shadow-2xl rounded-lg overflow-hidden">
           <Image
            src="https://picsum.photos/1200/600?random=1"
            alt="پیش‌نمایش داشبورد زوم‌بار لایت"
            width={1200}
            height={600}
            className="w-full h-auto"
            data-ai-hint="dashboard application"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
