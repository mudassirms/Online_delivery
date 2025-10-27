import React, { useEffect, useContext, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated, StatusBar } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function SplashScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      if (userToken) {
        navigation.replace("MainTabs"); 
      } else {
        navigation.replace("Login"); 
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [userToken]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <Animated.Image
        source={require("../assets/town.jpg")}
        style={[styles.logo, { opacity: fadeAnim }]}
      />
      <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
        TownDrop
      </Animated.Text>
      <Text style={styles.tagline}>Your Town. Your Delivery.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
    resizeMode: "contain",
  },
  text: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF6B00",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 8,
  },
});
