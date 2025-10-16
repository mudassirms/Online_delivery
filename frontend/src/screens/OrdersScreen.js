import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native'; // ✅ auto refresh when screen focused

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await api.get('/catalog/orders');
      setOrders(res.data || []);
    } catch (e) {
      console.warn('Failed to load orders', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh orders when screen is focused (after checkout)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrders();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, []);

  const renderItem = ({ item }) => (
    <View
      style={{
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
        Order #{item.id}
      </Text>

      <Text style={{ color: '#555', marginBottom: 4 }}>
        Status:{' '}
        <Text
          style={{
            color:
              item.status === 'delivered'
                ? 'green'
                : item.status === 'pending'
                ? '#FF9800'
                : '#E53935',
            fontWeight: '600',
          }}
        >
          {item.status?.toUpperCase()}
        </Text>
      </Text>

      <Text style={{ color: '#555', marginBottom: 4 }}>
        Total:{' '}
        <Text style={{ fontWeight: '600' }}>
          ₹{Number(item.total_price || 0).toFixed(2)}
        </Text>
      </Text>

      <Text style={{ color: '#555', marginBottom: 4 }}>
        Items:{' '}
        {item.items?.length
          ? item.items
              .map((i) => `${i.quantity}× ${i.product?.name || i.product_id}`)
              .join(', ')
          : 'No items'}
      </Text>

      <Text style={{ color: '#555' }}>
        Address: {item.address?.address_line || 'N/A'}, {item.address?.city || ''}, {item.address?.state || ''} - {item.address?.pincode || ''}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9f9f9',
        }}
      >
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={{ marginTop: 10, color: '#777' }}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f9f9', padding: 16 }}>
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B00']} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
            You haven’t placed any orders yet.
          </Text>
        }
      />
    </View>
  );
}
