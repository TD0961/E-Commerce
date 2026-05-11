export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
  trending?: boolean;
}

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Citrus Blast Wireless Headphones',
    description: 'High-quality wireless headphones with active noise cancellation and a playful citrus design.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Electronics',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    featured: true,
    trending: true,
  },
  {
    id: 'p2',
    name: 'Ocean Breeze Smart Watch',
    description: 'Track your fitness and stay connected with this stylish smart watch in ocean blue.',
    price: 199.50,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    category: 'Electronics',
    rating: 4.5,
    reviews: 89,
    inStock: true,
    trending: true,
  },
  {
    id: 'p3',
    name: 'Sunny Day Classic Sneakers',
    description: 'Comfortable and stylish sneakers perfect for everyday wear.',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    category: 'Fashion',
    rating: 4.7,
    reviews: 256,
    inStock: true,
    featured: true,
  },
  {
    id: 'p4',
    name: 'Minimalist Desk Lamp',
    description: 'Brighten up your workspace with this elegant minimalist desk lamp.',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    category: 'Home & Office',
    rating: 4.3,
    reviews: 42,
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Adventure Backpack',
    description: 'Durable and spacious backpack for all your outdoor adventures.',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    category: 'Accessories',
    rating: 4.9,
    reviews: 312,
    inStock: true,
    trending: true,
  },
  {
    id: 'p6',
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 artisan ceramic coffee mugs in vibrant colors.',
    price: 34.50,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80',
    category: 'Home & Kitchen',
    rating: 4.6,
    reviews: 78,
    inStock: false,
  },
  {
    id: 'p7',
    name: 'Pro Gaming Mouse',
    description: 'Ergonomic gaming mouse with customizable RGB lighting and programmable buttons.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1527814050087-142f1a6693a1?w=800&q=80',
    category: 'Electronics',
    rating: 4.4,
    reviews: 156,
    inStock: true,
    featured: true,
  },
  {
    id: 'p8',
    name: 'Organic Cotton T-Shirt',
    description: 'Incredibly soft and sustainable organic cotton t-shirt.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    category: 'Fashion',
    rating: 4.8,
    reviews: 420,
    inStock: true,
  }
];

export const mockCategories = [
  'Electronics',
  'Fashion',
  'Home & Office',
  'Accessories',
  'Home & Kitchen',
  'Sports',
  'Beauty'
];
