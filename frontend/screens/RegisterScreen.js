import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import api from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const role = "user";
  const [loading, setLoading] = useState(false);

  const validateEmail = (mail) => {
    return /\S+@\S+\.\S+/.test(mail);
  };

  const validatePassword = (pass) => {
    return pass.length >= 6;
  };

  const onRegister = async () => {
    if (!name || !email || !password || !phone) {
      return Alert.alert("Validation", "Please fill all fields.");
    }

    if (!validateEmail(email)) {
      return Alert.alert("Validation", "Enter a valid email address.");
    }

    if (!validatePassword(password)) {
      return Alert.alert("Validation", "Password must be at least 6 characters.");
    }

    if (phone.length < 10) {
      return Alert.alert("Validation", "Enter a valid phone number.");
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        phone,
      });

      Alert.alert(
        "Verify Email",
        "OTP has been sent to your email. Please verify."
      );

      navigation.navigate("VerifyEmailOtp", { email });
    } catch (e) {
      console.log("Registration Error:", e?.response?.data || e.message);

      const errMsg =
        e?.response?.data?.detail || "Registration failed. Try again.";

      Alert.alert("Error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <Text style={styles.title}>Create your TownDrop account</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#888"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, loading && { opacity: 0.7 }]}
          onPress={onRegister}
          disabled={loading}
        >
          <Text style={styles.registerText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.loginRedirect}
        >
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 24 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6B00",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: { marginBottom: 24 },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  registerText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  loginRedirect: { marginTop: 20, alignItems: "center" },
  loginText: { color: "#bbb", textDecorationLine: "underline" },
});
