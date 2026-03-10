db = db.getSiblingDB('quick-commerce');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('inventory');
db.createCollection('orders');
db.createCollection('stores');
db.createCollection('delivery_agents_performance'); // For tracking agent stats
db.createCollection('delivery_logs'); // For detailed delivery history

// Create indexes for better performance
db.orders.createIndex({ "deliveryPersonId": 1, "status": 1 });
db.orders.createIndex({ "status": 1, "deliveredAt": -1 });
db.orders.createIndex({ "assignedTo": 1, "status": 1 });
db.delivery_logs.createIndex({ "agentId": 1, "date": -1 });
db.delivery_agents_performance.createIndex({ "agentId": 1, "date": -1 });

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

// Sample Inventory - Updated for Dark Store Management
db.inventory.insertMany([
  {
    sku: 'SKU001',
    name: 'Fresh Apples',
    category: 'Fruits & Vegetables',
    price: 120,
    stock: 45,
    reorderLevel: 20,
    maxStock: 100,
    totalSold: 156,
    image: '/product-images/fresh-apples.jpg',
    description: 'Fresh, crispy red apples',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU002',
    name: 'Organic Bananas',
    category: 'Fruits & Vegetables',
    price: 60,
    stock: 12,
    reorderLevel: 25,
    maxStock: 80,
    totalSold: 234,
    image: '/product-images/bananas.jpg',
    description: 'Organic, ripe bananas',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU003',
    name: 'Fresh Milk',
    category: 'Dairy & Breakfast',
    price: 60,
    stock: 0,
    reorderLevel: 30,
    maxStock: 120,
    totalSold: 512,
    image: '/product-images/milk.jpg',
    description: 'Fresh full cream milk - 1L',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU004',
    name: 'Whole Wheat Bread',
    category: 'Dairy & Breakfast',
    price: 40,
    stock: 78,
    reorderLevel: 15,
    maxStock: 150,
    totalSold: 389,
    image: '/product-images/bread.jpg',
    description: 'Freshly baked whole wheat bread',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU005',
    name: 'Potato Chips',
    category: 'Snacks & Beverages',
    price: 30,
    stock: 156,
    reorderLevel: 50,
    maxStock: 300,
    totalSold: 678,
    image: '/product-images/chips.jpg',
    description: 'Crispy salted potato chips',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU006',
    name: 'Orange Juice',
    category: 'Snacks & Beverages',
    price: 80,
    stock: 5,
    reorderLevel: 20,
    maxStock: 100,
    totalSold: 445,
    image: '/product-images/orange-juice.jpg',
    description: 'Fresh squeezed orange juice - 1L',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU007',
    name: 'Detergent Powder',
    category: 'Household',
    price: 150,
    stock: 92,
    reorderLevel: 10,
    maxStock: 200,
    totalSold: 234,
    image: '/product-images/detergent.jpg',
    description: 'Premium detergent powder - 1kg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU008',
    name: 'Tomato Sauce',
    category: 'Pantry',
    price: 45,
    stock: 0,
    reorderLevel: 15,
    maxStock: 80,
    totalSold: 567,
    image: '/product-images/tomato-sauce.jpg',
    description: 'Tomato ketchup - 500g',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create index for inventory SKU
db.inventory.createIndex({ "sku": 1 }, { unique: true });

// Sample Users - REMOVED FOR FRESH START
// Users will be created via registration endpoints

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 }, { unique: true });
db.products.createIndex({ "name": 1 });
db.products.createIndex({ "categoryId": 1 });
db.inventory.createIndex({ "productId": 1, "storeId": 1 }, { unique: true });
db.stores.createIndex({ "address.location": "2dsphere" });

print('Database initialization completed successfully!');