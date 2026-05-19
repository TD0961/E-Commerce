import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdmin } from '@/lib/authUtil';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const docSnap = await adminDb.collection('products').doc(resolvedParams.id).get();

    if (!docSnap.exists) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { id: docSnap.id, ...docSnap.data() },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(req);
    const resolvedParams = await params;
    const docRef = adminDb.collection('products').doc(resolvedParams.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, price, stock, category, image } = body;

    const updatedData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(category && { category }),
      ...(image && { image }),
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updatedData);

    return NextResponse.json({
      success: true,
      data: { id: resolvedParams.id, ...docSnap.data(), ...updatedData },
    }, { status: 200 });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(req);
    const resolvedParams = await params;
    const docRef = adminDb.collection('products').doc(resolvedParams.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    }, { status: 200 });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
