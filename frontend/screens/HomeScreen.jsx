import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../services/api";

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const insets = useSafeAreaInsets();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    else if (hour < 18) return "Good Afternoon,";
    else return "Good Evening,";
  };

  const scrollX = new Animated.Value(0);

  const load = async () => {
    try {
      const [userRes, catRes, bannerRes, popRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/catalog/categories"),
        api.get("/home/banners"),
        api.get("/products/popular"),
      ]);
      setUser(userRes.data);
      setCategories(catRes.data);
      setBanners(bannerRes.data);
      setPopular(popRes.data.slice(0, 5)); 

      setFilteredCategories(catRes.data);
      setFilteredProducts(popRes.data.slice(0, 5));
    } catch (e) {
      console.warn("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      setFilteredCategories(categories);
      setFilteredProducts(popular.slice(0, 5));
      return;
    }
    setFilteredCategories(
      categories.filter((cat) => cat.name.toLowerCase().includes(query))
    );
    setFilteredProducts(
      popular.filter((prod) => prod.name.toLowerCase().includes(query))
    );
  }, [searchQuery, categories, popular]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top || 10 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.username}>{user?.name || "User"} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image
            source={{ uri: user?.avatar || "https://i.pravatar.cc/150" }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search stores or products..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SEARCH RESULTS */}
        {searchQuery ? (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            {filteredCategories.length > 0 && (
              <View>
                <Text style={styles.searchSectionTitle}>Stores</Text>
                {filteredCategories.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    style={styles.searchResultItem}
                    onPress={() =>
                      navigation.navigate("Stores", {
                        storeId: store.id,
                        storeName: store.name,
                      })
                    }
                  >
                    <Image
                      source={{ uri: store.image }}
                      style={styles.searchResultImage}
                    />
                    <Text style={styles.searchResultText}>{store.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {filteredProducts.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.searchSectionTitle}>Products</Text>
                {filteredProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.searchResultItem}
                    onPress={() =>
                      navigation.navigate("ProductDetail", { product })
                    }
                  >
                    <Image
                      source={{ uri: product.image }}
                      style={styles.searchResultImage}
                    />
                    <Text style={styles.searchResultText}>
                      {product.name} - ₹{product.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* BANNERS */}
            <Animated.FlatList
              data={banners}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              pagingEnabled
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              renderItem={({ item }) => (
                <View style={styles.bannerWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.bannerImage}
                  />
                </View>
              )}
              contentContainerStyle={{ paddingHorizontal: 16, marginVertical: 16 }}
            />

            {/* SHOP BY CATEGORY */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
            </View>
            <FlatList
              data={filteredCategories}
              horizontal
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("Stores", {
                      storeId: item.id,
                      storeName: item.name,
                    })
                  }
                >
                  <View style={styles.categoryCardInner}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.categoryImage}
                    />
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingVertical: 8 }}
            />

            {/* POPULAR PICKS */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Picks</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Products", {
                    storeName: "Popular Products",
                    popularProducts: popular,
                  })
                }
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cleanProductCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate("ProductDetail", { product: item })
                  }
                >
                  <View>
                    {item.isNew && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>NEW</Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cleanProductImage}
                    />
                    <Text style={styles.cleanProductName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.cleanProductPrice}>₹{item.price}</Text>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingLeft: 16, paddingBottom: 24 }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  greeting: { fontSize: 16, color: "#aaa" },
  username: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: { fontSize: 16, color: "#fff" },
  bannerWrapper: {
    width: 300,
    height: 160,
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bannerImage: { width: "100%", height: "100%", borderRadius: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  seeAllText: { color: "#FF6B00", fontWeight: "600" },
  categoryCard: { width: 100, marginRight: 16 },
  categoryCardInner: {
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
  },
  categoryImage: { width: 70, height: 70, borderRadius: 40, marginBottom: 8 },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },

  // ✅ Clean product cards (no back color)
  cleanProductCard: { width: 160, marginRight: 16, alignItems: "center" },
  cleanProductImage: {
    width: 140,
    height: 140,
    borderRadius: 20,
    marginBottom: 8,
  },
  cleanProductName: {
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  cleanProductPrice: {
    marginTop: 4,
    color: "#FF6B00",
    fontWeight: "700",
    textAlign: "center",
  },

  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF6B00",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 10 },
  searchSectionTitle: { color: "#FF6B00", fontWeight: "700", marginBottom: 4 },
  searchResultItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  searchResultImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  searchResultText: { color: "#fff" },
});
