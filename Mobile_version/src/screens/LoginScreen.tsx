import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { setStoredOwnerEmail } from '../storage/session';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');

  const onContinue = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid owner email.');
      return;
    }

    await setStoredOwnerEmail(normalized);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Stores', params: { ownerEmail: normalized } }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bridal Studio Mobile</Text>
      <Text style={styles.text}>Use your owner email to load stores from the existing backend.</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="owner@email.com"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <Pressable style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  text: { fontSize: 16, color: '#4b5563' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
