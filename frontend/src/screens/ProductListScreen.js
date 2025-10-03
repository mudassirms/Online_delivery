import React, { useEffect, useState } from "react";
import { View, Text, FlatList, SafeAreaView, Image, ActivityIndicator, StyleSheet } from "react-native";
import api from "../services/api";

export default function ProductsScreen({ route }) {
  const { storeId, storeName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text style={styles.header}>Products in {storeName}</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={{ color: "#FF6B00", fontWeight: "bold" }}>₹{item.price}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: "700", padding: 16 },
  productCard: { marginBottom: 2, backgroundColor: "#f9f9f9", borderRadius: 10, padding: 10, alignItems: "row" },
  productImage: { width: 100, height: 100, borderRadius: 10 },
  productName: { marginTop: 5, fontSize: 16, fontWeight: "600" },
});
