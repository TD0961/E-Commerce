'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCategory, setSearchQuery, sortByPrice, fetchProducts } from '@/features/productsSlice';
import { mockCategories } from '@/lib/mockData';
import ProductCard from '@/components/ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import Button from '@/components/Button';

function ProductsContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { filteredItems, selectedCategory, searchQuery, status } = useAppSelector(state => state.products);
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }

    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      dispatch(setCategory(categoryParam));
    } else {
      dispatch(setCategory(null));
    }
  }, [searchParams, dispatch, status]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleCategorySelect = (category: string | null) => {
    dispatch(setCategory(category));
  };

  const handleSort = (direction: 'asc' | 'desc') => {
    dispatch(sortByPrice(direction));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">All Products</h1>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`md:w-64 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#FF7A00]" />
            Categories
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === null 
                  ? 'bg-[#E6F0FF] dark:bg-[#1A2638] text-[#1A2638] dark:text-[#E6F0FF] font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              All Categories
            </button>
            {mockCategories.map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category 
                    ? 'bg-[#E6F0FF] dark:bg-[#1A2638] text-[#1A2638] dark:text-[#E6F0FF] font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">Sort By Price</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleSort('asc')}
              className="block w-full text-left px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Low to High
            </button>
            <button
              onClick={() => handleSort('desc')}
              className="block w-full text-left px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              High to Low
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl font-bold">
            {selectedCategory ? `${selectedCategory} Products` : 'All Products'}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search products..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-white dark:bg-[#1E1E1E] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent transition-all"
          />
        </div>

        {/* Products Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => {
                dispatch(setSearchQuery(''));
                dispatch(setCategory(null));
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7A00]"></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
