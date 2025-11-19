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

// 🕒 Import dayjs and timezone helpers
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const DISPLAY_TZ = "Asia/Kolkata";

// 🧩 Helper: parse time strings (handles 24h, 12h, etc.)
const parseTimeToTz = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string" || !timeStr.trim()) return null;

  const formats = ["HH:mm:ss", "HH:mm", "hh:mm A"];
  const today = dayjs().tz(DISPLAY_TZ).format("YYYY-MM-DD");

  for (let fmt of formats) {
    const parsed = dayjs.tz(`${today} ${timeStr}`, `${"YYYY-MM-DD"} ${fmt}`, DISPLAY_TZ);
    if (parsed.isValid()) return parsed;
  }

  const fallback = dayjs.tz(`${today}T${timeStr}`, DISPLAY_TZ);
  return fallback.isValid() ? fallback : null;
};

// 🧭 Helper: Determine if store is open now
const isStoreOpenNow = (store) => {
  if (!store?.open_time || !store?.close_time) return false;

  const now = dayjs().tz(DISPLAY_TZ);
  const open = parseTimeToTz(store.open_time);
  const close = parseTimeToTz(store.close_time);

  if (!open || !close) return false;

  // Handles cross-midnight (e.g., 10:00 PM - 2:00 AM)
  if (close.isSame(open) || close.isBefore(open)) {
    const closeNextDay = close.add(1, "day");
    return now.isBetween(open, closeNextDay, null, "[)");
  }

  return now.isBetween(open, close, null, "[)");
};

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

        // ✅ Compute open/closed status locally
        const updatedStores = res.data.map((store) => ({
          ...store,
          is_open_local: isStoreOpenNow(store),
        }));

        setStores(updatedStores);
        setFilteredStores(updatedStores);
      } catch (e) {
        console.warn("❌ Failed to load stores", e);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, [categoryId, storeId]);

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
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
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
        renderItem={({ item }) => {
          const openNow = item.is_open_local;

          return (
            <TouchableOpacity
              style={[
                styles.storeCard,
                !openNow && { opacity: 0.5 }, // visually indicate closed store
              ]}
              activeOpacity={0.9}
              onPress={() => {
                if (!openNow) return; // block closed stores
                navigation.navigate("Products", {
                  storeId: item.id,
                  storeName: item.name,
                });
              }}
            >
              {/* STORE IMAGE */}
              <Image
                source={{
                  uri:
                    item.image ||
                    "https://via.placeholder.com/100x100.png?text=Store",
                }}
                style={styles.storeImage}
                resizeMode="cover"
              />

              {/* STORE INFO */}
              <View style={styles.infoContainer}>
                <Text style={styles.storeName}>{item.name}</Text>

                {openNow ? (
                  <Text style={[styles.statusText, { color: "#4CAF50" }]}>
                    🟢 Open Now
                  </Text>
                ) : (
                  <Text style={[styles.statusText, { color: "#F44336" }]}>
                    🔴 Closed
                  </Text>
                )}

                {item.status_text &&
  item.status_text.toLowerCase() !== "open now" &&
  item.status_text.toLowerCase() !== "closed" && (
    <Text style={styles.statusDetails}>{item.status_text}</Text>
  )}


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
          );
        }}
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
    backgroundColor: "#121212",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    backgroundColor: "#121212",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: "#222",
  },
  infoContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
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
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusDetails: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 4,
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
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    color: "#888",
    fontSize: 15,
  },
});
