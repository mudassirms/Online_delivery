import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { login as apiLogin } from '../services/auth';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('username');
  const [password, setPassword] = useState('password');
  const { token, login } = useContext(AuthContext);

  // ✅ Redirect automatically if already logged in
  useEffect(() => {
    if (token) {
      navigation.replace('MainTabs');
    }
  }, [token]);

  const onLogin = async () => {
    try {
      const res = await apiLogin(name, password);
      // Save token in AuthContext, will trigger useEffect redirect
      login(res.access_token);
    } catch (e) {
      Alert.alert('Login failed', 'Check your credentials or register first.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TownDrop</Text>
      <TextInput
        placeholder="Full name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Login" onPress={onLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16 }}>
        <Text>New here? Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 }
});
