import React, { useContext } from "react";
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

import { CartProvider } from "./context/CartContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// --- Each tab gets its own Stack so tab bar stays visible ---
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

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersMain" component={OrdersScreen} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}


// --- Bottom Tabs ---
function MainTabs() {
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
          return <Ionicons name={iconName} size={26} color={color} />;
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


// --- Handles authentication ---
function AppNavigator() {
  const { userToken, loading } = useContext(AuthContext);

  if (loading) return null; // Could show splash screen

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userToken ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}


// --- Root App ---
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
