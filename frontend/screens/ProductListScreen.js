import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const { width } = Dimensions.get("window");

export default function ProductsScreen({ route, navigation }) {
  const { storeId, storeName, popularProducts } = route.params || {};
  const [products, setProducts] = useState(popularProducts || []);
  const [loading, setLoading] = useState(!popularProducts);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      if (popularProducts) return; // Skip API if products passed directly
      try {
        const res = await api.get(`/catalog/stores/${storeId}/products`);
        setProducts(res.data);
      } catch (e) {
        console.warn("Failed to load products", e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [storeId, popularProducts]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    const isAvailable = item.available;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>₹{item.price}</Text>
          {!isAvailable && <Text style={styles.unavailable}>Unavailable</Text>}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.addButton, !isAvailable && { backgroundColor: "#555" }]}
              disabled={!isAvailable}
              onPress={() => addToCart(item, 1)}
            >
              <Text style={styles.addButtonText}>
                {isAvailable ? "Add to Cart" : "Unavailable"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate("ProductDetail", { product: item })}
            >
              <Text style={styles.detailsButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        🛒 {storeName || "Popular Products"}
      </Text>
      {products.length === 0 ? (
        <Text style={styles.emptyText}>No products available.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F0F",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF6B00",
    textAlign: "center",
    paddingVertical: 16,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#FF6B00",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  image: { width: width * 0.3, height: width * 0.3 },
  details: { flex: 1, padding: 12, justifyContent: "space-between" },
  name: { fontSize: 16, fontWeight: "600", color: "#F5F5F5", marginBottom: 4 },
  price: { color: "#FF6B00", fontWeight: "700", fontSize: 15, marginBottom: 6 },
  unavailable: { color: "#FF4C4C", fontWeight: "600", marginBottom: 8 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  addButton: {
    flex: 1,
    backgroundColor: "#FF6B00",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  detailsButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FF6B00",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsButtonText: { color: "#FF6B00", fontWeight: "600", fontSize: 14 },
});
