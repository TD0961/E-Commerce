import { Request, Response } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { stripe } from './stripeService';
import { Order, UserInteraction } from '../types';

export const stripeWebhookHandler = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    res.status(400).send('Missing signature or secret');
    return;
  }

  let event;

  try {
    // req.rawBody is available in Firebase Functions
    event = stripe.webhooks.constructEvent((req as any).rawBody, sig, endpointSecret);
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const db = admin.firestore();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        const paymentIntentId = paymentIntent.id;

        await db.runTransaction(async (transaction) => {
          const ordersSnapshot = await transaction.get(
            db.collection('orders').where('paymentIntentId', '==', paymentIntentId).limit(1)
          );

          if (!ordersSnapshot.empty) {
            const orderDoc = ordersSnapshot.docs[0];
            const orderData = orderDoc.data() as Order;

            if (orderData.status === 'paid' || orderData.status === 'failed') {
              console.log(`Order ${orderDoc.id} already processed. Status: ${orderData.status}`);
              return; // Idempotency check
            }

            if (event.type === 'payment_intent.succeeded') {
              transaction.update(orderDoc.ref, {
                status: 'paid',
                updatedAt: new Date().toISOString()
              });

              // Log purchase for ML recommendation
              const interactionRef = db.collection('user_interactions').doc();
              const interactionData: UserInteraction = {
                userId: orderData.userId,
                event: 'purchase_completed',
                productIds: orderData.items.map(item => item.productId),
                timestamp: new Date().toISOString(),
              };
              transaction.set(interactionRef, interactionData);

            } else if (event.type === 'payment_intent.payment_failed') {
              transaction.update(orderDoc.ref, {
                status: 'failed',
                updatedAt: new Date().toISOString()
              });

              // Revert stock (compensating transaction)
              for (const item of orderData.items) {
                const productRef = db.collection('products').doc(item.productId);
                transaction.update(productRef, {
                  stock: admin.firestore.FieldValue.increment(item.quantity)
                });
              }
            }
          }
        });
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};
