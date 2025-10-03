import React, { useEffect, useState } from "react";
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
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.username}>Mudassir</Text>
          </View>
          <Image source={{ uri: "https://via.placeholder.com/50" }} style={styles.avatar} />
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <TextInput placeholder="Search for food or groceries..." style={styles.searchInput} />
        </View>

        {/* BANNERS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
          {banners.map((banner) => (
            <Image key={banner.id} source={{ uri: banner.image }} style={styles.bannerImage} />
          ))}
        </ScrollView>

        {/* CATEGORY SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
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
              <Image source={{ uri: item.image }} style={styles.categoryImage} />
              <Text style={styles.categoryName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingVertical: 8 }}
        />

        {/* POPULAR PRODUCTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Picks</Text>
          <TouchableOpacity>
            <Text style={{ color: "#FF6B00", fontWeight: "600" }}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={popular}
          keyExtractor={(item) => String(item.id)}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={{ color: "#FF6B00", fontWeight: "bold" }}>₹{item.price}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  greeting: { fontSize: 16, color: "#555" },
  username: { fontSize: 22, fontWeight: "bold" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, padding: 10, borderRadius: 10, backgroundColor: "#f0f0f0" },
  searchInput: { flex: 1, fontSize: 16 },
  bannerImage: { width: 300, height: 150, borderRadius: 12, marginRight: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  productCard: { width: 100, marginRight: 12, backgroundColor: "#fff", borderRadius: 12, padding: 8, elevation: 2, alignItems: "center" },
  productImage: { width: 100, height: 100, borderRadius: 10 },
  productName: { marginTop: 5, fontWeight: "600" },
  categoryCard: { width: 80, marginRight: 16, alignItems: "center" },
  categoryImage: { width: 70, height: 70, borderRadius: 35, marginBottom: 6, backgroundColor: "#f5f5f5" },
  categoryName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
});
