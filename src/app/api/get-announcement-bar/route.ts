
// src/app/api/get-announcement-bar/route.ts
import { getUserBars } from '@/lib/mockData';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const commonHeaders = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS preflight request for CORS
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

    // IMPORTANT: getUserBars uses localStorage and will return [] on the server.
    // This API, as is, can only work correctly if the data source is server-accessible.
    // For this mock, it will likely always result in "bar not found" when hit by the snippet.
    const userBars = getUserBars(userId); // This will be empty on server-side for mockData
    const bar = userBars.find(b => b.id === barId);

    if (!bar) {
      // For a real app, you'd fetch from a DB here.
      // Since mockData relies on localStorage, this API is more of a placeholder
      // for what the script *expects* to receive.
      // The actual data for the demo will be hardcoded or fetched differently by the script.
      // Let's log this situation:
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
      expiresAt: bar.expiresAt, // ارسال تاریخ انقضا
      // We are not returning title, clicks, createdAt to the public snippet
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
