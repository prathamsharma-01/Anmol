// Script to create sample delivery personnel for testing
// Run this script to add delivery personnel to your database

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'quick-commerce';

const sampleDeliveryPersonnel = [
  {
    name: 'Raj Kumar',
    phone: '9876543210',
    email: 'raj.delivery@quikry.com',
    password: '123456', // In production, hash this
    vehicleType: 'bike',
    licenseNumber: 'KA01AB1234',
    aadharNumber: '1234-5678-9012',
    isActive: true,
    isOnline: false,
    rating: 4.8,
    totalDeliveries: 150,
    currentLocation: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null
  },
  {
    name: 'Priya Sharma',
    phone: '8765432109',
    email: 'priya.delivery@quikry.com',
    password: 'pass123',
    vehicleType: 'scooter',
    licenseNumber: 'KA02CD5678',
    aadharNumber: '2345-6789-0123',
    isActive: true,
    isOnline: false,
    rating: 4.9,
    totalDeliveries: 200,
    currentLocation: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null
  },
  {
    name: 'Mohammed Ali',
    phone: '7654321098',
    email: 'ali.delivery@quikry.com',
    password: 'delivery123',
    vehicleType: 'bike',
    licenseNumber: 'KA03EF9012',
    aadharNumber: '3456-7890-1234',
    isActive: true,
    isOnline: false,
    rating: 4.7,
    totalDeliveries: 120,
    currentLocation: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null
  }
];

async function createSampleDeliveryPersonnel() {
  let client;
  
  try {
    client = await MongoClient.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Check if delivery personnel already exist
    const existingCount = await db.collection('delivery_personnel').countDocuments();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing delivery personnel in database`);
      console.log('Skipping sample data creation to avoid duplicates');
      
      // Show existing delivery personnel
      const existing = await db.collection('delivery_personnel').find({}, { projection: { name: 1, phone: 1, password: 1 } }).toArray();
      console.log('\nExisting Delivery Personnel:');
      existing.forEach((person, index) => {
        console.log(`${index + 1}. Name: ${person.name}, Phone: ${person.phone}, Password: ${person.password || 'Not shown'}`);
      });
      return;
    }
    
    // Insert sample delivery personnel
    const result = await db.collection('delivery_personnel').insertMany(sampleDeliveryPersonnel);
    
    console.log(`✅ Successfully created ${result.insertedCount} delivery personnel`);
    console.log('\nSample Login Credentials:');
    console.log('=======================');
    sampleDeliveryPersonnel.forEach((person, index) => {
      console.log(`${index + 1}. Name: ${person.name}`);
      console.log(`   Phone: ${person.phone}`);
      console.log(`   Password: ${person.password}`);
      console.log(`   Vehicle: ${person.vehicleType}`);
      console.log('   ---');
    });
    
    console.log('\n🚀 You can now use these credentials to test the delivery app login!');
    
  } catch (error) {
    console.error('❌ Error creating sample delivery personnel:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the script
createSampleDeliveryPersonnel();