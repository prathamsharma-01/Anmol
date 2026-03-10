// Update inventory with product images
use('openwork');

// Update each product with its specific image URL
db.inventory.updateOne(
  { sku: 'SKU001', name: 'Fresh Apples' },
  { 
    $set: { 
      image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500',
      description: 'Fresh, crispy red apples - 1kg',
      category: 'Fruits & Vegetables'
    }
  }
);

db.inventory.updateOne(
  { sku: 'SKU002', name: 'Organic Bananas' },
  { 
    $set: { 
      image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500',
      description: 'Organic, ripe bananas - 6 pieces',
      category: 'Fruits & Vegetables'
    }
  }
);

db.inventory.updateOne(
  { sku: 'SKU003', name: 'Fresh Milk' },
  { 
    $set: { 
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
      description: 'Fresh full cream milk - 1L',
      category: 'Dairy & Breakfast'
    }
  }
);

db.inventory.updateOne(
  { sku: 'SKU004', name: 'Whole Wheat Bread' },
  { 
    $set: { 
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
      description: 'Freshly baked whole wheat bread',
      category: 'Bakery'
    }
  }
);

db.inventory.updateOne(
  { sku: 'SKU005', name: 'Potato Chips' },
  { 
    $set: { 
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
      description: 'Crispy salted potato chips - 100g',
      category: 'Snacks & Beverages'
    }
  }
);

db.inventory.updateOne(
  { sku: 'SKU006', name: 'Orange Juice' },
  { 
    $set: { 
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
      description: 'Fresh squeezed orange juice - 1L',
      category: 'Beverages'
    }
  }
);

db.inventory.updateOne(
  { sku: 'SKU007', name: 'Detergent Powder' },
  { 
    $set: { 
      image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500',
      description: 'Premium detergent powder - 1kg',
      category: 'Household'
    }
  }
);

db.inventory.updateOne(
  { sku: 'SKU008', name: 'Tomato Sauce' },
  { 
    $set: { 
      image: 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=500',
      description: 'Tomato ketchup - 500g',
      category: 'Spreads & Sauces'
    }
  }
);

// Add more products with images
db.inventory.insertMany([
  {
    sku: 'SKU009',
    name: 'Dr. Oerker Funfoods Peanut Butter Creamy',
    category: 'Spreads & Sauces',
    price: 139,
    stock: 25,
    reorderLevel: 10,
    maxStock: 50,
    totalSold: 45,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500',
    description: 'Creamy peanut butter - 340g',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU010',
    name: 'Dr. Oerker Funfoods Peanut Butter Crunchy',
    category: 'Spreads & Sauces',
    price: 139,
    stock: 20,
    reorderLevel: 10,
    maxStock: 50,
    totalSold: 38,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500',
    description: 'Crunchy peanut butter - 340g',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU011',
    name: 'Dr. Oerker Funfoods Cheese Chilli Pizza Sauce',
    category: 'Spreads & Sauces',
    price: 99,
    stock: 15,
    reorderLevel: 8,
    maxStock: 40,
    totalSold: 62,
    image: 'https://images.unsplash.com/photo-1608877906149-79af8e8fa382?w=500',
    description: 'Spicy cheese & chilli pizza sauce',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU012',
    name: 'Pasta And Pizza Sauce',
    category: 'Spreads & Sauces',
    price: 99,
    stock: 18,
    reorderLevel: 8,
    maxStock: 40,
    totalSold: 55,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500',
    description: 'Italian pasta and pizza sauce',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU013',
    name: 'Dr. Oerker Funfoods Pasta And Pizza White Sauce',
    category: 'Spreads & Sauces',
    price: 99,
    stock: 12,
    reorderLevel: 8,
    maxStock: 40,
    totalSold: 48,
    image: 'https://images.unsplash.com/photo-1626711934535-9749ea30dba8?w=500',
    description: 'Creamy white sauce for pasta & pizza',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU014',
    name: 'Fresh Tomatoes',
    category: 'Fruits & Vegetables',
    price: 40,
    stock: 50,
    reorderLevel: 20,
    maxStock: 100,
    totalSold: 156,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500',
    description: 'Fresh ripe tomatoes - 1kg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU015',
    name: 'Fresh Onions',
    category: 'Fruits & Vegetables',
    price: 35,
    stock: 60,
    reorderLevel: 25,
    maxStock: 120,
    totalSold: 189,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500',
    description: 'Fresh onions - 1kg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    sku: 'SKU016',
    name: 'Greek Yogurt',
    category: 'Dairy & Breakfast',
    price: 80,
    stock: 30,
    reorderLevel: 15,
    maxStock: 60,
    totalSold: 92,
    image: 'https://images.unsplash.com/photo-1571212515416-26d30174fc5c?w=500',
    description: 'Thick Greek yogurt - 400g',
    createdAt: new Date(),
    updatedAt: new Date()
  }
], { ordered: false });

print('✅ Inventory updated successfully with product images!');
print('Total products:', db.inventory.countDocuments());
