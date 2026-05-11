'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Truck, Shield, ArrowLeft, Check } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { addToCart } from '@/features/cartSlice';
import { mockProducts } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/Button';
import { useState } from 'react';

// Using React.use to unwrap params
export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dispatch = useAppDispatch();
  const product = mockProducts.find(p => p.id === resolvedParams.id);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <Link href="/products" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#FF7A00] mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-soft">
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.trending && (
              <div className="absolute top-4 left-4 bg-[#FF7A00] text-[#1A1A1A] text-sm font-extrabold px-3 py-1 rounded-full shadow-md">
                Trending Now
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {/* Mocking thumbnail images with the same image for now */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer border-2 ${i === 1 ? 'border-[#FF7A00]' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <Image src={product.image} alt={`Thumbnail ${i}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <Link href={`/products?category=${product.category}`} className="text-sm font-bold text-[#FF7A00] tracking-wider uppercase hover:underline">
              {product.category}
            </Link>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-[#FFB800] text-[#FFB800]' : 'text-gray-300 dark:text-gray-600'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
            <div className="flex items-end gap-4 mb-6">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.inStock ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  <Check className="w-4 h-4" /> In Stock
                </span>
              ) : (
                <span className="text-sm font-medium text-red-500 mb-1">
                  Out of Stock
                </span>
              )}
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg h-14"
              disabled={!product.inStock}
              onClick={handleAddToCart}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E1E1E]">
              <div className="w-10 h-10 rounded-full bg-[#E6F0FF] dark:bg-[#1A2638] flex items-center justify-center text-[#FF7A00] flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Free Delivery</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E1E1E]">
              <div className="w-10 h-10 rounded-full bg-[#E6F0FF] dark:bg-[#1A2638] flex items-center justify-center text-[#FF7A00] flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">1 Year Warranty</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">100% Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section UI */}
      <div className="mt-20 pt-10 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Review Summary */}
          <div className="bg-gray-50 dark:bg-[#1E1E1E] p-6 rounded-2xl h-fit">
            <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2">{product.rating}</div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-[#FFB800] text-[#FFB800]' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Based on {product.reviews} reviews</p>
            <Button variant="outline" className="w-full">Write a Review</Button>
          </div>
          
          {/* Mock Review List */}
          <div className="md:col-span-2 space-y-6">
            {[1, 2, 3].map((review) => (
              <div key={review} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">Customer {review}</div>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 || (i === 4 && review === 1) ? 'fill-[#FFB800] text-[#FFB800]' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Absolutely love this product! The quality is amazing and it looks exactly like the pictures. 
                  Would definitely recommend to anyone looking for a reliable {product.category.toLowerCase()} item.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
