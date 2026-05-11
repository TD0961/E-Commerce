"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key'; // Use Firebase secrets in production
exports.stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: '2023-10-16', // Use the same apiVersion as frontend or your configured one
});
const createPaymentIntent = async (amount, metadata) => {
    return await exports.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata,
    });
};
exports.createPaymentIntent = createPaymentIntent;
//# sourceMappingURL=stripeService.js.map