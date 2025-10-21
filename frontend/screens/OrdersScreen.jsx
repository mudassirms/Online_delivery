import { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await api.get("/catalog/orders");
      setOrders(res.data || []);
    } catch (e) {
      console.warn("Failed to load orders", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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

  const getStatusColor = (status) => {
    switch (status) {
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${getStatusColor(item.status)}22`,
              borderColor: getStatusColor(item.status),
            },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.text}>
        <Text style={styles.label}>Total: </Text>₹
        {Number(item.total_price || 0).toFixed(2)}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Items: </Text>
        {item.items?.length
          ? item.items
              .map((i) => `${i.quantity}× ${i.product?.name || i.product_id}`)
              .join(", ")
          : "No items"}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Address: </Text>
        {item.address
          ? `${item.address.address_line}, ${item.address.city}, ${item.address.state} - ${item.address.pincode}`
          : "N/A"}
      </Text>
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

      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>📦 My Orders</Text>
          <Text style={styles.headerSubtitle}>
            Track all your purchases easily
          </Text>
        </View>
      </View>

      {/* ORDERS LIST */}
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
          <Text style={styles.emptyText}>
            You haven’t placed any orders yet.
          </Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },

  // HEADER WRAPPER (fixed notch-safe height)
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
    shadowColor: "#FF6B00",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF6B00",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#bbb",
    marginTop: 2,
  },

  // LIST CONTENT
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // ORDER CARD
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.15)",
    shadowColor: "#FF6B00",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 10,
  },
  text: {
    color: "#ddd",
    marginBottom: 6,
    lineHeight: 20,
  },
  label: {
    color: "#FF6B00",
    fontWeight: "600",
  },

  // STATES
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F0F",
  },
  loadingText: {
    marginTop: 10,
    color: "#bbb",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    color: "#888",
    fontSize: 15,
  },
});
