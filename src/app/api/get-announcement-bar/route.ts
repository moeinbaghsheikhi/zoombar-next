
// src/app/api/get-announcement-bar/route.ts
import { getUserBars } from '@/lib/mockData';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const commonHeaders = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: commonHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const barId = searchParams.get('barId');
    const userId = searchParams.get('userId');

    if (!barId || !userId) {
      return NextResponse.json(
        { error: 'بار آیدی یا یوزر آیدی موجود نیست' },
        { status: 400, headers: commonHeaders }
      );
    }

    const userBars = getUserBars(userId);
    const bar = userBars.find(b => b.id === barId);

    if (!bar) {
      console.warn(`API /get-announcement-bar: Bar not found for userId=${userId}, barId=${barId}. This is expected if using localStorage-based mockData on server.`);
      return NextResponse.json(
        { error: 'نوار اعلانات یافت نشد (احتمالا به دلیل اجرای سمت سرور با mockData)' },
        { status: 404, headers: commonHeaders }
      );
    }
    
    const displayData = {
      message: bar.message,
      backgroundColor: bar.backgroundColor,
      textColor: bar.textColor,
      imageUrl: bar.imageUrl,
      expiresAt: bar.expiresAt,
      timerBackgroundColor: bar.timerBackgroundColor || '#FC4C1D', 
      timerTextColor: bar.timerTextColor || '#FFFFFF',         
      timerStyle: bar.timerStyle || 'square',                   
      timerPosition: bar.timerPosition || 'right',
      fontSize: bar.fontSize || 14, // Added font size
      // CTA data
      ctaText: bar.ctaText,
      ctaLink: bar.ctaLink,
      ctaBackgroundColor: bar.ctaBackgroundColor,
      ctaTextColor: bar.ctaTextColor,
      ctaLinkTarget: bar.ctaLinkTarget,
    };

    return NextResponse.json(displayData, { headers: commonHeaders });

  } catch (error: any) {
    console.error('API Error in get-announcement-bar:', error);
    return NextResponse.json(
      { error: 'خطای داخلی سرور', details: error.message },
      { status: 500, headers: commonHeaders }
    );
  }
}
