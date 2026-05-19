/**
 * Firestore Product Seed Script
 *
 * Run once to populate your Firestore with products:
 *   node scripts/seedProducts.js
 *
 * Prerequisites:
 *   npm install firebase-admin   (in root or backend/functions)
 */

const admin = require('firebase-admin');

// Load your service account JSON
const serviceAccount = {
  type: "service_account",
  project_id: "citrusmarket-d8e41",
  private_key_id: "7da4b924e6caa4729044b19f95c9d5b4c9028d39",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCuGVMFRceaJFoK\nmCx/c2faZ/Z5fWjkhtmFhZ1tgHWcF7zqun5OJrEVD63QHxr4k265L5GivGBvloBU\nB3oz3zusFoDBd7vr6p/n82scUAbQ0AMMlozZivJtPp1MOocrQerXcoc1v7vgRZ8f\nLv5yVmELJxLzyij2p79sT0yNRnL48T55R7x5D8L7K18zuJ4ZLoR0KMYCutNRPhte\ndtFcuBHKIbCzrsHqBWC7a3ff00WgcnvFwfhy/S0HiPJm7Fd98MWZ0vdsCJF6obSZ\ngsHABJAezHnKuQzwF6L18yLGYzkRtP5ksmALl32saFv+aEPk8N1IXGCsvj+Yf7B5\nMQJqsc0HAgMBAAECggEABvAZaodfr0PYQWh+YCHa4fhB+Ttx16bhZOcbNpw86O3a\nkxwVdnXSRBLuNpysDXs1RAn3lXLzq4llhHO71J9bwxLZKgc5z5VNBAhOR2rk//ia\nISv1YaHzi+jyicbMpiun+Sf7kr0Y9pSvr6VxcbWsLllDRxXSUL9Z6y4J0JjIciUn\neaMhKFt5YzwehrSPl+mNxSVcxOZGjE4gbCaXnTkxUbd8LsKIMTtumU8XHnbqFCV/\nPevv9oVTQkxzRLp2BOLtw6bRRLD09Gt/55J1Ml3LMDWley3Qw6uh8gYnylvC1aRu\nH+3S7bRl7N0b3NxgyfRpBjtc6nukvD5cWuiPUUnE+QKBgQDceC0esHCICc38shLz\nfmBYqrjoQFDdZhHXDQ3NGk8HXrYl5Ja3vcoGmFkZWk3fJYqpC/c8OEIJqVlIgr1r\nP/DaqMCVsd/eFxrkOhuYqKnb3yZOOVV9a5C0VcJOSYkZ4Ga2qDbNZ5DiL5CieLgt\nsn5uJBhMCYQ8Jt5RVHHdcRhAEwKBgQDKKA6thHe4RpgO0Cdq+ZPx0fOuW0prSq2N\nL7B2/twQovPFAoSWTTQ2jD8wRCuGyeMlOA8Zsnw61Pv7uNGhg/4GMz6pqG17N9Rq\nUzZ3ZSbckWH6Nvvb9aupnpRwMZ2GiITmsTcaL4LnCWcGzIivA0/NRw7wOKelSewS\nIy/IKdFlvQKBgE92TSTjiRuvFPxAHo5+fTFYDx8+lybFNCbjgJbtJZDNdS9BLYV6\nNUedP3fg0XJdMJXvRyQATuT2kcSNwsHWIPReoFMT8lE02K9rtiiWmeoyirbk+Ugk\nLdqhkk/vNygJdlvdUytDabfsVuAITLHDxMfj4JH/WBbqF3UOz591tLzbAoGAM85e\nLJOFBsF4mFs5rs1034TZePZGNQa3QTZWd7hKdyz7YaKKjeYNGmmIi/r8WJeGUXRz\nUjeOZJlOViz/8+9aewZI6buTCv+8vN7EV4ahlebf//p1QuJLcrWD/tiIMQDtZh1G\nLLy+RC0BrRlfcdJcchPivScXt2EhUWiZByfIVNUCgYBDQ4l2FasnGJ2UOYU65En8\ny24o1M9hjGIai5xe6cRHwvx3lL7k0vWU1rukXdGfWmfBhFrWyjZzvC9JA2XD9ShU\n40tHsXtGiI+YOp7+plkkJol5W/JDz2A2KSDo3qa1PjxSYYVTaO5RJsDuupUo5hmO\n4YcKNC1n4FRRbv45J9QF0Q==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@citrusmarket-d8e41.iam.gserviceaccount.com",
  client_id: "113635235976240048763",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const products = [
  {
    name: 'Premium Wireless Headphones',
    description: 'High-fidelity audio with active noise cancellation. 30-hour battery life.',
    price: 89.99,
    stock: 50,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    rating: 4.8,
    reviews: 234,
    featured: true,
    trending: true,
    inStock: true,
  },
  {
    name: 'Minimalist Leather Wallet',
    description: 'Slim RFID-blocking genuine leather wallet. Fits up to 8 cards.',
    price: 34.99,
    stock: 120,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
    rating: 4.6,
    reviews: 89,
    featured: true,
    trending: false,
    inStock: true,
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: '100% organic cotton. Soft, breathable, and sustainably made.',
    price: 24.99,
    stock: 200,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
    rating: 4.5,
    reviews: 312,
    featured: false,
    trending: true,
    inStock: true,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-walled insulated bottle. Keeps drinks cold 24h, hot 12h.',
    price: 29.99,
    stock: 80,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    rating: 4.7,
    reviews: 156,
    featured: true,
    trending: true,
    inStock: true,
  },
  {
    name: 'Scented Soy Candle Set',
    description: 'Set of 3 hand-poured soy candles. Lavender, vanilla, and citrus.',
    price: 39.99,
    stock: 60,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800&q=80',
    rating: 4.9,
    reviews: 78,
    featured: true,
    trending: false,
    inStock: true,
  },
  {
    name: 'Vitamin C Serum',
    description: 'Brightening serum with 20% Vitamin C, hyaluronic acid, and niacinamide.',
    price: 44.99,
    stock: 90,
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80',
    rating: 4.7,
    reviews: 203,
    featured: false,
    trending: true,
    inStock: true,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'TKL layout with Cherry MX Blue switches. RGB backlit.',
    price: 79.99,
    stock: 35,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80',
    rating: 4.6,
    reviews: 145,
    featured: false,
    trending: true,
    inStock: true,
  },
  {
    name: 'Yoga Mat Pro',
    description: 'Non-slip 6mm thick eco-friendly yoga mat with carrying strap.',
    price: 49.99,
    stock: 70,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1601925228869-ba4a05eba22e?w=800&q=80',
    rating: 4.8,
    reviews: 192,
    featured: true,
    trending: false,
    inStock: true,
  },
];

async function seed() {
  console.log('🌱 Seeding Firestore products...');
  const batch = db.batch();

  for (const product of products) {
    const ref = db.collection('products').doc();
    batch.set(ref, {
      ...product,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✅ Queued: ${product.name}`);
  }

  await batch.commit();
  console.log(`\n🎉 Successfully seeded ${products.length} products to Firestore!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
