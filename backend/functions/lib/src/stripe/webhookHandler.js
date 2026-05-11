"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const stripeService_1 = require("./stripeService");
const stripeWebhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !endpointSecret) {
        res.status(400).send('Missing signature or secret');
        return;
    }
    let event;
    try {
        // req.rawBody is available in Firebase Functions
        event = stripeService_1.stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    const db = admin.firestore();
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;
                // Find the order with this paymentIntentId
                const ordersSnapshot = await db.collection('orders')
                    .where('paymentIntentId', '==', paymentIntentId)
                    .limit(1)
                    .get();
                if (!ordersSnapshot.empty) {
                    const orderDoc = ordersSnapshot.docs[0];
                    await orderDoc.ref.update({
                        status: 'paid',
                        updatedAt: new Date().toISOString()
                    });
                    // Log purchase for ML recommendation
                    const orderData = orderDoc.data();
                    const interactionRef = db.collection('user_interactions').doc();
                    await interactionRef.set({
                        userId: orderData.userId,
                        event: 'purchase_completed',
                        productIds: orderData.items.map((item) => item.productId),
                        timestamp: new Date().toISOString(),
                    });
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;
                const ordersSnapshot = await db.collection('orders')
                    .where('paymentIntentId', '==', paymentIntentId)
                    .limit(1)
                    .get();
                if (!ordersSnapshot.empty) {
                    const orderDoc = ordersSnapshot.docs[0];
                    const orderData = orderDoc.data();
                    // Revert stock (compensating transaction)
                    const batch = db.batch();
                    for (const item of orderData.items) {
                        const productRef = db.collection('products').doc(item.productId);
                        batch.update(productRef, {
                            stock: admin.firestore.FieldValue.increment(item.quantity)
                        });
                    }
                    // Mark order failed
                    batch.update(orderDoc.ref, {
                        status: 'failed',
                        updatedAt: new Date().toISOString()
                    });
                    await batch.commit();
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Error handling webhook event', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
};
exports.stripeWebhookHandler = stripeWebhookHandler;
//# sourceMappingURL=webhookHandler.js.map