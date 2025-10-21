import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../context/CartContext";

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const insets = useSafeAreaInsets();

  const isAvailable = product.available;

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top || 10 }]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* PRODUCT IMAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* DETAILS */}
        <View style={styles.details}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₹{product.price}</Text>

          {!isAvailable && (
            <Text style={styles.unavailable}>Currently Unavailable</Text>
          )}

          <Text style={styles.description}>
            {product.description || "No description available."}
          </Text>

          {/* QUANTITY SELECTOR */}
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!isAvailable}
            >
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyNumber}>{quantity}</Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(quantity + 1)}
              disabled={!isAvailable}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* ADD TO CART BUTTON */}
          <TouchableOpacity
            style={[
              styles.addButton,
              !isAvailable && { backgroundColor: "#444" },
            ]}
            disabled={!isAvailable}
            onPress={() => {
              if (!isAvailable) return;
              addToCart(product, quantity);
              navigation.navigate("Cart");
            }}
          >
            <Text style={styles.addButtonText}>
              {isAvailable ? "Add to Cart" : "Unavailable"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    backgroundColor: "#121212",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  backIcon: {
    fontSize: 22,
    color: "#FF6B00",
    fontWeight: "700",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },

  // IMAGE
  imageContainer: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    shadowColor: "#FF6B00",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: 320,
  },

  // DETAILS
  details: {
    padding: 18,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF6B00",
    marginBottom: 10,
  },
  unavailable: {
    color: "#FF4C4C",
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#BFBFBF",
    marginBottom: 20,
    lineHeight: 22,
  },

  // QUANTITY
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  qtyButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "#FF6B00",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  qtyText: {
    color: "#FF6B00",
    fontSize: 22,
    fontWeight: "800",
  },
  qtyNumber: {
    marginHorizontal: 16,
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
  },

  // ADD TO CART
  addButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B00",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
