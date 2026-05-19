# CitrusMarket - Premium E-Commerce Platform

Welcome to **CitrusMarket**, a production-ready, secure, and modern full-stack e-commerce marketplace built using a high-contrast "Citrus" design language. This platform provides email/password & Google authentication, dynamic product catalog management, a Redux-powered persistent shopping cart, and a secure end-to-end checkout flow powered by Stripe Elements.

---

## 🏗️ Architecture Overview

The system consists of three main parts:
1. **Next.js Frontend (`/frontend`):** A hybrid React app utilizing Server Components for speed/SEO and Client Components for interaction. Exposes secure Next.js API Routes for authentication proxying.
2. **Serverless Functions (`/backend/functions`):** Firebase Cloud Functions (Node/TypeScript) that process transactions securely via the Stripe API and verify JSON Web Tokens (JWT).
3. **Database & Auth:** Google Firebase Auth handles login flows while Firestore provides real-time, ACID-compliant database storage.

---

## 🛠️ Step-by-Step Local Development Setup

Follow these steps to run the entire stack locally:

### 1. Configure the Frontend Environment
Create a file named `.env.local` inside the `/frontend` directory:
```env
# Stripe Keys (Get these from dashboard.stripe.com under Developers > API Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_WITH_YOURS
STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_YOURS

# Firebase Client configuration (From Project settings > General > Web app SDK setup)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDXeqxDGxYeRHq8bhSX8AM_9l4byUFapLc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=citrusmarket-d8e41.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=citrusmarket-d8e41
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=citrusmarket-d8e41.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=958548937245
NEXT_PUBLIC_FIREBASE_APP_ID=1:958548937245:web:6fe1db79772cccda5154f4
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-BNPLR3WJH2

# Firebase Admin SDK Configuration (Generated under Project settings > Service Accounts)
FIREBASE_PROJECT_ID=citrusmarket-d8e41
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@citrusmarket-d8e41.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCuGVMFRceaJFoK\n...YOUR_PRIVATE_KEY...\n-----END PRIVATE KEY-----\n"
```

### 2. Install and Start the Backend Emulators
Navigate to the backend directory, install the required packages, compile TypeScript, and boot the Firebase Emulator:
```bash
cd backend/functions
pnpm install
pnpm serve
```
*The Local Cloud Functions will start serving at `http://localhost:5001`.*

### 3. Seed Your Catalog Data
Seed Firestore with real, premium products (e.g., Wireless Headphones, Smart Watches, Soy Candles) so the storefront isn't blank:
```bash
# Run from the root directory
NODE_PATH=frontend/node_modules node scripts/seedProducts.js
```

### 4. Boot the Next.js Storefront
In a new terminal window, navigate to the frontend folder, install packages, and boot Vercel's Turbopack server:
```bash
cd frontend
pnpm install
pnpm dev
```
*Open `http://localhost:3000` to browse CitrusMarket!*

---

## 🚀 Production Deployment Guide

Ready to release CitrusMarket to your users? Follow this secure deployment process:

### 1. Deploy Firebase Cloud Functions & Security Rules
Initialize the Firebase CLI tools and push the backend components to the live Firebase console:
```bash
# Log in to your Firebase account
npx firebase login

# Deploy rules and functions
npx firebase deploy --only firestore:rules,functions
```

### 2. Deploy the Frontend on Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Set your Framework Preset to **Next.js**.
3. In the Vercel Dashboard, paste all your `.env.local` variables under **Environment Variables** (ensure `STRIPE_SECRET_KEY` and the Firebase private key are hidden).
4. Click **Deploy**!

### 👑 Elevating an Account to Admin
To access the Admin Dashboard features:
1. Register an account normally on the website.
2. Open your [Firebase Console](https://console.firebase.google.com).
3. Under **Firestore Database**, find the `users` collection.
4. Locate the document matching your user's UID and change the value of `role` from `"user"` to `"admin"`.
5. Refresh the website — you will see the **Admin Badge** in the Navbar and gain full dashboard access!

---

## 💳 Testing Stripe Payments
When checking out, input the standard Stripe Test Card credentials:
* **Card Number:** `4242 4242 4242 4242`
* **Expiration Date:** Any date in the future (e.g., `12/32`)
* **CVC:** `123`
* **ZIP:** `10001`
