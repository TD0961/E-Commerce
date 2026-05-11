import * as functions from 'firebase-functions';
import { handleCheckout } from './controllers/checkoutController';
import { stripeWebhookHandler } from './stripe/webhookHandler';
import { onUserCreated } from './auth/authTriggers';

// 1. Checkout HTTP Function
export const checkout = functions.https.onRequest(handleCheckout);

// 2. Stripe Webhook HTTP Function
export const stripeWebhook = functions.https.onRequest(stripeWebhookHandler);

// 3. Auth Trigger
export const handleUserCreation = functions.auth.user().onCreate(onUserCreated);
