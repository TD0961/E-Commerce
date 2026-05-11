import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key'; // Use Firebase secrets in production

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Using version that matches ^14.20.0 SDK
});

export const createPaymentIntent = async (amount: number, metadata: any) => {
  return await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata,
  });
};
