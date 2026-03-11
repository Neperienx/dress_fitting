import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = '8000';

function extractHost(hostValue?: string | null): string {
  if (!hostValue) {
    return '';
  }

  const trimmed = hostValue.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).hostname;
    } catch {
      return '';
    }
  }

  return trimmed.split(':')[0];
}

function resolveDefaultApiBaseUrl(): string {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest2?.extra?.expoClient?.hostUri,
    Constants.manifest?.debuggerHost,
  ];

  const host = hostCandidates.map(extractHost).find(Boolean);
  if (host) {
    return `http://${host}:${API_PORT}`;
  }

  if (Platform.OS === 'android' && !Constants.isDevice) {
    // Android emulators map host-machine localhost to 10.0.2.2.
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? resolveDefaultApiBaseUrl();

export const SESSION_USER_KEY = 'bridalStudioCurrentUser';
export const OWNER_EMAIL_KEY = 'bridalStudioOwnerEmail';

export const DEFAULT_SESSION_CARD_COUNT = 10;
