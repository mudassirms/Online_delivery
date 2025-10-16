import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, total, fetchCart, setCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.itemText}>
        {item.product.name} x {item.quantity}
      </Text>
      <Text style={styles.priceText}>
        ₹ {(item.product.price * item.quantity).toFixed(2)}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const handleCheckout = () => {
    if (!cart.length) return Alert.alert('Cart empty', 'Please add items to cart.');
    navigation.navigate('Checkout');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
        renderItem={renderItem}
        contentContainerStyle={cart.length === 0 && { flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Total: ₹ {total.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  itemText: { flex: 1, fontSize: 16 },
  priceText: { fontSize: 16, marginRight: 12 },
  removeButton: { backgroundColor: '#ff4d4d', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  removeButtonText: { color: '#fff', fontWeight: 'bold' },
  footer: { paddingVertical: 12, borderTopWidth: 1, borderColor: '#ddd' },
  totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  checkoutButton: { backgroundColor: '#007bff', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyText: { fontSize: 16, color: '#555' },
});
