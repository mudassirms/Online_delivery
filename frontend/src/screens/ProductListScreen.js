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
} from "react-native";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductsScreen({ route, navigation }) {
  const { storeId, storeName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
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
  }, [storeId]);

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
      <View style={styles.productCard}>
        <Image source={{ uri: item.image }} style={styles.productImage} />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.price}>₹{item.price}</Text>

          {!isAvailable && (
            <Text style={{ color: "red", fontWeight: "bold", marginBottom: 6 }}>
              Unavailable
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isAvailable ? "#FF6B00" : "#999" },
            ]}
            disabled={!isAvailable}
            onPress={() => addToCart(item, 1)}
          >
            <Text style={styles.buttonText}>
              {isAvailable ? "Add to Cart" : "Unavailable"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 6 }}
            onPress={() => navigation.navigate("ProductDetails", { product: item })}
          >
            <Text style={{ color: "#007BFF" }}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text style={styles.header}>Products in {storeName}</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 20, fontWeight: "700", padding: 16, color: "#222" },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  productImage: { width: 100, height: 100, borderRadius: 10 },
  productName: { fontSize: 16, fontWeight: "600", color: "#333" },
  price: { color: "#FF6B00", fontWeight: "bold", marginVertical: 6 },
  button: { borderRadius: 6, paddingVertical: 6, alignItems: "center", marginTop: 6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
