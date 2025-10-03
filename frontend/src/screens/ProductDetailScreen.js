import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params; // product info from StoreScreen
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Product Name */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        {product.name}
      </Text>

      {/* Product Price */}
      <Text style={{ fontSize: 20, color: '#333', marginBottom: 8 }}>
        ₹ {product.price}
      </Text>

      {/* Product Description */}
      <Text style={{ fontSize: 16, color: '#555', marginBottom: 16 }}>
        {product.description || 'No description available.'}
      </Text>

      {/* Quantity Selector */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Button
          title="-"
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        />
        <Text style={{ marginHorizontal: 12, fontSize: 18 }}>{quantity}</Text>
        <Button
          title="+"
          onPress={() => setQuantity(quantity + 1)}
        />
      </View>

      {/* Add to Cart Button */}
      <Button
        title="Add to Cart"
        onPress={() => {
          addToCart(product.id, quantity); // Send to backend
          navigation.navigate('Cart'); // Go to cart screen
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  image: { width: '100%', height: 220, borderRadius: 12, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 18, marginBottom: 8 },
  desc: { fontSize: 14, color: '#333', marginBottom: 12 }
});
