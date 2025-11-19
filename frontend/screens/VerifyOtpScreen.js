import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import api from "../services/api";

export default function VerifyOtpScreen({ navigation, route }) {
  const { email } = route.params;
  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    try {
      await api.post("/auth/verify-otp", { email, otp });
      navigation.navigate("ResetPassword", { email });
    } catch (err) {
      Alert.alert("Invalid OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>

      <TextInput
        placeholder="6-digit OTP"
        placeholderTextColor="#888"
        style={styles.input}
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={verifyOtp}>
        <Text style={styles.text}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 24, justifyContent: "center" },
  title: { color: "#FF6B00", fontSize: 26, marginBottom: 20, textAlign: "center" },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF6B00",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  text: { color: "#fff", fontSize: 18 },
});
