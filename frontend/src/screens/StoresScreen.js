import React, { useEffect, useState } from "react";
import { View, Text, FlatList, SafeAreaView, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import api from "../services/api";

export default function StoresScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await api.get(`/catalog/categories/${categoryId}/stores`);
        setStores(res.data);
      } catch (e) {
        console.warn("Failed to load stores", e);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, [categoryId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text style={styles.header}>Stores in {categoryName}</Text>
      <FlatList
        data={stores}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.storeCard}
            onPress={() => navigation.navigate("Products", { storeId: item.id, storeName: item.name })}
          >
            <Image source={{ uri: item.image }} style={styles.storeImage} />
            <Text style={styles.storeName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: "700", padding: 16 },
  storeCard: { flexDirection: "row", alignItems: "center", marginBottom: 12, backgroundColor: "#b2f9f9", borderRadius: 10, padding: 10 },
  storeImage: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  storeName: { fontSize: 16, fontWeight: "600" },
});
