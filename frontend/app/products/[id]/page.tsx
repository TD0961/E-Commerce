'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Truck, Shield, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { addToCart } from '@/features/cartSlice';
import { Product } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/Button';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dispatch = useAppDispatch();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${resolvedParams.id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setProduct(json.data);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load product from API:', err);
      }
      setIsLoading(false);
    }
    loadProduct();
  }, [resolvedParams.id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF7A00] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-extrabold text-text-main mb-4">Product Not Found</h1>
        <p className="text-text-muted mb-8">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  // Fallbacks for rating and reviews if they aren't stored in Firestore
  const rating = product.rating || 5.0;
  const reviews = product.reviews || 0;
  const inStock = product.inStock !== false; // default to true if not explicitly false

  return (
    <div className="max-w-6xl mx-auto pb-16 transition-all duration-300">
      <Link href="/products" className="inline-flex items-center text-sm font-bold text-text-muted hover:text-[#FF7A00] mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary shadow-soft">
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.trending && (
              <div className="absolute top-4 left-4 bg-[#FF7A00] text-white text-sm font-extrabold px-3 py-1 rounded-full shadow-md">
                Trending Now
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`relative aspect-square rounded-xl overflow-hidden bg-secondary cursor-pointer border-2 ${i === 1 ? 'border-[#FF7A00]' : 'border-transparent hover:border-secondary-dark'}`}>
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
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-main leading-tight mb-4 tracking-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-[#FFB800] text-[#FFB800]' : 'text-secondary-dark'}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-text-muted">
              {rating} ({reviews} reviews)
            </span>
          </div>

          <p className="text-lg text-text-muted mb-8 leading-relaxed font-medium">
            {product.description}
          </p>

          <div className="bg-secondary rounded-2xl p-6 mb-8 border border-secondary-dark/20">
            <div className="flex items-end gap-4 mb-6">
              <span className="text-4xl font-extrabold text-text-main tracking-tight">
                {formatPrice(product.price)}
              </span>
              {inStock ? (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400 mb-1">
                  <Check className="w-4 h-4" /> In Stock
                </span>
              ) : (
                <span className="text-sm font-bold text-red-500 mb-1">
                  Out of Stock
                </span>
              )}
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg h-14"
              disabled={!inStock}
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
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-secondary-dark/20 bg-surface">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-[#FF7A00] flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-text-main">Free Delivery</h4>
                <p className="text-xs text-text-muted font-medium">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-secondary-dark/20 bg-surface">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-[#FF7A00] flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-text-main">1 Year Warranty</h4>
                <p className="text-xs text-text-muted font-medium">100% Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section UI */}
      <div className="mt-20 pt-10 border-t border-secondary-dark/20">
        <h2 className="text-2xl font-extrabold text-text-main mb-8 tracking-tight">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-secondary p-6 rounded-2xl h-fit border border-secondary-dark/20">
            <div className="text-5xl font-extrabold text-text-main mb-2">{rating}</div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-[#FFB800] text-[#FFB800]' : 'text-secondary-dark'}`} />
              ))}
            </div>
            <p className="text-text-muted text-sm mb-6 font-medium">Based on {reviews} reviews</p>
            <Button variant="outline" className="w-full">Write a Review</Button>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            {[1, 2, 3].map((review) => (
              <div key={review} className="pb-6 border-b border-secondary-dark/20 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-text-main">Customer {review}</div>
                  <span className="text-xs text-text-muted">2 days ago</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 || (i === 4 && review === 1) ? 'fill-[#FFB800] text-[#FFB800]' : 'text-secondary-dark'}`} />
                  ))}
                </div>
                <p className="text-text-muted text-sm font-medium leading-relaxed">
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
