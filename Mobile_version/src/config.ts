import { Platform } from 'react-native';

const API_PORT = '8000';

function resolveDefaultApiBaseUrl(): string {
  if (Platform.OS === 'android') {
    // Android emulators map host-machine localhost to 10.0.2.2.
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? resolveDefaultApiBaseUrl();

export const SESSION_USER_KEY = 'bridalStudioCurrentUser';
export const OWNER_EMAIL_KEY = 'bridalStudioOwnerEmail';

export const DEFAULT_SESSION_CARD_COUNT = 10;
