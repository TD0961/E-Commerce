import * as admin from 'firebase-admin';

export const onUserCreated = async (user: admin.auth.UserRecord) => {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(user.uid);

  const userData = {
    uid: user.uid,
    email: user.email,
    role: 'user', // default role
    createdAt: new Date().toISOString(),
  };

  await userRef.set(userData);
  
  // Set custom claims for role-based access control
  await admin.auth().setCustomUserClaims(user.uid, { role: 'user' });
};
