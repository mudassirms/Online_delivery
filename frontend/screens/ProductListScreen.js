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
  Modal,
  Pressable,
  Platform,
} from "react-native";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const { width } = Dimensions.get("window");

export default function ProductsScreen({ route, navigation }) {
  const { storeId, storeName, contactNumber, popularProducts } = route.params || {};
  
  const [products, setProducts] = useState(popularProducts || []);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loading, setLoading] = useState(!popularProducts);
  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      if (popularProducts) {
        setProducts(popularProducts);
        setOriginalProducts(popularProducts);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/catalog/stores/${storeId}/products`);
        setProducts(res.data);
        setOriginalProducts(res.data);
      } catch (e) {
        console.warn("Failed to load products", e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [storeId, popularProducts]);

  const filteredProducts = products.filter((item) =>
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
            uri: item.image || "https://via.placeholder.com/150x150.png?text=Product",
          }}
          style={styles.image}
          resizeMode="cover"
        />
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
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.header}>{storeName || "Popular Products"}</Text>
          {contactNumber && (
            <Text style={styles.contactText}>📞 {contactNumber}</Text>
          )}
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* PRODUCT LIST */}
      {filteredProducts.length === 0 ? (
        <Text style={styles.emptyText}>No products found.</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* MENU MODAL */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuModal}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const sorted = [...products].sort((a, b) => a.price - b.price);
                setProducts(sorted);
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>Sort by Price ↑</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const sorted = [...products].sort((a, b) => b.price - a.price);
                setProducts(sorted);
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>Sort by Price ↓</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const filtered = originalProducts.filter((item) => item.available);
                setProducts(filtered);
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>Filter Available</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setProducts(originalProducts);
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F0F",
  },
  loadingText: { color: "#bbb", marginTop: 8, fontSize: 14 },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#121212",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 8 : 20, // dynamic top padding
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { color: "#FF6B00", fontSize: 20, fontWeight: "700" },
  headerTextContainer: { alignItems: "center", flex: 1 },
  header: { fontSize: 20, fontWeight: "700", color: "#FF6B00" },
  contactText: { fontSize: 13, color: "#ccc", marginTop: 2 },
  menuButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  menuDots: { fontSize: 22, color: "#FF6B00", fontWeight: "700" },

  searchBar: {
    margin: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { color: "#fff", fontSize: 16 },

  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyText: { color: "#aaa", textAlign: "center", fontSize: 16, marginTop: 20 },

  card: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#FF6B00",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: { width: width * 0.32, height: width * 0.32 },
  details: { flex: 1, padding: 12, justifyContent: "space-between" },
  name: { fontSize: 16, fontWeight: "600", color: "#F5F5F5", marginBottom: 4 },
  price: { color: "#FF6B00", fontWeight: "700", fontSize: 15, marginBottom: 6 },
  unavailable: { color: "#FF4C4C", fontWeight: "600", marginBottom: 6 },
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuModal: {
    width: 160,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight + 60 : 80,
    marginRight: 16,
    paddingVertical: 8,
    shadowColor: "#FF6B00",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemText: { color: "#fff", fontWeight: "600" },
});
