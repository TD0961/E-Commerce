'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripeClient';
import CheckoutForm from '@/components/CheckoutForm';
import { useAppSelector } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, Loader2, Lock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import Button from '@/components/Button';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount } = useAppSelector(state => state.cart);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent duplicate calls using a ref
  const checkoutStarted = useRef(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    if (checkoutStarted.current) return;
    checkoutStarted.current = true;

    async function initializeCheckout() {
      setIsLoading(true);
      setError(null);

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User authentication state is out of sync');
        }

        const token = await currentUser.getIdToken();
        const idempotencyKey = `order_${Date.now()}_${currentUser.uid}`;

        // Map frontend items (with 'id') to backend CartItem expectation (with 'productId')
        const itemsForBackend = items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        }));

        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: itemsForBackend,
            idempotencyKey,
          }),
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.message || 'Failed to initialize payment intent');
        }

        if (json.success) {
          setClientSecret(json.clientSecret);
          setOrderId(json.orderId);
        } else {
          throw new Error(json.message || 'Failed to initialize checkout session');
        }
      } catch (err: any) {
        console.error('Checkout initialization error:', err);
        setError(err.message || 'An error occurred during checkout setup.');
      } finally {
        setIsLoading(false);
      }
    }

    initializeCheckout();
  }, [isAuthenticated, items, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center transition-all duration-300">
        <Loader2 className="w-16 h-16 text-[#FF7A00] animate-spin mb-4" />
        <h2 className="text-2xl font-extrabold text-text-main mb-2 tracking-tight">Preparing Secure Checkout</h2>
        <p className="text-text-muted font-medium">Verifying your cart and reserving inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 transition-all duration-300">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-main mb-2 tracking-tight">Checkout Error</h2>
        <p className="text-red-500 mb-6 max-w-md font-semibold">{error}</p>
        <Link href="/cart">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to Cart
          </Button>
        </Link>
      </div>
    );
  }

  const shipping = totalAmount > 50 ? 0 : 10;
  const tax = totalAmount * 0.08;
  const total = totalAmount + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto pb-16 transition-all duration-300">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cart" className="p-2 hover:bg-secondary rounded-full text-text-muted hover:text-text-main transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Secure Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Side: Stripe Payment Element */}
        <div className="lg:col-span-2 bg-surface rounded-3xl p-6 md:p-8 shadow-soft border border-secondary-dark/20">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-secondary-dark/20">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-[#FF7A00]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-text-main tracking-tight">Payment Method</h2>
              <p className="text-xs text-text-muted font-medium">All transactions are secure and encrypted.</p>
            </div>
          </div>

          {clientSecret && orderId && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} orderId={orderId} totalAmount={total} />
            </Elements>
          )}
        </div>

        {/* Right Side: Order Summary Review */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-soft border border-secondary-dark/20">
            <h2 className="text-xl font-extrabold text-text-main mb-6 tracking-tight">Review Items</h2>

            {/* Cart Items List */}
            <div className="divide-y divide-secondary-dark/20 max-h-60 overflow-y-auto mb-6 pr-2">
              {items.map(item => (
                <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate text-text-main">{item.name}</h4>
                    <p className="text-xs text-text-muted font-medium mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-extrabold text-sm text-text-main">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Price Details */}
            <div className="space-y-4 mb-6 border-t border-secondary-dark/20 pt-4 font-medium text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span className="font-bold text-text-main">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Estimated Tax (8%)</span>
                <span className="font-bold text-text-main">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Shipping</span>
                <span className="font-bold text-text-main">
                  {shipping === 0 ? <span className="text-green-500 font-extrabold">Free</span> : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="border-t border-secondary-dark/20 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-text-main">Total</span>
                <span className="font-black text-xl text-[#FF7A00]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
