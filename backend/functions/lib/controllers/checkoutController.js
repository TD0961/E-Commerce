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
exports.handleCheckout = void 0;
const admin = __importStar(require("firebase-admin"));
const stripeService_1 = require("../stripe/stripeService");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const handleCheckout = async (req, res) => {
    try {
        // Basic CORS support
        res.set('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.status(204).send('');
            return;
        }
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        // Verify Auth Token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;
        const { items, idempotencyKey } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: 'Invalid cart data' });
            return;
        }
        // Start a transaction to lock stock and create order
        const result = await db.runTransaction(async (transaction) => {
            let orderRef = db.collection('orders').doc();
            if (idempotencyKey) {
                orderRef = db.collection('orders').doc(idempotencyKey);
                const existingOrder = await transaction.get(orderRef);
                if (existingOrder.exists) {
                    const existingData = existingOrder.data();
                    return {
                        clientSecret: existingData.clientSecret, // We need to store this or fetch from Stripe. Let's just return a generic duplicate response for simplicity since this is an edge case.
                        orderId: orderRef.id,
                        totalAmount: existingData.totalAmount,
                        duplicate: true
                    };
                }
            }
            let totalAmount = 0;
            const orderItems = [];
            const productRefs = items.map(item => db.collection('products').doc(item.productId));
            // 1. Re-fetch all products
            const productDocs = await transaction.getAll(...productRefs);
            // 2. Validate stock and calculate total
            for (let i = 0; i < productDocs.length; i++) {
                const doc = productDocs[i];
                const requestedItem = items[i];
                if (!doc.exists) {
                    throw new Error(`Product ${requestedItem.productId} not found`);
                }
                const productData = doc.data();
                if (productData.stock < requestedItem.quantity) {
                    throw new Error(`Insufficient stock for product ${productData.name}`);
                }
                // Accumulate total (assuming price is in dollars/cents properly)
                const price = productData.price;
                totalAmount += price * requestedItem.quantity;
                orderItems.push({
                    productId: doc.id,
                    quantity: requestedItem.quantity,
                    priceSnapshot: price,
                    name: productData.name
                });
                // 3. Deduct stock (atomic)
                transaction.update(doc.ref, {
                    stock: productData.stock - requestedItem.quantity,
                });
            }
            // 4. Create Stripe Payment Intent
            // Stripe amount must be in cents
            const paymentIntent = await (0, stripeService_1.createPaymentIntent)(Math.round(totalAmount * 100), { userId });
            // 5. Create Order Document (Pending)
            const orderData = {
                id: orderRef.id,
                userId,
                items: orderItems,
                totalAmount,
                status: 'pending',
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                createdAt: new Date().toISOString(),
            };
            transaction.set(orderRef, orderData);
            // Also log interaction for future AI recommendation engine
            const interactionRef = db.collection('user_interactions').doc();
            transaction.set(interactionRef, {
                userId,
                event: 'checkout_started',
                productIds: orderItems.map(item => item.productId),
                timestamp: new Date().toISOString(),
            });
            return {
                clientSecret: paymentIntent.client_secret,
                orderId: orderRef.id,
                totalAmount
            };
        });
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.handleCheckout = handleCheckout;
//# sourceMappingURL=checkoutController.js.map