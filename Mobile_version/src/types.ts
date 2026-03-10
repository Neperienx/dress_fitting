export type DressPhoto = {
  photo_path: string;
  price?: number | null;
  tags?: string[];
  dress_profile_id?: number | null;
};

export type Store = {
  id: number;
  name: string;
  location: string;
  owner_email: string;
  invite_code?: string;
  created_at?: string;
  dress_photo_url?: string;
  dress_photo_urls?: string[];
  dress_photos?: DressPhoto[];
};

export type SessionCard = {
  photoPath: string;
  fileName: string;
  tags: string[];
  category: string;
};
