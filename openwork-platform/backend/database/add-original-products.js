// Add original products with images
use('openwork');

db.inventory.insertMany([
  {
    sku: 'SKU001',
    name: 'Fresh Apples',
    category: 'Fruits & Vegetables',
    price: 120,
    stock: 45,
    reorderLevel: 15,
    maxStock: 80,
    totalSold: 234,
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500',
    description: 'Fresh, crispy red apples - 1kg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU002',
    name: 'Organic Bananas',
    category: 'Fruits & Vegetables',
    price: 60,
    stock: 55,
    reorderLevel: 20,
    maxStock: 100,
    totalSold: 312,
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500',
    description: 'Organic, ripe bananas - 6 pieces',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU003',
    name: 'Fresh Milk',
    category: 'Dairy & Breakfast',
    price: 60,
    stock: 40,
    reorderLevel: 15,
    maxStock: 70,
    totalSold: 189,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
    description: 'Fresh full cream milk - 1L',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU004',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    price: 40,
    stock: 35,
    reorderLevel: 10,
    maxStock: 60,
    totalSold: 267,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    description: 'Freshly baked whole wheat bread',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU005',
    name: 'Potato Chips',
    category: 'Snacks & Beverages',
    price: 30,
    stock: 28,
    reorderLevel: 12,
    maxStock: 75,
    totalSold: 423,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
    description: 'Crispy salted potato chips - 100g',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU006',
    name: 'Orange Juice',
    category: 'Beverages',
    price: 80,
    stock: 32,
    reorderLevel: 10,
    maxStock: 50,
    totalSold: 178,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
    description: 'Fresh squeezed orange juice - 1L',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU007',
    name: 'Detergent Powder',
    category: 'Household',
    price: 150,
    stock: 22,
    reorderLevel: 8,
    maxStock: 40,
    totalSold: 145,
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500',
    description: 'Premium detergent powder - 1kg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU008',
    name: 'Tomato Sauce',
    category: 'Spreads & Sauces',
    price: 45,
    stock: 38,
    reorderLevel: 12,
    maxStock: 65,
    totalSold: 298,
    image: 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=500',
    description: 'Tomato ketchup - 500g',
    createdAt: new Date(),
    updatedAt: new Date()
  }
], { ordered: false });

print('✅ Original products added successfully!');
print('Total products now:', db.inventory.countDocuments());
