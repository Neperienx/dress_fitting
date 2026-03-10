import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { resolvePhotoUrl } from '../api/client';
import { uploadDressPhoto } from '../api/stores';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'StoreDetails'>;

export default function StoreDetailsScreen({ route }: Props) {
  const { store, ownerEmail } = route.params;
  const [currentStore, setCurrentStore] = useState(store);
  const [uploading, setUploading] = useState(false);

  const photos = useMemo(
    () => currentStore.dress_photo_urls || currentStore.dress_photos?.map((item) => item.photo_path) || [],
    [currentStore],
  );

  const onUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload dress images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: false, quality: 0.8 });
    if (result.canceled || !result.assets[0]) {
      return;
    }

    setUploading(true);
    try {
      const updated = await uploadDressPhoto({
        storeId: currentStore.id,
        ownerEmail,
        asset: result.assets[0],
      });
      setCurrentStore(updated);
    } catch (error) {
      Alert.alert('Upload failed', (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{currentStore.name}</Text>
      <Text style={styles.subtitle}>{currentStore.location}</Text>
      <Text style={styles.meta}>Invite code: {currentStore.invite_code || '-'}</Text>
      <Pressable style={styles.uploadButton} onPress={onUpload} disabled={uploading}>
        <Text style={styles.uploadText}>{uploading ? 'Uploading…' : 'Upload dress photo'}</Text>
      </Pressable>

      {photos.map((photoPath) => (
        <Image key={photoPath} source={{ uri: resolvePhotoUrl(photoPath) }} style={styles.image} resizeMode="cover" />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#4b5563', fontSize: 16 },
  meta: { color: '#6b7280', fontSize: 13 },
  uploadButton: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  uploadText: { color: '#fff', fontWeight: '600' },
  image: { width: '100%', height: 280, borderRadius: 12, backgroundColor: '#f3f4f6' },
});
