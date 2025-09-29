// Mock data for testing and development
import { Species, User, Catch, WeatherData, Photo, FavoriteLocation } from '../../shared/src/types';

export const mockSpecies: Omit<Species, 'id' | 'createdAt'>[] = [
  {
    nameSwedish: "Gädda",
    nameLatin: "Esox lucius",
    nameEnglish: "Northern Pike",
    category: "freshwater"
  },
  {
    nameSwedish: "Abborre",
    nameLatin: "Perca fluviatilis",
    nameEnglish: "European Perch",
    category: "freshwater"
  },
  {
    nameSwedish: "Gös",
    nameLatin: "Sander lucioperca",
    nameEnglish: "Zander",
    category: "freshwater"
  },
  {
    nameSwedish: "Öring",
    nameLatin: "Salmo trutta",
    nameEnglish: "Brown Trout",
    category: "freshwater"
  },
  {
    nameSwedish: "Lax",
    nameLatin: "Salmo salar",
    nameEnglish: "Atlantic Salmon",
    category: "freshwater"
  },
  {
    nameSwedish: "Torsk",
    nameLatin: "Gadus morhua",
    nameEnglish: "Atlantic Cod",
    category: "saltwater"
  },
  {
    nameSwedish: "Makrill",
    nameLatin: "Scomber scombrus",
    nameEnglish: "Atlantic Mackerel",
    category: "saltwater"
  },
  {
    nameSwedish: "Sill",
    nameLatin: "Clupea harengus",
    nameEnglish: "Atlantic Herring",
    category: "saltwater"
  },
  {
    nameSwedish: "Regnbågslax",
    nameLatin: "Oncorhynchus mykiss",
    nameEnglish: "Rainbow Trout",
    category: "freshwater"
  },
  {
    nameSwedish: "Karp",
    nameLatin: "Cyprinus carpio",
    nameEnglish: "Common Carp",
    category: "freshwater"
  }
];

export const mockUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
  email: "test@fishlog.se",
  profileName: "Test Fiskare",
  avatarUrl: null
};

// Swedish fishing locations
export const mockFavoriteLocations: Omit<FavoriteLocation, 'id' | 'userId' | 'createdAt'>[] = [
  {
    name: "Vänern - Kållandsö",
    latitude: 58.5923,
    longitude: 13.0813,
    description: "Bra gös- och gäddvatten vid Kållandsö"
  },
  {
    name: "Vättern - Visingsö",
    latitude: 57.9833,
    longitude: 14.3833,
    description: "Öringfiske runt Visingsö"
  },
  {
    name: "Stockholms skärgård - Sandhamn",
    latitude: 59.2917,
    longitude: 18.9167,
    description: "Havsfiske efter torsk och abborre"
  },
  {
    name: "Mörrum - Laxfiske",
    latitude: 56.1667,
    longitude: 14.75,
    description: "Världsberömt laxfiske i Mörrumsån"
  },
  {
    name: "Siljan - Rättvik",
    latitude: 60.8833,
    longitude: 15.1167,
    description: "Öring och gös i Siljan"
  }
];

export const mockWeatherData: Omit<WeatherData, 'id' | 'createdAt'>[] = [
  {
    temperature: 15.5,
    pressure: 1013.2,
    windSpeed: 3.2,
    windDirection: 180,
    humidity: 65,
    weatherDesc: "Partly cloudy",
    recordedAt: new Date('2024-03-15T08:30:00Z')
  },
  {
    temperature: 12.1,
    pressure: 1018.7,
    windSpeed: 5.1,
    windDirection: 225,
    humidity: 72,
    weatherDesc: "Overcast",
    recordedAt: new Date('2024-03-20T14:15:00Z')
  },
  {
    temperature: 18.3,
    pressure: 1005.9,
    windSpeed: 2.8,
    windDirection: 90,
    humidity: 58,
    weatherDesc: "Clear sky",
    recordedAt: new Date('2024-04-02T06:45:00Z')
  },
  {
    temperature: 8.7,
    pressure: 1021.4,
    windSpeed: 4.3,
    windDirection: 315,
    humidity: 78,
    weatherDesc: "Light rain",
    recordedAt: new Date('2024-04-10T16:20:00Z')
  }
];

export const mockCatches: Omit<Catch, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    speciesId: "pike-1", // Will be replaced with actual IDs
    weight: 4.2,
    length: 68.5,
    latitude: 58.5923,
    longitude: 13.0813,
    locationName: "Vänern - Kållandsö",
    caughtAt: new Date('2024-03-15T08:30:00Z'),
    notes: "Fantastisk gädda på wobbler vid gräsbänk. Starka ryck!",
    weatherId: "weather-1"
  },
  {
    speciesId: "perch-1",
    weight: 0.8,
    length: 25.3,
    latitude: 59.2917,
    longitude: 18.9167,
    locationName: "Stockholms skärgård - Sandhamn",
    caughtAt: new Date('2024-03-20T14:15:00Z'),
    notes: "Fin abborre på jig vid stengrund",
    weatherId: "weather-2"
  },
  {
    speciesId: "trout-1",
    weight: 1.6,
    length: 42.1,
    latitude: 57.9833,
    longitude: 14.3833,
    locationName: "Vättern - Visingsö",
    caughtAt: new Date('2024-04-02T06:45:00Z'),
    notes: "Vacker öring på spinnare i gryningen",
    weatherId: "weather-3"
  },
  {
    speciesId: "zander-1",
    weight: 2.8,
    length: 55.7,
    latitude: 58.5923,
    longitude: 13.0813,
    locationName: "Vänern - Kållandsö",
    caughtAt: new Date('2024-04-10T16:20:00Z'),
    notes: "Gös på jigg vid 8 meters djup",
    weatherId: "weather-4"
  },
  {
    speciesId: "salmon-1",
    weight: 6.5,
    length: 78.2,
    latitude: 56.1667,
    longitude: 14.75,
    locationName: "Mörrum - Laxfiske",
    caughtAt: new Date('2024-04-15T05:20:00Z'),
    notes: "Stor lax på flugfiske! Kamp på 15 minuter.",
    weatherId: null
  },
  {
    speciesId: "pike-2",
    weight: 2.1,
    length: 52.3,
    latitude: 60.8833,
    longitude: 15.1167,
    locationName: "Siljan - Rättvik",
    caughtAt: new Date('2024-05-01T11:30:00Z'),
    notes: "Mindre gädda men fin fisk på spoon",
    weatherId: null
  }
];

// Helper function to generate seed data with proper IDs
export function generateSeedData() {
  return {
    species: mockSpecies,
    user: mockUser,
    favoriteLocations: mockFavoriteLocations,
    weatherData: mockWeatherData,
    catches: mockCatches
  };
}