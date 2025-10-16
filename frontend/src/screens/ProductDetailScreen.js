import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        {product.name}
      </Text>
      <Text style={{ fontSize: 20, color: '#333', marginBottom: 8 }}>
        ₹ {product.price}
      </Text>
      <Text style={{ fontSize: 16, color: '#555', marginBottom: 16 }}>
        {product.description || 'No description available.'}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Button title="-" onPress={() => setQuantity(Math.max(1, quantity - 1))} />
        <Text style={{ marginHorizontal: 12, fontSize: 18 }}>{quantity}</Text>
        <Button title="+" onPress={() => setQuantity(quantity + 1)} />
      </View>

      <Button
        title="Add to Cart"
        onPress={() => {
          addToCart(product.id, quantity);
          navigation.navigate('Cart');
        }}
      />
    </View>
  );
}
