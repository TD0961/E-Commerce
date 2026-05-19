'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAppDispatch } from '@/lib/hooks';
import { clearCart } from '@/features/cartSlice';
import Button from '@/components/Button';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
  totalAmount: number;
}

export default function CheckoutForm({ clientSecret, orderId, totalAmount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card input element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsSuccess(true);
        dispatch(clearCart());
        
        // Redirect to home/success after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-3xl animate-fade-in">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-1">Thank you for your purchase.</p>
        <p className="text-sm font-semibold text-[#FF7A00] mt-2">Order ID: {orderId}</p>
        <p className="text-xs text-gray-400 mt-6">Redirecting you to the home page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Card Details
        </label>
        <div className="p-4 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#32325d',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                  iconColor: '#fa755a',
                },
              },
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-green-500" /> Secure SSL 256-Bit Encrypted Payment
        </span>
      </div>

      <Button
        type="submit"
        className="w-full text-lg h-14"
        isLoading={isProcessing}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing Payment...' : `Pay $${totalAmount.toFixed(2)}`}
      </Button>
    </form>
  );
}
