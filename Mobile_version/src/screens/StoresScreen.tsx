import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { createStore, fetchStoresForOwner } from '../api/stores';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Store } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Stores'>;

export default function StoresScreen({ navigation, route }: Props) {
  const ownerEmail = route.params.ownerEmail;
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchStoresForOwner(ownerEmail);
      setStores(rows);
    } catch (error) {
      Alert.alert('Unable to load stores', error instanceof Error ? error.message : 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [ownerEmail]);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async () => {
    if (!name.trim() || !location.trim()) {
      return;
    }
    try {
      await createStore({ name: name.trim(), location: location.trim(), owner_email: ownerEmail });
      setName('');
      setLocation('');
      await load();
    } catch (error) {
      Alert.alert('Unable to create store', error instanceof Error ? error.message : 'Please check your connection and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.sessionButton} onPress={() => navigation.navigate('Session', { ownerEmail })}>
        <Text style={styles.sessionButtonText}>Open default session</Text>
      </Pressable>

      <Text style={styles.header}>Create store</Text>
      <TextInput placeholder="Store name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Location" style={styles.input} value={location} onChangeText={setLocation} />
      <Pressable style={styles.createButton} onPress={onCreate}>
        <Text style={styles.createButtonText}>Create</Text>
      </Pressable>

      <FlatList
        data={stores}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('StoreDetails', { ownerEmail, store: item })}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>{item.location}</Text>
            <Text style={styles.cardMeta}>Invite: {item.invite_code || '-'}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No stores yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  header: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  createButton: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  createButtonText: { color: '#fff', fontWeight: '600' },
  sessionButton: { backgroundColor: '#111827', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  sessionButtonText: { color: '#fff', fontWeight: '600' },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, marginTop: 10 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardText: { color: '#4b5563', marginTop: 2 },
  cardMeta: { color: '#6b7280', marginTop: 6, fontSize: 12 },
  empty: { marginTop: 12, color: '#6b7280' },
});
