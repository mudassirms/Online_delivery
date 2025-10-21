import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import OrderScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 🛒 Dummy cart count (replace with context/state later)
const cartItemCount = 3;

function Tabs() {
  const insets = useSafeAreaInsets(); // ✅ dynamically handle bottom safe area (Android/iPhone)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }} edges={['bottom']}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: [
            styles.tabBar,
            { marginBottom: insets.bottom > 0 ? insets.bottom : 10 }, // lift tab bar above phone buttons
          ],
          tabBarIcon: ({ focused }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
            else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

            return (
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={26} color={focused ? '#1e90ff' : '#888'} />
                {route.name === 'Cart' && cartItemCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItemCount}</Text>
                  </View>
                )}
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Orders" component={OrderScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default function MainTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="ProductDetail" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: '600',
  },
  iconContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
