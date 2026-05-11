import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <span className="font-bold text-xl tracking-tight text-[#1A1A1A] dark:text-white">
                Citrus<span className="text-[#FF7A00]">Market</span>
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Your daily dose of fresh deals. We bring you the best products at the juiciest prices.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/products" className="hover:text-[#FF7A00] transition-colors">All Products</Link></li>
              <li><Link href="/products?category=Electronics" className="hover:text-[#FF7A00] transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=Fashion" className="hover:text-[#FF7A00] transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=Home" className="hover:text-[#FF7A00] transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="#" className="hover:text-[#FF7A00] transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-[#FF7A00] transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-[#FF7A00] transition-colors">Returns & Refunds</Link></li>
              <li><Link href="#" className="hover:text-[#FF7A00] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="#" className="hover:text-[#FF7A00] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-[#FF7A00] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-[#FF7A00] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} CitrusMarket. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {/* Social icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
