import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
      const res = await api.get('/catalog/cart');
      setCart(res.data);
      calculateTotal(res.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/catalog/cart', { product_id: productId, quantity });
      fetchCart(); // refresh backend cart
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      await api.delete(`/catalog/cart/${cartId}`);
      fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const clearCart = async () => {
    // delete all items on backend
    try {
      await Promise.all(cart.map(item => api.delete(`/catalog/cart/${item.id}`)));
      setCart([]);
      setTotal(0);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const calculateTotal = (cartItems) => {
    const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setTotal(totalAmount);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, total, fetchCart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
