'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logoutUser } from '@/features/authSlice';
import { Users, Package, ShoppingCart, DollarSign, LogOut, Plus, Edit, Trash2, Loader2, X, AlertCircle, ShieldAlert, Award, Calendar, Mail } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/Button';
import { auth } from '@/lib/firebase';
import { Product } from '@/lib/mockData';

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // View tabs: 'overview' | 'products'
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');
  
  // Dynamic lists states
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Detail Modal States
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  
  // Product Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formImage, setFormImage] = useState('');
  
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Role Action states
  const [roleSubmitting, setRoleSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Load products from API
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load users from API
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load orders from API
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchUsers();
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/');
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormStock('');
    setFormCategory('Electronics');
    setFormImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setFormName(product.name);
    setFormDescription(product.description || '');
    setFormPrice(String(product.price));
    setFormStock(String((product as any).stock || 0));
    setFormCategory(product.category);
    setFormImage(product.image || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('You must be logged in');

      const token = await currentUser.getIdToken();
      
      const payload = {
        name: formName,
        description: formDescription,
        price: Number(formPrice),
        stock: Number(formStock),
        category: formCategory,
        image: formImage,
        imageUrls: [formImage]
      };

      const url = modalMode === 'add' 
        ? '/api/products' 
        : `/api/products/${selectedProduct?.id}`;
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || 'Operation failed');
      }

      await fetchProducts();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product from CitrusMarket?')) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('You must be logged in');

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || 'Deletion failed');
      }

      setProducts(products.filter(p => p.id !== productId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Toggle user role between admin and user
  const handleToggleUserRole = async (targetUid: string, currentRole: string) => {
    if (targetUid === user?.id) {
      alert("Self-demotion is blocked to prevent accidental locked Admin panels.");
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const msg = `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`;
    if (!confirm(msg)) return;

    setRoleSubmitting(targetUid);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Authentication required');

      const token = await currentUser.getIdToken();

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uid: targetUid, role: newRole })
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || 'Failed to update user role');
      }

      // Update local state instantly
      setUsers(users.map(u => u.uid === targetUid ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setRoleSubmitting(null);
    }
  };

  // ─── Dynamic Stats Calculations ─────────────────────────
  const dynamicTotalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const dynamicTotalOrders = orders.length;
  const dynamicTotalProducts = products.length;
  const dynamicActiveUsers = users.length;

  const stats = [
    { 
      title: 'Total Revenue', 
      value: formatPrice(dynamicTotalRevenue), 
      icon: DollarSign, 
      color: 'text-green-500', 
      bg: 'bg-green-100 dark:bg-green-900/20',
      onClick: () => setShowOrdersModal(true),
      badge: 'Click to view ledger'
    },
    { 
      title: 'Total Orders', 
      value: dynamicTotalOrders.toString(), 
      icon: ShoppingCart, 
      color: 'text-blue-500', 
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      onClick: () => setShowOrdersModal(true),
      badge: 'Click to view details'
    },
    { 
      title: 'Citrus Products', 
      value: dynamicTotalProducts.toString(), 
      icon: Package, 
      color: 'text-[#FF7A00]', 
      bg: 'bg-[#FF7A00]/10',
      onClick: () => setActiveTab('products'),
      badge: 'Click to manage catalog'
    },
    { 
      title: 'Active Users', 
      value: dynamicActiveUsers.toString(), 
      icon: Users, 
      color: 'text-purple-500', 
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      onClick: () => setShowUsersModal(true),
      badge: 'Click to manage accounts'
    },
  ];

  const categoriesList = [
    'Electronics',
    'Fashion',
    'Home & Office',
    'Accessories',
    'Home & Kitchen',
    'Sports',
    'Beauty'
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Citrus Control Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name || 'Administrator'}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-lg font-bold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-[#FF7A00] text-[#FF7A00]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 text-lg font-bold border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-[#FF7A00] text-[#FF7A00]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Manage Catalog ({products.length})
        </button>
      </div>

      {/* VIEW: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={i} 
                  onClick={stat.onClick}
                  className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800 cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all hover:border-[#FF7A00]/40 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 group-hover:text-[#FF7A00] transition-colors">
                      {stat.badge}
                    </span>
                  </div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders Table (Now dynamically loaded!) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Live Orders</h2>
                <button 
                  onClick={() => setShowOrdersModal(true)} 
                  className="text-[#FF7A00] text-sm font-medium hover:underline"
                >
                  View All Orders
                </button>
              </div>
              
              {loadingOrders ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 text-[#FF7A00] animate-spin" />
                </div>
              ) : orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                        <th className="pb-3 font-medium">Order ID</th>
                        <th className="pb-3 font-medium">Customer ID</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="text-sm">
                          <td className="py-4 font-bold text-xs truncate max-w-[100px]">{order.id}</td>
                          <td className="py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={order.userId}>
                            {order.userId}
                          </td>
                          <td className="py-4 text-gray-400 text-xs">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                          </td>
                          <td className="py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-500">
                              {order.status || 'Paid'}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-gray-900 dark:text-white">{formatPrice(order.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No dynamic checkout orders have been created yet.</p>
                </div>
              )}
            </div>

            {/* Quick Stats sidebar */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-4">Quick Alert Log</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl flex gap-3 text-sm">
                    <Package className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-orange-800 dark:text-orange-400">Inventory Status</p>
                      <p className="text-xs text-orange-700 dark:text-orange-300/80">Firestore dynamic catalogs are securely wired to client views.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl flex gap-3 text-sm">
                    <ShoppingCart className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-800 dark:text-green-400">Stripe Integration Live</p>
                      <p className="text-xs text-green-700 dark:text-green-300/80">Production test keys have been configured for PaymentIntents.</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={() => setActiveTab('products')} className="w-full mt-6">Manage Store Catalog</Button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MANAGE PRODUCTS (CRUD) */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Catalog Products</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Edit prices, adjust stock levels, or launch new items instantly.</p>
            </div>
            <Button onClick={handleOpenAddModal} className="gap-2">
              <Plus className="w-5 h-5" /> Add New Product
            </Button>
          </div>

          {loadingProducts ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-12 h-12 text-[#FF7A00] animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {products.map((product) => (
                    <tr key={product.id} className="text-sm">
                      <td className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden relative flex-shrink-0">
                            <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                          </div>
                          <div>
                            <span className="font-bold block text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
                            <span className="text-xs text-gray-400 block max-w-xs truncate">{product.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</td>
                      <td className="py-4">
                        <span className={`font-bold ${((product as any).stock || 0) < 10 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                          {(product as any).stock || 0} units
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 text-gray-400 hover:text-[#FF7A00] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold">No products in Firestore</h3>
              <p className="text-sm text-gray-400">Add products to see them displayed in your market.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 MODAL: ACTIVE USERS DETAIL PANEL        */}
      {/* ========================================== */}
      {showUsersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Users ledger</h3>
              </div>
              <button 
                onClick={() => setShowUsersModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingUsers ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                        <th className="pb-3 font-semibold">User details</th>
                        <th className="pb-3 font-semibold">Email</th>
                        <th className="pb-3 font-semibold">Security UID</th>
                        <th className="pb-3 font-semibold">Role</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {users.map((u) => (
                        <tr key={u.uid} className="text-sm">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400 uppercase text-sm">
                                {u.displayName ? u.displayName.charAt(0) : 'U'}
                              </div>
                              <span className="font-bold text-gray-900 dark:text-white">{u.displayName || 'No Name'}</span>
                            </div>
                          </td>
                          <td className="py-4 font-medium text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span>{u.email}</span>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-mono text-gray-400">{u.uid}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                              u.role === 'admin' 
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-500' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-500'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <Button 
                              size="sm"
                              variant={u.role === 'admin' ? 'outline' : 'primary'}
                              onClick={() => handleToggleUserRole(u.uid, u.role)}
                              disabled={roleSubmitting === u.uid}
                              className="text-xs py-1 px-3"
                            >
                              {roleSubmitting === u.uid ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : u.role === 'admin' ? (
                                'Demote to User'
                              ) : (
                                'Promote to Admin'
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No active users loaded.
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
              <Button onClick={() => setShowUsersModal(false)}>Close Ledger</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 💳 MODAL: SYSTEM ORDERS & REVENUE PANEL    */}
      {/* ========================================== */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Transactions Ledger</h3>
              </div>
              <button 
                onClick={() => setShowOrdersModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingOrders ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
              ) : orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                        <th className="pb-3 font-semibold">Transaction ID</th>
                        <th className="pb-3 font-semibold">Customer ID</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Purchased Items</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Settled Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {orders.map((o) => (
                        <tr key={o.id} className="text-sm">
                          <td className="py-4 font-mono text-xs font-bold text-blue-500 truncate max-w-[120px]" title={o.id}>
                            {o.id}
                          </td>
                          <td className="py-4 text-xs font-mono text-gray-400 truncate max-w-[120px]" title={o.userId}>
                            {o.userId}
                          </td>
                          <td className="py-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{o.createdAt ? new Date(o.createdAt).toLocaleString() : 'Today'}</span>
                            </div>
                          </td>
                          <td className="py-4 font-medium text-xs max-w-[200px]">
                            {o.items && Array.isArray(o.items) ? (
                              <div className="space-y-0.5">
                                {o.items.map((item: any, idx: number) => (
                                  <div key={idx} className="truncate text-gray-700 dark:text-gray-300">
                                    • {item.name || item.productId} <span className="text-gray-400">(x{item.quantity || 1})</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No items documented</span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                              {o.status || 'Success'}
                            </span>
                          </td>
                          <td className="py-4 font-extrabold text-right text-gray-900 dark:text-white">
                            {formatPrice(o.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No orders have been recorded in the Firestore ledger yet.
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
              <Button onClick={() => setShowOrdersModal(false)}>Close Ledger</Button>
            </div>
          </div>
        </div>
      )}

      {/* CRUD MODAL FOR ADDING/EDITING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {modalMode === 'add' ? 'Launch New Citrus Product' : 'Modify Product Specifications'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {formError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Premium Wireless Headphones"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="Unsplash / Image URL"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="89.99"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Stock Inventory</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="50"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe product highlights, metrics, materials..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#FF7A00] resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={formSubmitting}
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Submitting...' : modalMode === 'add' ? 'Launch Product' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
