import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cart, setCart, fetchCart, total } = useCart();
  const [address, setAddress] = useState('123, Main Street, Town');
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (!cart.length) return Alert.alert('Cart empty', 'Add items before checkout.');

    setLoading(true);
    try {
      // Get store_id from the first cart item
      const storeId = cart[0]?.product?.store_id;
      if (!storeId) {
        Alert.alert('Error', 'Store information missing for cart items.');
        setLoading(false);
        return;
      }

      // 1️⃣ Create address
      const resAddress = await api.post('/catalog/addresses', {
        address_line: address,
        city: 'Town',
        state: 'State',
        pincode: '123456',
      });
      const addressId = resAddress.data.id;

      // 2️⃣ Place the order
      const resOrder = await api.post('/catalog/orders', {
        address_id: addressId,
        store_id: storeId,
      });

      // 3️⃣ Clear local cart
      setCart([]);
      fetchCart();

      Alert.alert('Order placed', `Order #${resOrder.data.id} placed successfully`);
      navigation.navigate('Orders');
    } catch (e) {
      console.log('Place order error:', e.response?.data || e.message);
      Alert.alert('Error', 'Please log in or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Delivery Address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Enter full address"
        multiline
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, minHeight: 100 }}
      />
      <View style={{ height: 16 }} />
      <Text style={{ fontSize: 16 }}>Order Total: ₹ {total.toFixed(2)}</Text>
      <View style={{ height: 8 }} />
      <Button
        title={loading ? 'Placing Order...' : 'Place Order'}
        onPress={placeOrder}
        disabled={loading}
      />
    </View>
  );
}
