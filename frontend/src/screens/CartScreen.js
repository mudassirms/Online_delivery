import React, { useEffect } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, total, fetchCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text>Your cart is empty.</Text>}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
              gap: 8,
            }}
          >
            <Text style={{ flex: 1 }}>
              {item.product.name} x {item.quantity}
            </Text>
            <Text>₹ {(item.product.price * item.quantity).toFixed(2)}</Text>
            <Button title="Remove" onPress={() => removeFromCart(item.id)} />
          </View>
        )}
      />
      <View style={{ paddingVertical: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          Total: ₹ {total.toFixed(2)}
        </Text>
        <Button
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
        />
      </View>
    </View>
  );
}
