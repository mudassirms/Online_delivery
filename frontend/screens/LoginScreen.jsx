import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { userToken, login } = useContext(AuthContext);

  useEffect(() => {
    if (userToken) navigation.replace("MainTabs");
  }, [userToken]);

  // STEP 1: Continue → email login OR phone OTP
  const onContinue = async () => {
    if (!identifier) {
      return Alert.alert("Validation", "Enter email or phone number.");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { identifier });

      // PHONE LOGIN ROUTE
      if (res.data.next === "phone-otp") {
        return navigation.navigate("PhoneOtp", { phone: res.data.phone });
      }

      // EMAIL LOGIN ROUTE
      if (res.data.next === "email-login") {
        Alert.alert("Continue", "Enter your password to login.");
      }
    } catch (error) {
      Alert.alert("Error", "Invalid email or phone number.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Login using password (email only)
  const onPasswordLogin = async () => {
    if (!identifier || !password) {
      return Alert.alert("Validation", "Enter email and password.");
    }

    setLoading(true);
    try {
      const response = await api.post(
        "/auth/token",
        `username=${identifier}&password=${password}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      await login(response.data.access_token, response.data.user);
    } catch (e) {
      Alert.alert("Login failed", "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>TownDrop</Text>

      {/* Identifier (Email or Phone) */}
      <TextInput
        placeholder="Email or Phone"
        placeholderTextColor="#888"
        value={identifier}
        onChangeText={setIdentifier}
        style={styles.input}
        autoCapitalize="none"
      />

      {/* Password only used for email login */}
      <TextInput
        placeholder="Password (for email login)"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.loginButton, loading && { opacity: 0.7 }]}
        onPress={password ? onPasswordLogin : onContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>
            {password ? "Login" : "Continue"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        style={styles.registerContainer}
      >
        <Text style={styles.registerText}>New here? Create an account</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF6B00",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  forgotText: {
    color: "#FF6B00",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  registerContainer: { marginTop: 20, alignItems: "center" },
  registerText: { color: "#bbb", textDecorationLine: "underline" },
});
