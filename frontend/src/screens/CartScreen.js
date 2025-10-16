import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, total, fetchCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = (id) => removeFromCart(id);

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.itemQuantity}>
          Qty: <Text style={styles.quantityValue}>{item.quantity}</Text>
        </Text>
      </View>

      <Text style={styles.priceText}>₹ {(item.product.price * item.quantity).toFixed(2)}</Text>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item.id)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const handleCheckout = () => {
    if (!cart.length) {
      return Alert.alert('Cart Empty', 'Please add items before proceeding.');
    }
    navigation.navigate('Checkout');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🛒 Your Cart</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Your cart is empty 🛍️</Text>
        }
        renderItem={renderItem}
        contentContainerStyle={
          cart.length === 0 && { flex: 1, justifyContent: 'center', alignItems: 'center' }
        }
        showsVerticalScrollIndicator={false}
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹ {total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF6B00',
    textAlign: 'center',
    marginVertical: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#aaa',
  },
  quantityValue: {
    color: '#FF6B00',
    fontWeight: '600',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00',
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 6,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 18,
    color: '#ddd',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B00',
  },
  checkoutButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
});
