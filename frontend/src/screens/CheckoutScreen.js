import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cart, clearCart, total } = useCart();
  const [address, setAddress] = useState('123, Main Street, Town');

  const placeOrder = async () => {
    if (!cart.length) return Alert.alert('Cart empty');
    try {
      const items = cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
      const res = await api.post('/orders', { items, address });
      clearCart();
      Alert.alert('Order placed', `Order #${res.data.id} placed successfully`);
      navigation.navigate('Orders');
    } catch (e) {
      Alert.alert('Error', 'Please log in or try again.');
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
      <Button title="Place Order" onPress={placeOrder} />
    </View>
  );
}
