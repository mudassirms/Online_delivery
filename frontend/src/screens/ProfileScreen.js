import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api'; // axios instance with interceptors

export default function ProfileScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (e) {
        console.log('Error fetching profile:', e.response?.status, e.response?.data);
        if (e.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No user data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.labelTitle}>Name</Text>
        <Text style={styles.labelValue}>{user.name}</Text>

        <Text style={[styles.labelTitle, { marginTop: 16 }]}>Email</Text>
        <Text style={styles.labelValue}>{user.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: { fontSize: 24, fontWeight: '700', color: '#FF6B00', textAlign: 'center', marginBottom: 24 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  labelTitle: { fontSize: 14, color: '#bbb', fontWeight: '500' },
  labelValue: { fontSize: 18, color: '#fff', fontWeight: '600', marginTop: 4 },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyText: { color: '#bbb', fontSize: 16 },
});
