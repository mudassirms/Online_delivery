import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { login } from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('demo@user.com');
  const [password, setPassword] = useState('password');

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      if (t) navigation.replace('Home');
    })();
  }, []);

  const onLogin = async () => {
    try {
      await login(email, password);
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Login failed', 'Check your credentials or register first.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TownDrop</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
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
