import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, total, fetchCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = (id) => removeFromCart(id);

  const handleCheckout = () => {
    if (!cart.length) {
      return Alert.alert('Cart Empty', 'Please add items before proceeding.');
    }
    navigation.navigate('Checkout');
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.product.name}
        </Text>

        <Text style={styles.itemDetails}>
          Qty: <Text style={styles.highlight}>{item.quantity}</Text> • ₹
          {(item.product.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.removeButton}
        onPress={() => handleRemove(item.id)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>🛍️ Your Cart</Text>

        <FlatList
          data={cart}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Your cart is empty 🛒</Text>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            cart.length === 0
              ? { flex: 1, justifyContent: 'center', alignItems: 'center' }
              : { paddingBottom: 140 }
          }
        />

        {cart.length > 0 && (
          <View style={styles.footer}>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹ {total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B00',
    textAlign: 'center',
    marginVertical: 20,
    letterSpacing: 0.6,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.1)',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  itemDetails: {
    fontSize: 14,
    color: '#ccc',
  },
  highlight: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    elevation: 10,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.25,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.1)',
  },
  totalLabel: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF6B00',
  },
  checkoutButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
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
