import React, { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ProductListScreen from "./screens/ProductListScreen";
import ProductDetailsScreen from "./screens/ProductDetailScreen";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import OrdersScreen from "./screens/OrdersScreen";
import StoresScreen from "./screens/StoresScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import VerifyOtpScreen from "./screens/VerifyOtpScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import VerifyEmailOtpScreen from "./screens/VerifyEmailOtpScreen";


import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// -------------------------
// ✅ Home Stack
// -------------------------
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Stores" component={StoresScreen} />
      <Stack.Screen name="Products" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />

    </Stack.Navigator>
  );
}

// -------------------------
// ✅ Orders Stack
// -------------------------
function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersMain" component={OrdersScreen} />
    </Stack.Navigator>
  );
}

// -------------------------
// ✅ Cart Stack
// -------------------------
function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

// -------------------------
// ✅ Profile Stack
// -------------------------
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}


// -------------------------
// ✅ Main Tabs (with badge)
// -------------------------
function MainTabs() {
  const { cart } = useCart();
  const cartItemCount = cart?.length || 0;

  // Animated badge effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (cartItemCount > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [cartItemCount]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#FF6B00",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopWidth: 0,
          elevation: 10,
          height: 70,
          paddingBottom: 10,
          shadowColor: "#FF6B00",
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Orders") iconName = focused ? "receipt" : "receipt-outline";
          else if (route.name === "Cart") iconName = focused ? "cart" : "cart-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={26} color={color} />
              {route.name === "Cart" && cartItemCount > 0 && (
                <Animated.View
                  style={[styles.badge, { transform: [{ scale: scaleAnim }] }]}
                >
                  <Text style={styles.badgeText}>{cartItemCount}</Text>
                </Animated.View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}


// -------------------------
// ✅ Handles Authentication
// -------------------------
function AppNavigator() {
  const { userToken, loading } = useContext(AuthContext);

  if (loading) return null; // Could show splash screen or loader

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userToken ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          {/* 🔥 Add these 3 new screens for Password Reset */}
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
<Stack.Screen name="VerifyEmailOtp" component={VerifyEmailOtpScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}


// -------------------------
// ✅ Root App
// -------------------------
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}


// -------------------------
// ✅ Styles
// -------------------------
const styles = StyleSheet.create({
  iconContainer: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
