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
  StatusBar,
  Platform,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../services/api";

export default function StoresScreen({ route, navigation }) {
  const { storeId, storeName, categoryId, categoryName } = route.params || {};
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadStores = async () => {
      try {
        const idToUse = categoryId || storeId;
        const res = await api.get(`/catalog/categories/${idToUse}/stores`);
        setStores(res.data);
        setFilteredStores(res.data); // set initial filtered list
      } catch (e) {
        console.warn("❌ Failed to load stores", e);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, [categoryId, storeId]);

  // Filter stores locally when searchQuery changes
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      setFilteredStores(stores);
    } else {
      const filtered = stores.filter((store) =>
        store.name.toLowerCase().includes(query)
      );
      setFilteredStores(filtered);
    }
  }, [searchQuery, stores]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading stores...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top || 10 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {categoryName || storeName || "Stores"}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search stores..."
          placeholderTextColor="#ccc"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* STORE LIST */}
      <FlatList
        data={filteredStores}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.storeCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("Products", {
                storeId: item.id,
                storeName: item.name,
              })
            }
          >
            {/* STORE IMAGE */}
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri:
                    item.image ||
                    "https://via.placeholder.com/100x100.png?text=Store",
                }}
                style={styles.storeImage}
                resizeMode="cover"
              />
            </View>

            {/* STORE INFO */}
            <View style={styles.infoContainer}>
              <Text style={styles.storeName}>{item.name}</Text>
              {item.contact_number ? (
                <Text style={styles.contactText}>📞 {item.contact_number}</Text>
              ) : (
                <Text style={[styles.contactText, { color: "#666" }]}>
                  No contact info
                </Text>
              )}
              <Text numberOfLines={2} style={styles.storeDesc}>
                {item.description || "Tap to view products from this store"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No stores found.</Text>
        }
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: 16,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a", // updated from #0f0f0f
  },
  // HEADER
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    backgroundColor: "#1a1a1a", // match main background
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)", // slightly brighter
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)", // slightly more visible
  },
  backText: {
    color: "#FF6B00",
    fontSize: 22,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  // SEARCH BAR
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)", // glass effect stronger
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  // STORE CARD
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)", // increased opacity for glass effect
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.2)", // subtle orange border
    shadowColor: "#FF6B00",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 14,
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
    marginBottom: 2,
  },
  contactText: {
    fontSize: 13,
    color: "#FF6B00",
    marginBottom: 4,
    fontWeight: "600",
  },
  storeDesc: {
    fontSize: 13,
    color: "#bbb",
    lineHeight: 18,
  },
  // STATES
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  loadingText: {
    color: "#bbb",
    marginTop: 10,
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    color: "#888",
    fontSize: 15,
  },
});

