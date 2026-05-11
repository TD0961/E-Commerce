import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { verifyAdmin } from '@/lib/authUtil';

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    // List users from Auth (for auth info) and Firestore (for metadata)
    const listUsersResult = await adminAuth.listUsers(100);
    const authUsers = listUsersResult.users;

    const snapshot = await adminDb.collection('users').get();
    const dbUsersMap = new Map();
    snapshot.docs.forEach(doc => {
      dbUsersMap.set(doc.id, doc.data());
    });

    const combinedUsers = authUsers.map(user => {
      const dbData = dbUsersMap.get(user.uid) || {};
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: dbData.role || 'user',
        createdAt: dbData.createdAt || user.metadata.creationTime,
      };
    });

    return NextResponse.json({ success: true, data: combinedUsers }, { status: 200 });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const body = await req.json();
    const { uid, role } = body;

    if (!uid || !role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid uid or role' }, { status: 400 });
    }

    // Update custom claim
    await adminAuth.setCustomUserClaims(uid, { role });

    // Update Firestore document
    await adminDb.collection('users').doc(uid).update({ role, updatedAt: new Date().toISOString() });

    return NextResponse.json({ success: true, message: `User ${uid} role updated to ${role}` }, { status: 200 });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
