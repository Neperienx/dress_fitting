import { ImagePickerAsset } from 'expo-image-picker';

import { requestJson } from './client';
import { SessionCard, Store } from '../types';

export async function fetchStoresForOwner(ownerEmail: string): Promise<Store[]> {
  const payload = await requestJson<{ stores: Store[] }>(`/api/stores?owner=${encodeURIComponent(ownerEmail)}`);
  return Array.isArray(payload.stores) ? payload.stores : [];
}

export async function createStore(input: { name: string; location: string; owner_email: string }): Promise<Store> {
  return requestJson<Store>('/api/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function uploadDressPhoto(params: {
  storeId: number;
  ownerEmail: string;
  asset: ImagePickerAsset;
  dressProfileId?: number;
}): Promise<Store> {
  const body = new FormData();
  body.append('owner_email', params.ownerEmail);
  if (params.dressProfileId) {
    body.append('dress_profile_id', String(params.dressProfileId));
  }

  const ext = params.asset.fileName?.split('.').pop() || 'jpg';
  const filename = params.asset.fileName || `mobile-upload.${ext}`;
  const mime = params.asset.mimeType || `image/${ext}`;

  body.append('dress_photo', {
    uri: params.asset.uri,
    name: filename,
    type: mime,
  } as never);

  return requestJson<Store>(`/api/stores/${params.storeId}/dress-photo`, {
    method: 'POST',
    body,
  });
}

export async function fetchDefaultSessionDeck(): Promise<SessionCard[]> {
  const photosPayload = await requestJson<{ photos: string[] }>('/api/default-dress-photos');
  const metadataPayload = await requestJson<{ photos: { photo_path: string; tags: string[] }[] }>('/api/default-dress-metadata');

  const tagsByPhoto = new Map((metadataPayload.photos || []).map((row) => [row.photo_path, row.tags || []]));

  return (photosPayload.photos || []).map((photoPath) => ({
    photoPath,
    fileName: photoPath.split('/').pop() || photoPath,
    tags: tagsByPhoto.get(photoPath) || [],
    category: 'Bridal Style',
  }));
}
