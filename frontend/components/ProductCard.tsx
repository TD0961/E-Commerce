'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/mockData';
import { useAppDispatch } from '@/lib/hooks';
import { addToCart } from '@/features/cartSlice';
import Button from './Button';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    setIsAdding(true);
    dispatch(addToCart(product));
    
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <Link 
      href={`/products/${product.id}`}
      className="group flex flex-col bg-surface rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 border border-transparent hover:border-[#FF7A00]/20"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image 
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.trending && (
            <span className="bg-[#FF7A00] text-[#1A1A1A] text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
              Trending
            </span>
          )}
          {!product.inStock && (
            <span className="bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-[#FF7A00] uppercase tracking-wider">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-sm text-text-muted">
            <Star className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
            <span className="font-medium">{product.rating}</span>
            <span className="text-xs">({product.reviews})</span>
          </div>
        </div>

        <h3 className="font-semibold text-lg text-text-main line-clamp-2 mb-2 group-hover:text-[#FF7A00] transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold text-text-main">
            {formatPrice(product.price)}
          </span>
          
          <Button 
            variant={isAdding ? "primary" : "secondary"}
            size="icon"
            className="rounded-full flex-shrink-0"
            disabled={!product.inStock}
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingCart className={`w-5 h-5 ${isAdding ? 'scale-110' : ''} transition-transform`} />
          </Button>
        </div>
      </div>
    </Link>
  );
}
