import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import api from "../services/api";

export default function VerifyEmailOtpScreen({ navigation, route }) {
  const { email } = route.params;
  const [otp, setOtp] = useState("");

  const verify = async () => {
    try {
      await api.post("/auth/verify-email-otp", { email, otp });
      Alert.alert("Verified!", "Email verified. You may now log in.");
      navigation.replace("Login");
    } catch {
      Alert.alert("Invalid OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Email OTP</Text>

      <TextInput
        placeholder="6-digit OTP"
        placeholderTextColor="#888"
        style={styles.input}
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={verify}>
        <Text style={styles.text}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 24, justifyContent: "center" },
  title: { color: "#FF6B00", fontSize: 26, marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: "#1e1e1e", color: "#fff", padding: 14, borderRadius: 10, marginBottom: 20 },
  button: { backgroundColor: "#FF6B00", padding: 14, borderRadius: 10, alignItems: "center" },
  text: { color: "#fff", fontSize: 18 },
});
