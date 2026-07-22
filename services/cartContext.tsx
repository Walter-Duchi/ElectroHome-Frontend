import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartService } from './cartService';
import { useAuth } from './authContext';
import type { CartItem, AddToCartRequest } from '../src/types/ecommerce';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  loading: boolean;
  addToCart: (productoId: number, cantidad: number) => Promise<void>;
  removeItem: (productoId: number) => Promise<void>;
  updateQuantity: (productoId: number, cantidad: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { auth } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    if (!auth.isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const cart = await cartService.getCart();
      setItems(cart);
    } catch (error) {
      console.error('Error loading cart', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [auth.isAuthenticated]);

  const addToCart = async (productoId: number, cantidad: number) => {
    await cartService.addToCart({ productoId, cantidad });
    await loadCart();
  };

  const removeItem = async (productoId: number) => {
    await cartService.removeItem(productoId);
    await loadCart();
  };

  const updateQuantity = async (productoId: number, cantidad: number) => {
    await cartService.updateQuantity(productoId, cantidad);
    await loadCart();
  };

  const clearCart = async () => {
    await cartService.clearCart();
    await loadCart();
  };

  const refreshCart = loadCart;

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, loading, addToCart, removeItem, updateQuantity, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
