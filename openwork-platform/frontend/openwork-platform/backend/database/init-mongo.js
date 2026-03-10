db = db.getSiblingDB('quick-commerce');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('inventory');
db.createCollection('orders');
db.createCollection('stores');

// Sample Categories
db.categories.insertMany([
  {
    _id: ObjectId(),
    name: 'Fruits & Vegetables',
    imageUrl: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Dairy & Breakfast',
    imageUrl: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Snacks & Beverages',
    imageUrl: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Household',
    imageUrl: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date()
  }
]);

// Sample Products
const fruitCategory = db.categories.findOne({ name: 'Fruits & Vegetables' });
const dairyCategory = db.categories.findOne({ name: 'Dairy & Breakfast' });
const snacksCategory = db.categories.findOne({ name: 'Snacks & Beverages' });

db.products.insertMany([
  {
    _id: ObjectId(),
    name: 'Fresh Apples',
    description: 'Fresh and juicy apples',
    price: 120,
    unit: '1 kg',
    categoryId: fruitCategory._id,
    imageUrl: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Organic Bananas',
    description: 'Organic and sweet bananas',
    price: 60,
    unit: '1 dozen',
    categoryId: fruitCategory._id,
    imageUrl: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Milk',
    description: 'Fresh cow milk',
    price: 60,
    unit: '1 liter',
    categoryId: dairyCategory._id,
    imageUrl: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Bread',
    description: 'Whole wheat bread',
    price: 40,
    unit: '400g',
    categoryId: dairyCategory._id,
    imageUrl: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Potato Chips',
    description: 'Crispy potato chips',
    price: 30,
    unit: '100g',
    categoryId: snacksCategory._id,
    imageUrl: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date()
  }
]);

// Sample Stores
db.stores.insertMany([
  {
    _id: ObjectId(),
    name: 'Quick Commerce Store - South Delhi',
    address: {
      street: '123 Main Street',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Longitude, Latitude
      }
    },
    contactPhone: '+911234567890',
    contactEmail: 'southdelhi@quickcommerce.com',
    operatingHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '09:00', close: '23:00' }
    },
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Quick Commerce Store - North Delhi',
    address: {
      street: '456 North Avenue',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110007',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.1855, 28.7041] // Longitude, Latitude
      }
    },
    contactPhone: '+911234567891',
    contactEmail: 'northdelhi@quickcommerce.com',
    operatingHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '09:00', close: '23:00' }
    },
    isActive: true,
    createdAt: new Date()
  }
]);

// Sample Inventory
const products = db.products.find().toArray();
const stores = db.stores.find().toArray();

products.forEach(product => {
  stores.forEach(store => {
    db.inventory.insertOne({
      _id: ObjectId(),
      productId: product._id,
      storeId: store._id,
      quantity: Math.floor(Math.random() * 100) + 20, // Random quantity between 20-120
      lowStockThreshold: 10,
      updatedAt: new Date(),
      createdAt: new Date()
    });
  });
});

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 }, { unique: true });
db.products.createIndex({ "name": 1 });
db.products.createIndex({ "categoryId": 1 });
db.inventory.createIndex({ "productId": 1, "storeId": 1 }, { unique: true });
db.stores.createIndex({ "address.location": "2dsphere" });

print('Database initialization completed successfully!');