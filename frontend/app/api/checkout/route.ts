import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // In production, the URL to the Cloud Function should come from process.env
    // Here we assume standard Firebase functions local emulator or prod URL.
    const checkoutFunctionUrl = process.env.NEXT_PUBLIC_CHECKOUT_FUNCTION_URL || 'http://127.0.0.1:5001/your-project-id/us-central1/checkout';

    const response = await fetch(checkoutFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, message: data.error || 'Checkout failed' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
