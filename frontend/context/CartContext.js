import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Fetch cart from backend
  // -----------------------------
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/cart/');
      const items = Array.isArray(res.data) ? res.data : [];

      // Filter out unavailable products
      const availableItems = items.filter(item => item.product?.available);

      // Remove unavailable items from backend if any
      const removedItems = items.filter(item => !item.product?.available);
      if (removedItems.length) {
        alert('Some items in your cart are no longer available and have been removed.');
        await Promise.all(removedItems.map(item => api.delete(`/catalog/cart/${item.id}`)));
      }

      setCart(availableItems);
      calculateTotal(availableItems);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCart([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Add item to cart
  // -----------------------------
  const addToCart = async (product, quantity = 1) => {
    if (!product || !product.available) {
      alert('This product is currently unavailable.');
      return;
    }

    try {
      // ✅ Instant local update for immediate feedback
      const tempItem = { id: Date.now(), product, quantity };
      setCart(prev => [...prev, tempItem]);
      calculateTotal([...cart, tempItem]);

      // Then sync with backend
      await api.post('/catalog/cart/', {
        product_id: product.id,
        quantity,
        store_id: product.store_id,
      });
      await fetchCart(); // Refresh from backend
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.response?.data?.detail || 'Failed to add to cart.');
    }
  };

  // -----------------------------
  // Remove item from cart
  // -----------------------------
  const removeFromCart = async (cartId) => {
    try {
      await api.delete(`/catalog/cart/${cartId}`);
      const updatedCart = cart.filter(item => item.id !== cartId);
      setCart(updatedCart);
      calculateTotal(updatedCart);
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  // -----------------------------
  // Clear entire cart
  // -----------------------------
  const clearCart = async () => {
    try {
      if (!cart.length) return;
      await Promise.all(cart.map(item => api.delete(`/catalog/cart/${item.id}`)));
      setCart([]);
      setTotal(0);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  // -----------------------------
  // Calculate total amount
  // -----------------------------
  const calculateTotal = (cartItems) => {
    if (!Array.isArray(cartItems)) return setTotal(0);
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
      0
    );
    setTotal(totalAmount);
  };

  // Auto-recalculate total if cart changes externally
  useEffect(() => {
    calculateTotal(cart);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
