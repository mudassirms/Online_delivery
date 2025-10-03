import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { register } from '../services/auth';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('demo@user.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('Demo User');

  const onRegister = async () => {
    try {
      await register(email, password, name);
      Alert.alert('Success', 'Account created. You can log in now.');
      navigation.replace('Login');
    } catch (e) {
      Alert.alert('Error', 'Registration failed.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your TownDrop account</Text>
      <TextInput placeholder="Full name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Register" onPress={onRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 }
});
