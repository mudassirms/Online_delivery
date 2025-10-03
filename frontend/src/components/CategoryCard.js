import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function CategoryCard({ category, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {!!category.image && <Image source={{ uri: category.image }} style={styles.image} />}
      <Text style={styles.name}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  image: { width: 64, height: 64, borderRadius: 8, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '600' }
});
