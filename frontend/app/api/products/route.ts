import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdmin } from '@/lib/authUtil';

export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb.collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only admins can create products
    await verifyAdmin(req);

    const body = await req.json();
    const { name, description, price, stock, category, imageUrls } = body;

    if (!name || !price || stock === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = {
      name,
      description: description || '',
      price: Number(price),
      stock: Number(stock),
      category: category || 'Uncategorized',
      imageUrls: imageUrls || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('products').add(newProduct);
    
    return NextResponse.json({ success: true, data: { id: docRef.id, ...newProduct } }, { status: 201 });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
