import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAuth, verifyAdmin } from '@/lib/authUtil';

export async function GET(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth(req);
    const userId = decodedToken.uid;
    const isAdmin = decodedToken.role === 'admin';

    let snapshot;
    if (isAdmin) {
      // Admin can see all orders
      snapshot = await adminDb.collection('orders').orderBy('createdAt', 'desc').get();
    } else {
      // User can only see their own orders
      snapshot = await adminDb.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
    }

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
