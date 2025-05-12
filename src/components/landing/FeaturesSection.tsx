
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

const features = [
  {
    icon: <Icons.FeatureFast className="h-10 w-10 text-primary" />,
    title: 'راه‌اندازی سریع',
    description: 'با ویرایشگر بصری و قالب‌های آماده ما، نوارهای اعلانات را در چند دقیقه ایجاد و راه‌اندازی کنید.',
  },
  {
    icon: <Icons.Palette className="h-10 w-10 text-primary" />,
    title: 'کاملاً قابل تنظیم',
    description: 'متن، رنگ‌ها، تصاویر و موارد دیگر را برای تطابق کامل با برند و پیام خود سفارشی کنید.',
  },
  {
    icon: <Icons.FeatureStats className="h-10 w-10 text-primary" />,
    title: 'پیگیری کلیک‌ها',
    description: 'عملکرد را با آمار کلیک داخلی نظارت کنید تا تعامل را درک کرده و نوارهای خود را بهینه کنید.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">چرا زوم‌بار لایت را انتخاب کنیم؟</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
            هر آنچه برای ایجاد نوارهای اعلانات مؤثر نیاز دارید، به سادگی.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                {feature.icon}
                <CardTitle className="mt-4 text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
