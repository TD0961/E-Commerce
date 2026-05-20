'use client';

import React from 'react';
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 transition-all duration-300">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-[#FF7A00]" />
        </div>
        <h1 className="text-3xl font-extrabold text-text-main mb-4 tracking-tight">Your Cart is Empty</h1>
        <p className="text-text-muted mb-8 max-w-md font-medium">
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
    <div className="max-w-6xl mx-auto transition-all duration-300">
      <h1 className="text-3xl font-extrabold text-text-main mb-8 tracking-tight">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-secondary-dark/20">
            <span className="font-bold text-text-muted">
              {items.length} Item{items.length !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={() => dispatch(clearCart())}
              className="text-sm text-red-500 hover:text-red-600 font-bold"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-6">
            {items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-surface border border-secondary-dark/20 shadow-soft relative">
                {/* Image */}
                <div className="relative w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover"
                    sizes="128px"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/products/${item.id}`} className="font-bold text-lg text-text-main hover:text-[#FF7A00] transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-sm text-text-muted font-semibold mt-0.5">
                        {item.category}
                      </p>
                    </div>
                    <span className="font-extrabold text-lg hidden sm:block text-text-main">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-3 bg-secondary rounded-xl p-1 border border-secondary-dark/25 w-fit">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-text-main">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-text-muted hover:text-red-500 p-2 sm:absolute sm:top-4 sm:right-4 transition-colors"
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
          <div className="sticky top-24 bg-surface rounded-3xl p-6 md:p-8 shadow-soft border border-secondary-dark/20">
            <h2 className="text-xl font-extrabold text-text-main mb-6 tracking-tight">Order Summary</h2>
            
            <div className="space-y-4 mb-6 font-medium text-sm">
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

            <div className="border-t border-secondary-dark/20 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-text-main">Total</span>
                <span className="font-black text-2xl text-[#FF7A00] tracking-tight">
                  {formatPrice(total)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-text-muted mt-2 text-right font-medium">
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
              <Link href="/products" className="text-sm text-text-muted hover:text-[#FF7A00] font-bold transition-colors">
                or Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
