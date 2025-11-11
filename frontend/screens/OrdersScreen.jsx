import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollingRef = useRef(null);

  const loadOrders = async () => {
    try {
      const res = await api.get("/catalog/orders");
      const fetchedOrders = res.data || [];
      console.log("Fetched orders:", fetchedOrders);

      // ✅ Fetch all categories first
      const { data: categories } = await api.get("/catalog/categories");
      console.log("Fetched categories:", categories);

      // ✅ Fetch all stores from all categories
      const storesMap = {};
      for (const category of categories) {
        try {
          const { data: stores } = await api.get(
            `/catalog/categories/${category.id}/stores`
          );
          stores.forEach((store) => {
            storesMap[store.name.toLowerCase()] = store;
          });
        } catch (err) {
          console.warn("Failed to fetch stores for category", category.id, err);
        }
      }

      console.log("All stores loaded:", Object.keys(storesMap));

      // ✅ Merge store contact number into each order
      const mergedOrders = fetchedOrders.map((order) => {
        const storeMatch =
          storesMap[order.store_name?.toLowerCase()] || null;

        return {
          ...order,
          store_name: storeMatch?.name || order.store_name || "Unknown Store",
          contact_number: storeMatch?.contact_number || null,
        };
      });

      console.log("Orders after merge:", mergedOrders);
      setOrders(mergedOrders);
    } catch (e) {
      console.warn("Failed to load orders", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const startPolling = () => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(() => {
      loadOrders();
    }, 15000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrders();
      startPolling();
      return () => stopPolling();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#E53935";
      default:
        return "#607D8B";
    }
  };

  const formatDateTime = (utcString) => {
    if (!utcString) return "N/A";
    return dayjs.utc(utcString).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A");
  };

  const callStore = (phoneNumber) => {
    if (!phoneNumber) {
      console.warn("No contact number available for this store");
      return;
    }
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch((err) => {
      console.warn("Failed to open dialer with url", url, err);
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderTitle}>{item.order_title || "Order"}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${getStatusColor(item.status)}22`,
              borderColor: getStatusColor(item.status),
            },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status?.toUpperCase() || "PENDING"}
          </Text>
        </View>
      </View>

      <Text style={styles.storeName}>🏬 {item.store_name || "Unknown Store"}</Text>
      <View style={styles.divider} />

      <Text style={styles.text}>
        <Text style={styles.label}>Total: </Text>₹{Number(item.total_price || 0).toFixed(2)}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Items: </Text>
        {item.items?.length
          ? item.items
              .map((i) => `${i.quantity}× ${i.product?.name || "Unknown Product"}`)
              .join(", ")
          : "No items"}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Address: </Text>
        {item.address
          ? `${item.address.address_line}, ${item.address.city}, ${item.address.state} - ${item.address.pincode}`
          : "N/A"}
      </Text>

      <Text style={styles.dateText}>📅 {formatDateTime(item.created_at)}</Text>

      {item.status?.toLowerCase() === "pending" && (
        <>
          <TouchableOpacity style={[styles.cancelButton, { opacity: 0.5 }]} disabled>
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>

          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>⚠️ Manual Cancellation Required</Text>
            <Text style={styles.alertText}>
              To cancel this order, please call the restaurant owner directly:
            </Text>
            {item.contact_number ? (
              <TouchableOpacity onPress={() => callStore(item.contact_number)}>
                <Text style={styles.contactText}>📞 {item.contact_number}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.contactText, { color: "#666" }]}>No contact info</Text>
            )}
          </View>
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>📦 My Orders</Text>
          <Text style={styles.headerSubtitle}>Track all your purchases easily</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B00"]}
            tintColor="#FF6B00"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>You haven’t placed any orders yet.</Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  headerWrapper: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 6 : 0,
    backgroundColor: "#121212",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#FF6B00" },
  headerSubtitle: { fontSize: 13, color: "#bbb", marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.15)",
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderTitle: { fontSize: 16, fontWeight: "700", color: "#fff", flexShrink: 1 },
  storeName: { fontSize: 13, color: "#aaa", marginTop: 4 },
  statusBadge: { borderWidth: 1, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  statusText: { fontSize: 12, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 10 },
  text: { color: "#ddd", marginBottom: 6, lineHeight: 20 },
  label: { color: "#FF6B00", fontWeight: "600" },
  dateText: { color: "#888", fontSize: 12, marginTop: 6, textAlign: "right" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F0F0F" },
  loadingText: { marginTop: 10, color: "#bbb" },
  emptyText: { textAlign: "center", marginTop: 60, color: "#888", fontSize: 15 },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#E53935",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: { color: "#fff", fontWeight: "700" },
  alertCard: {
    backgroundColor: "#FF6B0033",
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B00",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  alertTitle: { fontSize: 14, fontWeight: "700", color: "#FF6B00", marginBottom: 4 },
  alertText: { fontSize: 13, color: "#fff", marginBottom: 6 },
  contactText: { fontSize: 14, color: "#4FC3F7", fontWeight: "700" },
});
