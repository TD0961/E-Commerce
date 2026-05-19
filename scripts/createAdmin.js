/**
 * Create Admin CLI Script
 *
 * Usage:
 *   node scripts/createAdmin.js <email> <password> <displayName>
 *
 * Example:
 *   node scripts/createAdmin.js admin@citrusmarket.com CitrusAdmin123! "Citrus Admin"
 */

const admin = require('firebase-admin');

// Service Account Details
const serviceAccount = {
  type: "service_account",
  project_id: "citrusmarket-d8e41",
  private_key_id: "7da4b924e6caa4729044b19f95c9d5b4c9028d39",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCuGVMFRceaJFoK\nmCx/c2faZ/Z5fWjkhtmFhZ1tgHWcF7zqun5OJrEVD63QHxr4k265L5GivGBvloBU\nB3oz3zusFoDBd7vr6p/n82scUAbQ0AMMlozZivJtPp1MOocrQerXcoc1v7vgRZ8f\nLv5yVmELJxLzyij2p79sT0yNRnL48T55R7x5D8L7K18zuJ4ZLoR0KMYCutNRPhte\ndtFcuBHKIbCzrsHqBWC7a3ff00WgcnvFwfhy/S0HiPJm7Fd98MWZ0vdsCJF6obSZ\ngsHABJAezHnKuQzwF6L18yLGYzkRtP5ksmALl32saFv+aEPk8N1IXGCsvj+Yf7B5\nMQJqsc0HAgMBAAECggEABvAZaodfr0PYQWh+YCHa4fhB+Ttx16bhZOcbNpw86O3a\nkxwVdnXSRBLuNpysDXs1RAn3lXLzq4llhHO71J9bwxLZKgc5z5VNBAhOR2rk//ia\nISv1YaHzi+jyicbMpiun+Sf7kr0Y9pSvr6VxcbWsLllDRxXSUL9Z6y4J0JjIciUn\neaMhKFt5YzwehrSPl+mNxSVcxOZGjE4gbCaXnTkxUbd8LsKIMTtumU8XHnbqFCV/\nPevv9oVTQkxzRLp2BOLtw6bRRLD09Gt/55J1Ml3LMDWley3Qw6uh8gYnylvC1aRu\nH+3S7bRl7N0b3NxgyfRpBjtc6nukvD5cWuiPUUnE+QKBgQDceC0esHCICc38shLz\nfmBYqrjoQFDdZhHXDQ3NGk8HXrYl5Ja3vcoGmFkZWk3fJYqpC/c8OEIJqVlIgr1r\nP/DaqMCVsd/eFxrkOhuYqKnb3yZOOVV9a5C0VcJOSYkZ4Ga2qDbNZ5DiL5CieLgt\nsn5uJBhMCYQ8Jt5RVHHdcRhAEwKBgQDKKA6thHe4RpgO0Cdq+ZPx0fOuW0prSq2N\nL7B2/twQovPFAoSWTTQ2jD8wRCuGyeMlOA8Zsnw61Pv7uNGhg/4GMz6pqG17N9Rq\nUzZ3ZSbckWH6Nvvb9aupnpRwMZ2GiITmsTcaL4LnCWcGzIivA0/NRw7wOKelSewS\nIy/IKdFlvQKBgE92TSTjiRuvFPxAHo5+fTFYDx8+lybFNCbjgJbtJZDNdS9BLYV6\nNUedP3fg0XJdMJXvRyQATuT2kcSNwsHWIPReoFMT8lE02K9rtiiWmeoyirbk+Ugk\nLdqhkk/vNygJdlvdUytDabfsVuAITLHDxMfj4JH/WBbqF3UOz591tLzbAoGAM85e\nLJOFBsF4mFs5rs1034TZePZGNQa3QTZWd7hKdyz7YaKKjeYNGmmIi/r8WJeGUXRz\nUjeOZJlOViz/8+9aewZI6buTCv+8vN7EV4ahlebf//p1QuJLcrWD/tiIMQDtZh1G\nLLy+RC0BrRlfcdJcchPivScXt2EhUWiZByfIVNUCgYBDQ4l2FasnGJ2UOYU65En8\ny24o1M9hjGIai5xe6cRHwvx3lL7k0vWU1rukXdGfWmfBhFrWyjZzvC9JA2XD9ShU\n40tHsXtGiI+YOp7+plkkJol5W/JDz2A2KSDo3qa1PjxSYYVTaO5RJsDuupUo5hmO\n4YcKNC1n4FRRbv45J9QF0Q==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@citrusmarket-d8e41.iam.gserviceaccount.com",
};

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const auth = admin.auth();
const db = admin.firestore();

// Fetch Command Line Arguments or use defaults
const email = process.argv[2] || 'admin@citrusmarket.com';
const password = process.argv[3] || 'CitrusAdmin123!';
const displayName = process.argv[4] || 'Citrus Admin';

async function createAdmin() {
  console.log(`🔑 Initializing CitrusMarket Admin Creator...`);
  console.log(`  📧 Target Email: ${email}`);
  console.log(`  👤 Display Name: ${displayName}\n`);

  let userRecord;
  try {
    // 1. Check if user already exists in Firebase Auth
    userRecord = await auth.getUserByEmail(email);
    console.log(`ℹ️  Auth Account already exists (UID: ${userRecord.uid}). Elevating claims...`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // 2. Create user if not found
      console.log(`🌱 Auth account not found. Creating new auth account...`);
      userRecord = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true
      });
      console.log(`✅ Auth account successfully created (UID: ${userRecord.uid})`);
    } else {
      throw error;
    }
  }

  const uid = userRecord.uid;

  // 3. Set Custom Claims role='admin'
  console.log(`🛠️  Applying custom claims (role='admin')...`);
  await auth.setCustomUserClaims(uid, { role: 'admin' });
  console.log(`✅ Custom claims successfully committed.`);

  // 4. Create or update profile document in Firestore collection '/users'
  console.log(`🗄️  Syncing profile document to Firestore '/users/${uid}'...`);
  await db.collection('users').doc(uid).set({
    uid,
    name: displayName,
    email,
    role: 'admin',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  console.log(`✅ Profile successfully committed to database.`);

  console.log(`\n🎉 CITRUSMARKET ADMIN ACCOUNT CREATED SUCCESSFULLY!`);
  console.log(`-----------------------------------------------`);
  console.log(`Login Credentials:`);
  console.log(`  📧 Email:    ${email}`);
  console.log(`  🔑 Password: ${password}`);
  console.log(`-----------------------------------------------`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('\n❌ Admin creation failed:', err.message || err);
  process.exit(1);
});
