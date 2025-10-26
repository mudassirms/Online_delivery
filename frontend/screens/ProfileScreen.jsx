import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import * as Location from "expo-location"; // ✅ Added import

export default function ProfileScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ New state for location info
  const [address, setAddress] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (e) {
        console.log("Error fetching profile:", e.response?.status, e.response?.data);
        if (e.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ✅ Fetch current GPS location + reverse geocode
  const getCurrentLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Please allow location access to continue.");
        setLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCoords({ lat: latitude, lng: longitude });

      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo.length > 0) {
        const place = geo[0];
        const fullAddress = `${place.name || ""}, ${place.street || ""}, ${place.city || ""}, ${place.region || ""}, ${place.postalCode || ""}`;
        setAddress(fullAddress);
      }
    } catch (error) {
      console.error("Location Error:", error);
      Alert.alert("Error", "Unable to fetch location.");
    } finally {
      setLocating(false);
    }
  };

  const handleLogout = () => logout();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No user data available.</Text>
      </View>
    );
  }

  // Generate initials for avatar
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>👤 Profile</Text>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* <View style={styles.infoRow}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{user.id || "N/A"}</Text>
        </View> */}

        {user.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user.phone}</Text>
          </View>
        )}

        {user.role && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>
        )}

        {/* ✅ Show location info */}
        {address && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Location</Text>
            <Text style={[styles.value, { flex: 1, textAlign: "right" }]} numberOfLines={2}>
              {address}
            </Text>
          </View>
        )}

        {/* ✅ Fetch location button */}
        <TouchableOpacity
          style={[styles.locationBtn, locating && { opacity: 0.7 }]}
          onPress={getCurrentLocation}
          disabled={locating}
          activeOpacity={0.8}
        >
          {locating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.locationBtnText}>📍 Use Current Location</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F0F",
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FF6B00",
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#FF6B00",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 4 },
  userEmail: { fontSize: 15, color: "#bbb" },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: { fontSize: 14, color: "#aaa" },
  value: { fontSize: 15, fontWeight: "600", color: "#fff" },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#FF6B00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#FF6B00",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  emptyText: { color: "#bbb", fontSize: 16 },

  // ✅ New location button styles
  locationBtn: {
    marginTop: 16,
    backgroundColor: "#FF6B00",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  locationBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
