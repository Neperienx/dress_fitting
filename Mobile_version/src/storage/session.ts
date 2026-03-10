import AsyncStorage from '@react-native-async-storage/async-storage';

import { OWNER_EMAIL_KEY, SESSION_USER_KEY } from '../config';

export async function getStoredOwnerEmail(): Promise<string> {
  return (await AsyncStorage.getItem(OWNER_EMAIL_KEY))?.trim().toLowerCase() ?? '';
}

export async function setStoredOwnerEmail(value: string): Promise<void> {
  await AsyncStorage.setItem(OWNER_EMAIL_KEY, value.trim().toLowerCase());
  await AsyncStorage.setItem(SESSION_USER_KEY, value.trim().toLowerCase());
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([OWNER_EMAIL_KEY, SESSION_USER_KEY]);
}
