
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
          آماده‌اید تا تعامل را افزایش دهید؟
        </h2>
        <p className="text-lg md:text-xl opacity-90 mb-10 max-w-xl mx-auto">
          امروز به زوم‌بار لایت بپیوندید و شروع به ایجاد نوارهای اعلانات کنید که تبدیل ایجاد می‌کنند.
        </p>
        <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-gray-100">
          <Link href="/auth/signup">همین حالا ثبت نام کنید - رایگان است!</Link>
        </Button>
      </div>
    </section>
  );
}
