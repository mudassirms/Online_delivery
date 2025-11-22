import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function PhoneOtpScreen({ navigation, route }) {
  const { phone } = route.params;
  const [otp, setOtp] = useState("");
  const { login } = useContext(AuthContext);

  const verifyPhoneOtp = async () => {
    try {
      const response = await api.post("/auth/phone/verify-otp", { phone, otp });

      await login(response.data.access_token, response.data.user);

      navigation.replace("MainTabs");
    } catch (err) {
      Alert.alert("Invalid OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Phone OTP</Text>

      <TextInput
        placeholder="6-digit OTP"
        placeholderTextColor="#888"
        style={styles.input}
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={verifyPhoneOtp}>
        <Text style={styles.text}>Verify OTP</Text>
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
