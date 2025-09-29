// Database model types (generated from Prisma)
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  profileName: string | null;
  avatarUrl: string | null;
}

export interface Species {
  id: string;
  nameSwedish: string;
  nameLatin: string;
  nameEnglish: string;
  category: string;
  createdAt: Date;
}

export interface Catch {
  id: string;
  userId: string;
  speciesId: string;
  weight: number | null;
  length: number | null;
  latitude: number;
  longitude: number;
  locationName: string | null;
  caughtAt: Date;
  createdAt: Date;
  updatedAt: Date;
  notes: string | null;
  weatherId: string | null;
}

export interface WeatherData {
  id: string;
  temperature: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  weatherDesc: string;
  recordedAt: Date;
  createdAt: Date;
}

export interface Photo {
  id: string;
  catchId: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

export interface FavoriteLocation {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string | null;
  createdAt: Date;
}

// API request/response types
export interface CreateCatchRequest {
  speciesId: string;
  weight?: number;
  length?: number;
  latitude: number;
  longitude: number;
  locationName?: string;
  caughtAt: Date;
  notes?: string;
}

export interface CatchWithRelations extends Catch {
  species: Species;
  weather?: WeatherData;
  photos: Photo[];
}

// Utility types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CatchFilters {
  speciesIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  bounds?: MapBounds;
}

// Sync types for offline functionality
export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  tableName: string;
  data: any;
  createdAt: Date;
  synced: boolean;
}

export interface OfflineData {
  catches: Catch[];
  species: Species[];
  photos: Photo[];
  syncQueue: SyncQueueItem[];
}

// Configuration types
export interface AppConfig {
  mapbox: {
    accessToken: string;
  };
  weather: {
    apiKey: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
}