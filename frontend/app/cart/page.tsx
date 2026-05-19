'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { removeFromCart, updateQuantity, clearCart } from '@/features/cartSlice';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, totalAmount } = useAppSelector(state => state.cart);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const handleQuantityChange = (id: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty > 0) {
      dispatch(updateQuantity({ id, quantity: newQty }));
    } else if (newQty === 0) {
      dispatch(removeFromCart(id));
    }
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-[#E6F0FF] dark:bg-[#1A2638] rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-[#FF7A00]" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our latest products and fresh deals!
        </p>
        <Link href="/products">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  const shipping = totalAmount > 50 ? 0 : 10;
  const tax = totalAmount * 0.08; // 8% tax
  const total = totalAmount + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
            <span className="font-medium text-gray-500 dark:text-gray-400">
              {items.length} Item{items.length !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={() => dispatch(clearCart())}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-6">
            {items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 shadow-sm relative">
                {/* Image */}
                <div className="relative w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/products/${item.id}`} className="font-semibold text-lg text-gray-900 dark:text-white hover:text-[#FF7A00] transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {item.category}
                      </p>
                    </div>
                    <span className="font-bold text-lg hidden sm:block text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#121212] rounded-xl p-1 border border-gray-200 dark:border-gray-700 w-fit">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1E1E1E] transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1E1E1E] transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-gray-400 hover:text-red-500 p-2 sm:absolute sm:top-4 sm:right-4 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Estimated Tax (8%)</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {shipping === 0 ? <span className="text-green-500">Free</span> : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900 dark:text-white">Total</span>
                <span className="font-extrabold text-2xl text-[#FF7A00]">
                  {formatPrice(total)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                  Add {formatPrice(50 - totalAmount)} more for free shipping!
                </p>
              )}
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg group h-14"
              onClick={handleCheckout}
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="mt-4 text-center">
              <Link href="/products" className="text-sm text-gray-500 hover:text-[#FF7A00] font-medium transition-colors">
                or Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
