import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import api from "../services/api";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const sendOtp = async () => {
    if (!email) return Alert.alert("Enter email");

    try {
      await api.post("/auth/request-password-reset", { email });
      Alert.alert("Success", "OTP sent to your email.");
      navigation.navigate("VerifyOtp", { email });
    } catch (err) {
      Alert.alert("Error", "Email not found.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        placeholder="Enter Email"
        placeholderTextColor="#888"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={sendOtp}>
        <Text style={styles.text}>Send OTP</Text>
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
  },
  button: {
    backgroundColor: "#FF6B00",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  text: { color: "#fff", fontSize: 18 },
});
