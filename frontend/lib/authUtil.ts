import { NextRequest } from 'next/server';
import { adminAuth } from './firebaseAdmin';

export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

export async function verifyAdmin(req: NextRequest) {
  const decodedToken = await verifyAuth(req);
  if (decodedToken.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return decodedToken;
}
