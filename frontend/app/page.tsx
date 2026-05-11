import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Star } from "lucide-react";
import Button from "@/components/Button";
import ProductCard from "@/components/ProductCard";
import { mockProducts, mockCategories } from "@/lib/mockData";

export default function Home() {
  const featuredProducts = mockProducts.filter((p) => p.featured).slice(0, 4);
  const trendingProducts = mockProducts.filter((p) => p.trending).slice(0, 4);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-[#E6F0FF] dark:bg-[#1A2638] mt-4">
        <div className="absolute inset-0 z-0">
          {/* Abstract playful shapes could go here */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7A00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        </div>
        
        <div className="relative z-10 px-6 py-16 md:py-24 lg:px-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-[#FF7A00]">
              <Zap className="w-4 h-4 fill-current" />
              <span>Spring Sale is Live - Up to 50% Off</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Fresh Deals,<br />
              <span className="text-[#FF7A00]">Zesty Finds.</span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0">
              Discover a curated marketplace filled with vibrant products that add flavor to your everyday life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/products?trending=true">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/50 dark:bg-transparent backdrop-blur-sm">
                  View Trending
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative w-full max-w-md aspect-square md:max-w-none rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
            <Image 
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" 
              alt="Fashion items" 
              fill 
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {mockCategories.map((category) => (
            <Link 
              key={category} 
              href={`/products?category=${encodeURIComponent(category)}`}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-[#FF7A00]/30 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#E6F0FF] dark:bg-[#1A2638] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#FF7A00] group-hover:text-white">
                <span className="font-bold text-xl">{category.charAt(0)}</span>
              </div>
              <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-[#FF7A00] transition-colors">
                {category}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
          <Link href="/products" className="text-[#FF7A00] font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-gray-900 dark:bg-[#121212] rounded-3xl p-8 md:p-12 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-700">
          <div className="flex flex-col items-center pt-8 md:pt-0 first:pt-0">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-[#FF7A00]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
            <p className="text-gray-400 text-sm">Get your orders delivered within 24-48 hours across major cities.</p>
          </div>
          <div className="flex flex-col items-center pt-8 md:pt-0">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-[#FF7A00]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Secure Payments</h3>
            <p className="text-gray-400 text-sm">We ensure your transactions are 100% secure with top encryption.</p>
          </div>
          <div className="flex flex-col items-center pt-8 md:pt-0">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-[#FF7A00]">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Premium Quality</h3>
            <p className="text-gray-400 text-sm">Every product is handpicked and verified for top-notch quality.</p>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF7A00]/20 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-[#FF7A00] text-[#FF7A00]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
