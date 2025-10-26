import React, { useState, useEffect } from 'react';
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
import * as Location from 'expo-location';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cart, setCart, fetchCart, total } = useCart();
  const { userInfo } = useAuth();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const ALLOWED_CITY = 'Kudachi';
  const ALLOWED_PINCODE = '591311';

  // Prefill phone number
  useEffect(() => {
    if (userInfo?.phone) {
      setPhone(userInfo.phone.replace(/[^\d]/g, '').slice(0, 10));
    }
  }, [userInfo]);

  // Format phone input
  const formatPhone = (text) => text.replace(/[^\d]/g, '').slice(0, 10);

  // Check deliverable address
  const isAddressDeliverable = (addr) => {
    if (!addr) return false;
    const lowerAddr = addr.toLowerCase();
    return (
      lowerAddr.includes(ALLOWED_CITY.toLowerCase()) ||
      lowerAddr.includes(ALLOWED_PINCODE)
    );
  };

  // Fetch current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Please enable location permissions in your device settings.'
          );
          setFetchingLocation(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const formattedAddress = `${place.name || ''}, ${place.street || ''}, ${place.city || ''}, ${place.region || ''}, ${place.postalCode || ''}`;
          setAddress(formattedAddress);
        } else {
          setAddress('Unable to detect address');
        }
      } catch (e) {
        console.log('Error fetching location:', e);
        setAddress('Unable to fetch location');
      } finally {
        setFetchingLocation(false);
      }
    })();
  }, []);

  // Load cart
  useEffect(() => {
    const loadCart = async () => {
      try {
        await fetchCart();
      } catch (e) {
        console.log('Error loading cart:', e.message || e);
        setCart([]);
      }
    };
    loadCart();
  }, []);

  // Place order
  const placeOrder = async () => {
    if (!cart || !cart.length) {
      return Alert.alert('Cart Empty', 'Add items before checkout.');
    }

    if (!paymentMethod) {
      return Alert.alert('Select Payment', 'Please select a payment method.');
    }

    if (!phone || phone.length !== 10) {
      return Alert.alert('Invalid Number', 'Enter a valid 10-digit contact number.');
    }

    if (!isAddressDeliverable(address)) {
      return Alert.alert(
        'Delivery Not Available',
        `Currently we only deliver to ${ALLOWED_CITY} (${ALLOWED_PINCODE}).`
      );
    }

    setLoading(true);
    try {
      const storeId = cart[0]?.product?.store_id;
      if (!storeId) throw new Error('Store information missing.');

      // Save address
      const resAddress = await api.post('/catalog/addresses', {
        address_line: address,
        city: ALLOWED_CITY,
        state: 'Karnataka',
        pincode: ALLOWED_PINCODE,
      });
      const addressId = resAddress.data.id;

      // Place order
      const resOrder = await api.post('/catalog/orders', {
        address_id: addressId,
        store_id: storeId,
        payment_method: paymentMethod,
        contact_number: phone,
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
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 8 }]}
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
          {fetchingLocation ? (
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <ActivityIndicator size="small" color="#FF6B00" />
              <Text style={{ color: '#888', marginTop: 6 }}>Fetching your location...</Text>
            </View>
          ) : (
            <>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your complete address"
                multiline
                style={styles.textInput}
                placeholderTextColor="#888"
              />
              {!isAddressDeliverable(address) && (
                <Text style={{ color: '#f00', marginBottom: 8 }}>
                  ❌ Delivery not available for this address. Use {ALLOWED_CITY}.
                </Text>
              )}
            </>
          )}

          {/* Phone Section */}
          <Text style={styles.sectionTitle}>Contact Number</Text>
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(formatPhone(t))}
            placeholder="Enter contact number for this order"
            keyboardType="phone-pad"
            style={styles.textInput}
            placeholderTextColor="#888"
          />
          {phone && phone.length !== 10 && (
            <Text style={{ color: '#f00', marginBottom: 8 }}>
              ❌ Enter a valid 10-digit number
            </Text>
          )}

          {/* Payment Options */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextSelected]}>
              💵 Cash on Delivery (COD)
            </Text>
          </TouchableOpacity>

          {/* Summary & Place Order */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRowContainer}>
              <Text style={styles.summaryLabel}>Items in Cart</Text>
              <Text style={styles.summaryValue}>{cart?.length || 0}</Text>
            </View>
            <View style={styles.summaryRowContainer}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>₹ {total.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.orderButton,
              (loading || !paymentMethod || phone.length !== 10) && styles.disabledButton
            ]}
            disabled={loading || !paymentMethod || phone.length !== 10}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F0F0F' },
  container: { flex: 1, paddingHorizontal: 16 },
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
  header: { fontSize: 24, fontWeight: '800', color: '#FF6B00', marginBottom: 20, textAlign: 'center', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 12, minHeight: 50, textAlignVertical: 'top', marginBottom: 20, color: '#fff', backgroundColor: '#141414' },
  paymentOption: { borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 12, backgroundColor: '#141414', marginBottom: 16 },
  paymentSelected: { backgroundColor: '#FF6B00', borderColor: '#FF6B00', shadowColor: '#FF6B00', shadowOpacity: 0.3, shadowRadius: 8 },
  paymentText: { color: '#ccc', fontWeight: '600' },
  paymentTextSelected: { color: '#fff', fontWeight: '700' },
  summaryCard: { backgroundColor: '#141414', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,107,0,0.15)', paddingVertical: 14, paddingHorizontal: 16, marginBottom: 22 },
  summaryRowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  summaryLabel: { fontSize: 15, color: '#ccc', fontWeight: '600' },
  summaryValue: { fontSize: 16, color: '#FF6B00', fontWeight: '700' },
  orderButton: { backgroundColor: '#FF6B00', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#FF6B00', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  disabledButton: { backgroundColor: '#555', shadowOpacity: 0 },
  orderButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', textTransform: 'uppercase' },
});
