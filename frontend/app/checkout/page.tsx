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
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-16 h-16 text-[#FF7A00] animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Preparing Secure Checkout</h2>
        <p className="text-gray-500 dark:text-gray-400">Verifying your cart and reserving inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout Error</h2>
        <p className="text-red-500 mb-6 max-w-md">{error}</p>
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
    <div className="max-w-6xl mx-auto pb-16">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cart" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Secure Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Side: Stripe Payment Element */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-[#E6F0FF] dark:bg-[#1A2638] flex items-center justify-center text-[#FF7A00]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Payment Method</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">All transactions are secure and encrypted.</p>
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
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6">Review Items</h2>

            {/* Cart Items List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-60 overflow-y-auto mb-6 pr-2">
              {items.map(item => (
                <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Price Details */}
            <div className="space-y-4 mb-6 border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Estimated Tax (8%)</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {shipping === 0 ? <span className="text-green-500">Free</span> : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-extrabold text-xl text-[#FF7A00]">
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
