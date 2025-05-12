
import { ZoomBarLogo } from '@/components/icons';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 bg-background">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <ZoomBarLogo size="sm" />
          <p>&copy; {new Date().getFullYear()} زوم‌بار لایت. تمامی حقوق محفوظ است.</p>
          <div className="flex space-x-4 rtl:space-x-reverse">
            <Link href="/#" className="hover:text-primary">سیاست حفظ حریم خصوصی</Link>
            <Link href="/#" className="hover:text-primary">شرایط خدمات</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
