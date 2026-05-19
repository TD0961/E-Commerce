import { loadStripe } from '@stripe/stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables.');
}

const stripePromise = loadStripe(publishableKey || 'pk_test_placeholder');

export default stripePromise;
