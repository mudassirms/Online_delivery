import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  ScrollView, ActivityIndicator, StyleSheet 
} from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cart, setCart, fetchCart, total } = useCart();
  const [address, setAddress] = useState('123, Main Street, Town');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // initially null

  const placeOrder = async () => {
    if (!cart.length) return Alert.alert('Cart empty', 'Add items before checkout.');
    if (!paymentMethod) return Alert.alert('Select Payment', 'Please select a payment method.');

    setLoading(true);
    try {
      const storeId = cart[0]?.product?.store_id;
      if (!storeId) {
        Alert.alert('Error', 'Store information missing for cart items.');
        setLoading(false);
        return;
      }

      // Create address
      const resAddress = await api.post('/catalog/addresses', {
        address_line: address,
        city: 'Town',
        state: 'State',
        pincode: '123456',
      });
      const addressId = resAddress.data.id;

      // Place order with payment method
      const resOrder = await api.post('/catalog/orders', {
        address_id: addressId,
        store_id: storeId,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        total_price: total,
      });

      setCart([]);
      fetchCart();

      Alert.alert(
        'Order placed',
        `Order #${resOrder.data.id} placed successfully with ${paymentMethod.toUpperCase()}`
      );
      navigation.navigate('Orders');
    } catch (e) {
      console.log('Place order error:', e.response?.data || e.message);
      Alert.alert('Error', 'Please log in or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Checkout</Text>

        {/* Delivery Address */}
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter full address"
          multiline
          style={styles.textInput}
        />

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentOption}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              paymentMethod === 'cod' && styles.radioSelected
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text style={styles.radioText}>Cash on Delivery (COD)</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Items in Cart: <Text style={styles.bold}>{cart.length}</Text>
          </Text>
          <Text style={styles.summaryText}>
            Total: <Text style={styles.bold}>₹ {total.toFixed(2)}</Text>
          </Text>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[styles.button, (loading || !paymentMethod) && styles.buttonDisabled]}
          disabled={loading || !paymentMethod}
          onPress={placeOrder}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {paymentMethod ? "Place Order" : "Select Payment Method"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Cart Items Preview */}
      {cart.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Your Items</Text>
          {cart.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <View>
                <Text style={styles.cartItemName}>{item.product?.name}</Text>
                <Text style={styles.cartItemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.cartItemPrice}>
                ₹ {(item.product?.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#FF6B00', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
  paymentOption: { marginBottom: 20 },
  radioButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    marginBottom: 10,
  },
  radioSelected: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  radioText: { color: '#fff', fontWeight: '600' },
  summary: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  summaryText: { fontSize: 16, color: '#fff', marginVertical: 2 },
  bold: { fontWeight: 'bold', color: '#FF6B00' },
  button: {
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cartItem: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemName: { fontSize: 16, fontWeight: '500', color: '#fff' },
  cartItemQty: { color: '#bbb', marginTop: 2 },
  cartItemPrice: { fontWeight: 'bold', color: '#FF6B00' },
});
