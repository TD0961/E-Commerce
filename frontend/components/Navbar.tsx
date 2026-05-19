'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logoutUser } from '@/features/authSlice';
import Button from './Button';

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const totalQuantity = useAppSelector((state) => state.cart.totalQuantity);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">
                C
              </div>
              <span className="font-bold text-xl tracking-tight text-[#1A1A1A] dark:text-white">
                Citrus<span className="text-[#FF7A00]">Market</span>
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF7A00] transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#1A1A1A] focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent transition-all sm:text-sm"
                placeholder="Search for fresh deals..."
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-[#FF7A00] dark:hover:text-[#FF7A00] transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <ShoppingCart className="h-6 w-6" />
              {totalQuantity > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-extrabold leading-none text-[#1A1A1A] transform translate-x-1/4 -translate-y-1/4 bg-[#FF7A00] rounded-full">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                {user?.role === 'admin' && (
                  <Link href="/admin" className="hidden lg:block text-xs font-semibold text-[#FF7A00] border border-[#FF7A00]/30 px-2 py-1 rounded-lg hover:bg-[#FF7A00]/10 transition-colors">
                    Admin
                  </Link>
                )}
                <Link
                  href="/admin"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#FF7A00] transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  title={user?.name}
                >
                  <User className="h-6 w-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden lg:inline-flex">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-2">
              <button className="text-gray-600 hover:text-[#FF7A00] p-2">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
