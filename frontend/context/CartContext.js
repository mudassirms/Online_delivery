import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // -----------------------------
  // Fetch cart from backend
  // -----------------------------
  const fetchCart = async () => {
    try {
      const res = await api.get('/catalog/cart/');
      const items = Array.isArray(res.data) ? res.data : [];

      // Filter out unavailable products safely
      const availableItems = items.filter(item => item.product && item.product.available);

      if (availableItems.length !== items.length) {
        alert('Some items in your cart are no longer available and have been removed.');
        // Remove unavailable items from backend
        const removedItems = items.filter(item => !item.product?.available);
        try {
          await Promise.all(
            removedItems.map(item => api.delete(`/catalog/cart/${item.id}`))
          );
        } catch (err) {
          console.error('Error removing unavailable items:', err);
        }
      }

      setCart(availableItems);
      calculateTotal(availableItems);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCart([]); // fallback to empty array
      setTotal(0);
    }
  };

  // -----------------------------
  // Add item to cart
  // -----------------------------
  const addToCart = async (product, quantity = 1) => {
    try {
      if (!product || !product.available) {
        alert('This product is currently unavailable.');
        return;
      }

      await api.post('/catalog/cart/', {
        product_id: product.id,
        quantity,
        store_id: product.store_id,
      });
      fetchCart();
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
      fetchCart();
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
  // Calculate total
  // -----------------------------
  const calculateTotal = (cartItems) => {
    if (!Array.isArray(cartItems)) return setTotal(0);
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
      0
    );
    setTotal(totalAmount);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        setCart,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
