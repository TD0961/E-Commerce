import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

// ─── Types ────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// ─── Helper: upsert user document in Firestore ────────────
async function upsertUserDoc(uid: string, email: string, name: string, role: 'user' | 'admin' = 'user') {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email,
      name,
      role,
      createdAt: serverTimestamp(),
    });
  }
  return snap.exists() ? (snap.data().role as 'user' | 'admin') : role;
}

// ─── Async Thunks ─────────────────────────────────────────

/** Email/Password Login */
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      const role: 'user' | 'admin' = snap.exists() ? snap.data().role : 'user';
      return {
        id: uid,
        name: cred.user.displayName || email.split('@')[0],
        email: cred.user.email!,
        role,
      } as User;
    } catch (err: any) {
      return rejectWithValue(friendlyError(err.code));
    }
  }
);

/** Email/Password Register */
export const registerWithEmail = createAsyncThunk(
  'auth/registerWithEmail',
  async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const role = await upsertUserDoc(cred.user.uid, email, name);
      return {
        id: cred.user.uid,
        name,
        email,
        role,
      } as User;
    } catch (err: any) {
      return rejectWithValue(friendlyError(err.code));
    }
  }
);

/** Google Sign-In */
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const { uid, email, displayName } = cred.user;
      const role = await upsertUserDoc(uid, email!, displayName || 'User');
      return {
        id: uid,
        name: displayName || 'User',
        email: email!,
        role,
      } as User;
    } catch (err: any) {
      return rejectWithValue(friendlyError(err.code));
    }
  }
);

/** Sign Out */
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await signOut(auth);
});

// ─── Friendly error messages ──────────────────────────────
function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential': 'Incorrect email or password.',
  };
  return map[code] || 'An unexpected error occurred. Please try again.';
}

// ─── Slice ────────────────────────────────────────────────
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Used by the auth state listener in layout
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = 'succeeded';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => { state.status = 'loading'; state.error = null; };
    const fulfilled = (state: AuthState, action: PayloadAction<User>) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.isAuthenticated = true;
    };
    const rejected = (state: AuthState, action: any) => {
      state.status = 'failed';
      state.error = action.payload as string;
    };

    builder
      .addCase(loginWithEmail.pending, pending)
      .addCase(loginWithEmail.fulfilled, fulfilled)
      .addCase(loginWithEmail.rejected, rejected)
      .addCase(registerWithEmail.pending, pending)
      .addCase(registerWithEmail.fulfilled, fulfilled)
      .addCase(registerWithEmail.rejected, rejected)
      .addCase(loginWithGoogle.pending, pending)
      .addCase(loginWithGoogle.fulfilled, fulfilled)
      .addCase(loginWithGoogle.rejected, rejected)
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
