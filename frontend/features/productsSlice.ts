import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, mockProducts } from '@/lib/mockData';

interface ProductsState {
  items: Product[];
  filteredItems: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
}

const initialState: ProductsState = {
  items: [],
  filteredItems: [],
  status: 'idle',
  error: null,
  searchQuery: '',
  selectedCategory: null,
};

// Async thunk to fetch products (supports real API or mock fallback)
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (data.success && data.data.length > 0) {
      return data.data as Product[];
    }
    throw new Error('No products returned from API');
  } catch (error) {
    console.warn('API fetch failed, falling back to mock data:', error);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockProducts;
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredItems = state.items.filter(item => 
        item.name.toLowerCase().includes(action.payload.toLowerCase()) &&
        (state.selectedCategory ? item.category === state.selectedCategory : true)
      );
    },
    setCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = state.items.filter(item => 
        (action.payload ? item.category === action.payload : true) &&
        item.name.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    },
    sortByPrice: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filteredItems.sort((a, b) => 
        action.payload === 'asc' ? a.price - b.price : b.price - a.price
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        // Apply existing filters to newly fetched items
        state.filteredItems = action.payload.filter(item => 
          item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
          (state.selectedCategory ? item.category === state.selectedCategory : true)
        );
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export const { setSearchQuery, setCategory, sortByPrice } = productsSlice.actions;
export default productsSlice.reducer;
