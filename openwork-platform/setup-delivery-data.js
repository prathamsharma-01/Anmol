const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = 'openwork_platform';

async function setupDeliveryData() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    
    console.log('🔗 Connected to MongoDB');
    
    // Sample delivery personnel data
    const deliveryPersonnel = [
      {
        name: "Rajesh Kumar",
        phone: "9876543210",
        password: "delivery123",
        vehicleType: "Bike",
        licenseNumber: "DL123456789",
        rating: 4.8,
        totalDeliveries: 156,
        isActive: true,
        isOnline: false,
        createdAt: new Date()
      },
      {
        name: "Priya Sharma",
        phone: "8765432109",
        password: "priya456",
        vehicleType: "Scooter",
        licenseNumber: "DL987654321",
        rating: 4.9,
        totalDeliveries: 203,
        isActive: true,
        isOnline: false,
        createdAt: new Date()
      },
      {
        name: "Amit Singh",
        phone: "7654321098",
        password: "amit789",
        vehicleType: "Car",
        licenseNumber: "DL456789123",
        rating: 4.7,
        totalDeliveries: 98,
        isActive: true,
        isOnline: false,
        createdAt: new Date()
      }
    ];

    // Sample orders data
    const orders = [
      {
        id: 101,
        customer: "Asha Reddy",
        customerPhone: "9123456789",
        address: "MG Road, Bengaluru, Karnataka 560001",
        lat: 12.9716,
        lng: 77.5946,
        items: [
          { name: "Pizza Margherita", quantity: 2, price: 299 },
          { name: "Coca Cola", quantity: 2, price: 60 }
        ],
        total: 658,
        status: "pending",
        assignedTo: null,
        orderTime: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        instructions: "Ring doorbell twice"
      },
      {
        id: 102,
        customer: "Ravi Patel",
        customerPhone: "8234567890",
        address: "Bandra West, Mumbai, Maharashtra 400050",
        lat: 19.0544,
        lng: 72.8408,
        items: [
          { name: "Chicken Biryani", quantity: 1, price: 249 },
          { name: "Raita", quantity: 1, price: 50 }
        ],
        total: 299,
        status: "pending",
        assignedTo: null,
        orderTime: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes from now
        instructions: "Call before delivery"
      },
      {
        id: 103,
        customer: "Sima Agarwal",
        customerPhone: "7345678901",
        address: "Connaught Place, New Delhi, Delhi 110001",
        lat: 28.6329,
        lng: 77.2195,
        items: [
          { name: "Masala Dosa", quantity: 3, price: 120 },
          { name: "Filter Coffee", quantity: 3, price: 45 }
        ],
        total: 495,
        status: "pending",
        assignedTo: null,
        orderTime: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
        instructions: "Office building - Floor 5"
      }
    ];

    // Insert delivery personnel
    const deliveryCollection = db.collection('delivery_personnel');
    
    // Check if data already exists
    const existingCount = await deliveryCollection.countDocuments();
    if (existingCount > 0) {
      console.log('⚠️  Delivery personnel data already exists. Clearing and re-inserting...');
      await deliveryCollection.deleteMany({});
    }
    
    const deliveryResult = await deliveryCollection.insertMany(deliveryPersonnel);
    console.log(`✅ Inserted ${deliveryResult.insertedCount} delivery personnel`);

    // Insert orders
    const ordersCollection = db.collection('orders');
    
    // Check if orders already exist
    const existingOrders = await ordersCollection.countDocuments();
    if (existingOrders > 0) {
      console.log('⚠️  Orders data already exists. Clearing pending orders and re-inserting...');
      await ordersCollection.deleteMany({ status: 'pending' });
    }
    
    const ordersResult = await ordersCollection.insertMany(orders);
    console.log(`✅ Inserted ${ordersResult.insertedCount} sample orders`);

    // Display login credentials
    console.log('\n🔐 TEST LOGIN CREDENTIALS:');
    console.log('═'.repeat(50));
    deliveryPersonnel.forEach((person, index) => {
      console.log(`${index + 1}. Name: ${person.name}`);
      console.log(`   Phone: ${person.phone}`);
      console.log(`   Password: ${person.password}`);
      console.log(`   Vehicle: ${person.vehicleType}`);
      console.log('');
    });

    console.log('📱 You can now test the delivery app with these credentials!');
    console.log('🌐 Make sure your backend server is running on http://localhost:8000');
    
  } catch (error) {
    console.error('❌ Error setting up delivery data:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupDeliveryData();
}

module.exports = { setupDeliveryData };