import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cart, setCart, fetchCart, total } = useCart();
  const [address, setAddress] = useState('123, Main Street, Town');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const placeOrder = async () => {
    if (!cart.length)
      return Alert.alert('Cart empty', 'Add items before checkout.');
    if (!paymentMethod)
      return Alert.alert('Select Payment', 'Please select a payment method.');

    setLoading(true);
    try {
      const storeId = cart[0]?.product?.store_id;
      if (!storeId) {
        Alert.alert('Error', 'Store information missing for cart items.');
        setLoading(false);
        return;
      }

      const resAddress = await api.post('/catalog/addresses', {
        address_line: address,
        city: 'Town',
        state: 'State',
        pincode: '123456',
      });
      const addressId = resAddress.data.id;

      const resOrder = await api.post('/catalog/orders', {
        address_id: addressId,
        store_id: storeId,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        total_price: total,
      });

      setCart([]);
      fetchCart();

      Alert.alert(
        'Order Placed 🎉',
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
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 8 },
      ]}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.card}>
          <Text style={styles.header}>🧾 Checkout</Text>

          {/* Address Section */}
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your complete address"
            multiline
            style={styles.textInput}
            placeholderTextColor="#888"
          />

          {/* Payment Options */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.paymentSelected,
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text
              style={[
                styles.paymentText,
                paymentMethod === 'cod' && styles.paymentTextSelected,
              ]}
            >
              💵 Cash on Delivery (COD)
            </Text>
          </TouchableOpacity>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRowContainer}>
              <Text style={styles.summaryLabel}>Items in Cart</Text>
              <Text style={styles.summaryValue}>{cart.length}</Text>
            </View>
            <View style={styles.summaryRowContainer}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>₹ {total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity
            style={[
              styles.orderButton,
              (loading || !paymentMethod) && styles.disabledButton,
            ]}
            disabled={loading || !paymentMethod}
            onPress={placeOrder}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.orderButtonText}>
                {paymentMethod ? 'Place Order' : 'Select Payment Method'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Items List */}
        {cart.length > 0 && (
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsHeader}>🛍️ Your Items</Text>
            {cart.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View>
                  <Text style={styles.itemName}>{item.product?.name}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ₹ {(item.product?.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.15)',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B00',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: '#fff',
    backgroundColor: '#141414',
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#141414',
    marginBottom: 16,
  },
  paymentSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  paymentText: {
    color: '#ccc',
    fontWeight: '600',
  },
  paymentTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.15)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  summaryRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#ccc',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: '#FF6B00',
    fontWeight: '700',
  },
  orderButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#555',
    shadowOpacity: 0,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemsContainer: {
    marginTop: 10,
    paddingBottom: 40,
  },
  itemsHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B00',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.1)',
  },
  itemName: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  itemQty: {
    color: '#aaa',
    marginTop: 2,
  },
  itemPrice: {
    color: '#FF6B00',
    fontWeight: '700',
  },
});
