import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import api from '../services/api';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (e) {
      console.warn('Failed to load orders', e);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        ListEmptyComponent={<Text>No orders yet.</Text>}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>Order #{item.id}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Total: ₹ {item.total_amount?.toFixed(2)}</Text>
            <Text>Items: {item.items?.map(i => `${i.quantity}x ${i.product_id}`).join(', ')}</Text>
            <Text>Address: {item.address}</Text>
          </View>
        )}
      />
    </View>
  );
}
