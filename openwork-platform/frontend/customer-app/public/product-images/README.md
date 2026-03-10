# Product Images Folder

Place your product-specific images here. The images should match the filenames specified in the database.

## Current Products & Image Filenames:

1. **Fresh Apples** → `fresh-apples.jpg`
2. **Organic Bananas** → `bananas.jpg`
3. **Fresh Milk** → `milk.jpg`
4. **Whole Wheat Bread** → `bread.jpg`
5. **Potato Chips** → `chips.jpg`
6. **Orange Juice** → `orange-juice.jpg`
7. **Detergent Powder** → `detergent.jpg`
8. **Tomato Sauce** → `tomato-sauce.jpg`

## How to Add Product Images:

1. Save your product images in this folder
2. Use the filenames listed above (or update the database with new filenames)
3. Recommended image size: 500x500px or larger
4. Supported formats: JPG, PNG, WEBP

## Fallback Behavior:

- If a product image is not found, the app will display the category image
- If neither exists, a colored placeholder will be shown

## To Add a New Product:

1. Add the product to the database (`init-mongo.js`)
2. Include the `image` field with the path: `/product-images/your-image.jpg`
3. Place the actual image file in this folder
4. Restart the backend if you updated the database

Example product entry:
```javascript
{
  sku: 'SKU009',
  name: 'Product Name',
  category: 'Category Name',
  price: 100,
  stock: 50,
  image: '/product-images/product-name.jpg',  // <- Add this line
  description: 'Product description',
  // ... other fields
}
```
