'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAppDispatch } from '@/lib/hooks';
import { setUser } from '@/features/authSlice';

/**
 * AuthProvider — mounts once in the layout.
 * Listens to Firebase auth state changes and syncs them to Redux.
 * This ensures auth persists across page refreshes.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role from Firestore users collection
        const ref = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref);
        const role: 'user' | 'admin' = snap.exists() ? snap.data().role : 'user';

        dispatch(setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email!,
          role,
        }));
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [dispatch]);

  return <>{children}</>;
}
