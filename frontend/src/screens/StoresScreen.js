import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  LinearGradient,
} from "react-native";
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading stores...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Stores in {categoryName}</Text>

      <FlatList
        data={stores}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.storeCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("Products", {
                storeId: item.id,
                storeName: item.name,
              })
            }
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.storeImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.storeName}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.storeDesc}>
                {item.description || "Tap to view available products"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No stores found for this category.</Text>
        }
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FF6B00",
    textAlign: "center",
    marginVertical: 20,
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.15)",
    shadowColor: "#FF6B00",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.3)",
  },
  storeImage: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  storeDesc: {
    fontSize: 13,
    color: "#bbb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#bbb",
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#888",
    fontSize: 15,
  },
});
