// src/app/api/get-announcement-bar/route.ts
import { getUserBars, recordBarClick } from '@/lib/mockData'; // recordBarClick اضافه شد
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barId = searchParams.get('barId');
  const userId = searchParams.get('userId');

  if (!barId || !userId) {
    return NextResponse.json({ error: 'بار آیدی یا یوزر آیدی موجود نیست' }, { status: 400 });
  }

  // این یک عملیات فقط خواندنی است، اما اگر بخواهیم بازدیدها را ثبت کنیم، می‌توانیم recordBarClick را اینجا فراخوانی کنیم
  // await recordBarClick(userId, barId); // اگر می‌خواهید نمایش را به عنوان کلیک ثبت کنید (معمولاً کلیک واقعی متفاوت است)

  const userBars = getUserBars(userId);
  const bar = userBars.find(b => b.id === barId);

  if (!bar) {
    return NextResponse.json({ error: 'نوار اعلانات یافت نشد' }, { status: 404 });
  }

  // فقط داده‌های لازم برای نمایش را برگردانید
  const { title, clicks, createdAt, ...displayData } = bar; 

  return NextResponse.json(displayData);
}
