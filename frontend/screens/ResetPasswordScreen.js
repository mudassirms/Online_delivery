import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import api from "../services/api";

export default function ResetPasswordScreen({ navigation, route }) {
  const { email } = route.params;
  const [password, setPassword] = useState("");

  const resetPassword = async () => {
    if (!password) return Alert.alert("Enter new password");

    try {
      await api.post("/auth/reset-password", { email, password });
      Alert.alert("Success", "Password updated.");
      navigation.replace("Login");
    } catch (e) {
      Alert.alert("Error", "Failed to reset password.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Password</Text>

      <TextInput
        placeholder="Enter new password"
        placeholderTextColor="#888"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={resetPassword}>
        <Text style={styles.text}>Update Password</Text>
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
