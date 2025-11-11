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
  StatusBar,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const { width } = Dimensions.get("window");

// Distance calculator
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function ProductsScreen({ route, navigation }) {
  const { storeId, storeName, contactNumber, popularProducts, storeLocation } =
    route.params || {};

  const [products, setProducts] = useState(popularProducts || []);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [distanceKm, setDistanceKm] = useState(0);

  const { addToCart } = useCart();

  useEffect(() => {
    const loadEverything = async () => {
      try {
        const prod = api.get(`/catalog/stores/${storeId}/products`);
        const cats = api.get(`/catalog/stores/${storeId}/subcategories`);

        const [pRes, cRes] = await Promise.all([prod, cats]);

        setProducts(pRes.data);
        setSubcategories(cRes.data);

      } catch (e) {
        console.warn("❌ Failed to load:", e.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };

    loadEverything();

    // Distance pricing
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({});
        if (storeLocation?.lat && storeLocation?.lng) {
          const dist = calculateDistance(
            loc.coords.latitude,
            loc.coords.longitude,
            storeLocation.lat,
            storeLocation.lng
          );
          setDistanceKm(dist);
        }
      } catch (err) {
        console.log("Location error:", err);
      }
    })();
  }, [storeId]);

  // ✅ Apply distance pricing
  const adjustedProducts = products.map((item) => {
    if (distanceKm > 0) {
      const adjustedPrice = item.price + distanceKm * 2;
      return { ...item, adjustedPrice: Math.round(adjustedPrice) };
    }
    return { ...item, adjustedPrice: item.price };
  });

  // ✅ Category filter  
  const categoryFiltered =
    selectedCategory === "all"
      ? adjustedProducts
      : adjustedProducts.filter(
          (item) =>
            item.subcategory_id &&
            item.subcategory_id.toString() === selectedCategory.toString()
        );

  // ✅ Search filter
  const finalFiltered = categoryFiltered.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    const isAvailable = item.available;

    return (
      <View style={styles.card}>
        <Image
          source={{
            uri:
              item.image ||
              "https://via.placeholder.com/150x150.png?text=Product",
          }}
          style={styles.image}
        />
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>₹{item.adjustedPrice}</Text>

          {distanceKm > 0 && (
            <Text style={styles.distanceText}>
              (+₹{Math.round(distanceKm * 2)} distance fee)
            </Text>
          )}

          {!isAvailable && (
            <Text style={styles.unavailable}>Unavailable</Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.addButton,
                !isAvailable && { backgroundColor: "#555" },
              ]}
              disabled={!isAvailable}
              onPress={() => addToCart(item, 1)}
            >
              <Text style={styles.addButtonText}>
                {isAvailable ? "Add to Cart" : "Unavailable"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                navigation.navigate("ProductDetail", { product: item })
              }
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
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.header}>{storeName || "Products"}</Text>
          {contactNumber && (
            <Text style={styles.contactText}>📞 {contactNumber}</Text>
          )}
        </View>

        <View style={{ width: 22 }} />
      </View>

      {/* SEARCH */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ✅ CATEGORY BAR */}
      <View style={styles.categoryBar}>
        <FlatList
          data={[{ id: "all", name: "All" }, ...subcategories]}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.id &&
                    styles.categoryTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* PRODUCTS */}
      {finalFiltered.length === 0 ? (
        <Text style={styles.emptyText}>No products found.</Text>
      ) : (
        <FlatList
          data={finalFiltered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#bbb", marginTop: 10 },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#121212",
    alignItems: "center",
  },

  backArrow: { fontSize: 22, color: "#FF6B00", fontWeight: "700" },
  headerTextContainer: { flex: 1, alignItems: "center" },
  header: { color: "#FF6B00", fontSize: 20, fontWeight: "700" },
  contactText: { color: "#ccc", fontSize: 13 },

  searchBar: {
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
  },
  searchInput: { color: "#fff", fontSize: 16 },

  categoryBar: { marginLeft: 16, marginBottom: 10 },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  categoryChipActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  categoryText: { color: "#ccc", fontSize: 14 },
  categoryTextActive: { color: "#fff", fontWeight: "700" },

  card: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
  },
  image: { width: width * 0.32, height: width * 0.32 },

  details: { flex: 1, padding: 12 },
  name: { color: "#fff", fontSize: 16, fontWeight: "600" },
  price: { color: "#FF6B00", fontWeight: "700", fontSize: 15 },
  distanceText: { color: "#999", fontSize: 12, marginTop: 4 },
  unavailable: { color: "#FF4C4C", marginTop: 4 },

  buttonRow: { flexDirection: "row", marginTop: 10 },

  addButton: {
    flex: 1,
    backgroundColor: "#FF6B00",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "700" },

  detailsButton: {
    flex: 1,
    borderColor: "#FF6B00",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  detailsButtonText: { color: "#FF6B00", fontWeight: "600" },

  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 16,
    marginTop: 20,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 50 },
});
