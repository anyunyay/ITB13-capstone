interface StockItem {
  productId: number;
  category: string;
  quantity: number;
}

class StockManager {
  private static instance: StockManager;
  private stockData: Map<string, number> = new Map();
  private cartItems: StockItem[] = [];

  private constructor() {
    // Load cart items from localStorage on initialization
    this.loadFromStorage();
  }

  static getInstance(): StockManager {
    if (!StockManager.instance) {
      StockManager.instance = new StockManager();
    }
    return StockManager.instance;
  }

  // Initialize stock data
  initializeStock(productId: number, stockByCategory: Record<string, number>) {
    Object.entries(stockByCategory).forEach(([category, quantity]) => {
      const key = `${productId}-${category}`;
      // Only set if not already initialized to avoid overwriting
      if (!this.stockData.has(key)) {
        this.stockData.set(key, quantity);
      }
    });
  }

  // Get available stock for a product and category
  getAvailableStock(productId: number, category: string): number {
    const key = `${productId}-${category}`;
    const originalStock = this.stockData.get(key) || 0;
    const cartQuantity = this.getCartQuantity(productId, category);
    return Math.max(0, originalStock - cartQuantity);
  }

  // Get all available stock for a product
  getAvailableStockByCategory(productId: number): Record<string, number> {
    const result: Record<string, number> = {};
    this.stockData.forEach((quantity, key) => {
      const [pid, category] = key.split('-');
      if (parseInt(pid) === productId) {
        result[category] = this.getAvailableStock(productId, category);
      }
    });
    return result;
  }

  // Force refresh stock data for a product (but preserve cart state)
  refreshStockData(productId: number, stockByCategory: Record<string, number>) {
    Object.entries(stockByCategory).forEach(([category, quantity]) => {
      const key = `${productId}-${category}`;
      // Always update the original stock data
      this.stockData.set(key, quantity);
    });
  }

  // Get original stock data (without cart deductions)
  getOriginalStockByCategory(productId: number): Record<string, number> {
    const result: Record<string, number> = {};
    this.stockData.forEach((quantity, key) => {
      const [pid, category] = key.split('-');
      if (parseInt(pid) === productId) {
        result[category] = quantity;
      }
    });
    return result;
  }

  // Add item to cart (temporarily)
  addToCart(productId: number, category: string, quantity: number) {
    const existingItem = this.cartItems.find(
      item => item.productId === productId && item.category === category
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ productId, category, quantity });
    }
    this.saveToStorage();
  }

  // Remove item from cart (temporarily)
  removeFromCart(productId: number, category: string, quantity: number) {
    const existingItem = this.cartItems.find(
      item => item.productId === productId && item.category === category
    );

    if (existingItem) {
      existingItem.quantity = Math.max(0, existingItem.quantity - quantity);
      if (existingItem.quantity === 0) {
        this.cartItems = this.cartItems.filter(
          item => !(item.productId === productId && item.category === category)
        );
      }
    }
    this.saveToStorage();
  }

  // Remove item completely from cart (when removed from cart page)
  removeItemFromCart(productId: number, category: string) {
    this.cartItems = this.cartItems.filter(
      item => !(item.productId === productId && item.category === category)
    );
    this.saveToStorage();
  }

  // Get cart quantity for a specific product and category
  private getCartQuantity(productId: number, category: string): number {
    const item = this.cartItems.find(
      item => item.productId === productId && item.category === category
    );
    return item ? item.quantity : 0;
  }

  // Get all cart items
  getCartItems(): StockItem[] {
    return [...this.cartItems];
  }

  // Reset stock data
  reset() {
    this.stockData.clear();
    this.cartItems = [];
    this.saveToStorage();
  }

  // Sync cart items with backend cart data
  syncWithBackendCart(cartItems: Array<{product_id: number, category: string, quantity: number}>) {
    // Clear current cart items
    this.cartItems = [];
    
    // Add items from backend cart
    cartItems.forEach(item => {
      this.addToCart(item.product_id, item.category, item.quantity);
    });
  }

  // Debug method to log current state
  debug() {
    console.log('Stock Manager Debug:');
    console.log('Stock Data:', Object.fromEntries(this.stockData));
    console.log('Cart Items:', this.cartItems);
  }

  // Save cart items to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem('stockManager_cart', JSON.stringify(this.cartItems));
    } catch (error) {
      console.warn('Failed to save cart items to localStorage:', error);
    }
  }

  // Load cart items from localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('stockManager_cart');
      if (stored) {
        this.cartItems = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load cart items from localStorage:', error);
      this.cartItems = [];
    }
  }

  // Clear cart and storage
  clearCart() {
    this.cartItems = [];
    this.saveToStorage();
  }
}

export default StockManager; 