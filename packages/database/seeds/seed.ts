import { PrismaClient } from '@prisma/client';
import { generateSeedData } from './mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const seedData = generateSeedData();

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.photo.deleteMany();
  await prisma.catch.deleteMany();
  await prisma.favoriteLocation.deleteMany();
  await prisma.weatherData.deleteMany();
  await prisma.species.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  console.log('👤 Creating test user...');
  const user = await prisma.user.create({
    data: {
      email: seedData.user.email,
      profileName: seedData.user.profileName,
      avatarUrl: seedData.user.avatarUrl,
    },
  });
  console.log(`✅ Created user: ${user.email}`);

  // Create species
  console.log('🐟 Creating species...');
  const species = [];
  for (const speciesData of seedData.species) {
    const createdSpecies = await prisma.species.create({
      data: speciesData,
    });
    species.push(createdSpecies);
  }
  console.log(`✅ Created ${species.length} species`);

  // Create favorite locations
  console.log('📍 Creating favorite locations...');
  for (const locationData of seedData.favoriteLocations) {
    await prisma.favoriteLocation.create({
      data: {
        ...locationData,
        userId: user.id,
      },
    });
  }
  console.log(`✅ Created ${seedData.favoriteLocations.length} favorite locations`);

  // Create weather data
  console.log('🌤️  Creating weather data...');
  const weatherRecords = [];
  for (const weatherData of seedData.weatherData) {
    const weather = await prisma.weatherData.create({
      data: weatherData,
    });
    weatherRecords.push(weather);
  }
  console.log(`✅ Created ${weatherRecords.length} weather records`);

  // Create catches
  console.log('🎣 Creating catches...');
  let catchCount = 0;
  for (const catchData of seedData.catches) {
    // Map species names to actual IDs
    let speciesId = species[0].id; // Default to first species
    if (catchData.speciesId.includes('pike')) {
      speciesId = species.find(s => s.nameSwedish === 'Gädda')?.id || speciesId;
    } else if (catchData.speciesId.includes('perch')) {
      speciesId = species.find(s => s.nameSwedish === 'Abborre')?.id || speciesId;
    } else if (catchData.speciesId.includes('trout')) {
      speciesId = species.find(s => s.nameSwedish === 'Öring')?.id || speciesId;
    } else if (catchData.speciesId.includes('zander')) {
      speciesId = species.find(s => s.nameSwedish === 'Gös')?.id || speciesId;
    } else if (catchData.speciesId.includes('salmon')) {
      speciesId = species.find(s => s.nameSwedish === 'Lax')?.id || speciesId;
    }

    // Map weather IDs
    let weatherId = null;
    if (catchData.weatherId) {
      const weatherIndex = parseInt(catchData.weatherId.split('-')[1]) - 1;
      weatherId = weatherRecords[weatherIndex]?.id || null;
    }

    await prisma.catch.create({
      data: {
        userId: user.id,
        speciesId,
        weight: catchData.weight,
        length: catchData.length,
        latitude: catchData.latitude,
        longitude: catchData.longitude,
        locationName: catchData.locationName,
        caughtAt: catchData.caughtAt,
        notes: catchData.notes,
        weatherId,
      },
    });
    catchCount++;
  }
  console.log(`✅ Created ${catchCount} catches`);

  console.log('🎉 Database seeded successfully!');
  console.log(`
📊 Summary:
- 1 test user (${user.email})
- ${species.length} fish species
- ${seedData.favoriteLocations.length} favorite locations
- ${weatherRecords.length} weather records
- ${catchCount} fishing catches

🔐 Test credentials:
Email: ${user.email}
(Use Supabase auth for actual login)
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });