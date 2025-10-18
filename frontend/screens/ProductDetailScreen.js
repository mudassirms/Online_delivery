import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useCart } from "../context/CartContext";

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const isAvailable = product.available;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.details}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₹{product.price}</Text>

        {!isAvailable && <Text style={styles.unavailable}>Unavailable</Text>}

        <Text style={styles.description}>
          {product.description || "No description available."}
        </Text>

        {/* Quantity selector */}
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={!isAvailable}
          >
            <Text style={styles.qtyText}>-</Text>
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

        {/* Add to Cart button */}
        <TouchableOpacity
          style={[styles.addButton, !isAvailable && { backgroundColor: "#555" }]}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  image: {
    width: "100%",
    height: 300,
  },
  details: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F5F5F5",
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF6B00",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#bbb",
    marginBottom: 16,
  },
  unavailable: {
    color: "#FF4C4C",
    fontWeight: "700",
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  qtyButton: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#FF6B00",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: "#FF6B00",
    fontWeight: "700",
    fontSize: 20,
  },
  qtyNumber: {
    marginHorizontal: 12,
    fontSize: 18,
    color: "#F5F5F5",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
