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
} from "react-native";
import api from "../services/api";

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [catRes, bannerRes, popRes] = await Promise.all([
        api.get("/catalog/categories"),
        api.get("/home/banners"),
        api.get("/products/popular"),
      ]);
      setCategories(catRes.data);
      setBanners(bannerRes.data);
      setPopular(popRes.data);
    } catch (e) {
      console.warn("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back,</Text>
            <Text style={styles.username}>Mudassir 👋</Text>
          </View>
          <Image source={{ uri: "https://via.placeholder.com/50" }} style={styles.avatar} />
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search for food or groceries..."
            placeholderTextColor="#ccc"
            style={styles.searchInput}
          />
        </View>

        {/* BANNERS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16, paddingLeft: 16 }}>
          {banners.map((banner) => (
            <View key={banner.id} style={styles.bannerWrapper}>
              <Image source={{ uri: banner.image }} style={styles.bannerImage} />
            </View>
          ))}
        </ScrollView>

        {/* CATEGORY SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => navigation.navigate("Stores", { categoryId: item.id, categoryName: item.name })}
            >
              <View style={styles.glassBackground}>
                <Image source={{ uri: item.image }} style={styles.categoryImage} />
                <Text style={styles.categoryName}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingVertical: 8 }}
        />

        {/* POPULAR PRODUCTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Picks</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={popular}
          keyExtractor={(item) => String(item.id)}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.glassBackground}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>₹{item.price}</Text>
              </View>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingBottom: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f0f" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  greeting: { fontSize: 16, color: "#aaa" },
  username: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: "#333" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: { flex: 1, fontSize: 16, color: "#fff" },
  bannerWrapper: {
    width: 300,
    height: 160,
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  bannerImage: { width: "100%", height: "100%", borderRadius: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  seeAllText: { color: "#FF6B00", fontWeight: "600" },
  categoryCard: { width: 90, marginRight: 16 },
  glassBackground: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    backdropFilter: "blur(10px)", // Note: RN does not support natively; need expo-blur or similar
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  categoryImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 6 },
  categoryName: { fontSize: 12, fontWeight: "600", color: "#fff", textAlign: "center" },
  productCard: { width: 150, marginRight: 16 },
  productImage: { width: 100, height: 100, borderRadius: 16 },
  productName: { marginTop: 8, fontWeight: "700", color: "#fff", textAlign: "center" },
  productPrice: { marginTop: 4, color: "#FF6B00", fontWeight: "700" },
});
