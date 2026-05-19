'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logoutUser } from '@/features/authSlice';
import { Users, Package, ShoppingCart, DollarSign, LogOut } from 'lucide-react';
import { mockProducts } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/Button';

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/');
  };

  const stats = [
    { title: 'Total Revenue', value: '$24,560.00', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    { title: 'Total Orders', value: '342', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { title: 'Total Products', value: mockProducts.length.toString(), icon: Package, color: 'text-[#FF7A00]', bg: 'bg-[#FF7A00]/10' },
    { title: 'Total Users', value: '1,204', icon: Users, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <button className="text-[#FF7A00] text-sm font-medium hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-4 font-medium">#ORD-00{i}</td>
                    <td className="py-4">Customer Name</td>
                    <td className="py-4 text-gray-500">Oct {20 - i}, 2023</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${i === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500'}`}>
                        {i === 1 ? 'Processing' : 'Delivered'}
                      </span>
                    </td>
                    <td className="py-4 font-medium">{formatPrice(120.50 * i)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Top Products</h2>
          </div>
          
          <div className="space-y-6">
            {mockProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 relative">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">124 sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
