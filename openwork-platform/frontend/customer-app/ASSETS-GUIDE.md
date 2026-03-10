# Assets Management Guide

## Overview
Sab images aur icons centralized location se import hote hain using `src/assets/index.js`.

## Folder Structure

```
src/
├── index.js                 # Entry point (old, can be removed)
├── main.jsx                 # Vite entry point
└── assets/
    ├── images.js            # Central export file for all assets
    ├── icons/               # Category/UI icons (SVG files)
    │   ├── all.svg
    │   ├── home.svg
    │   ├── fresh.svg
    │   └── ...
    ├── category-images/     # Category card images
    │   ├── Fruits & Vegetables.jpeg
    │   ├── Dairy, Bread & Eggs.webp
    │   └── ...
    └── products/           # Product images (currently empty)
        └── (add product images here)
```

## How to Use Images

### Method 1: Import from centralized location (Recommended)

```jsx
// In your component
import { icons, categoryImages, placeholderImage } from '../assets/images.js';

// Use in JSX
<img src={icons.all} alt="All categories" />
<img src={categoryImages.fruits} alt="Fruits" />
```

### Method 2: Direct import (for specific needs)

```jsx
import appleIcon from '../assets/icons/apple.svg';
import fruitsImage from '../assets/category-images/Fruits & Vegetables.jpeg';

<img src={appleIcon} alt="Apple" />
```

## Adding New Images

### 1. Add Icon
```bash
# Place icon in src/assets/icons/
# Update src/assets/images.js:

import newIcon from './icons/new-icon.svg';

export const icons = {
  // ... existing icons
  newIcon: newIcon,
};
```

### 2. Add Category Image
```bash
# Place image in src/assets/category-images/
# Update src/assets/images.js:

import newCategory from './category-images/new-category.jpg';

export const categoryImages = {
  // ... existing categories
  newCategory: newCategory,
};
```

### 3. Add Product Image
```bash
# Place image in src/assets/products/
# Update src/assets/images.js:

import product1 from './products/product-1.jpg';

export const productImages = {
  product1: product1,
  // ... more products
};
```

## Benefits

1. ✅ **Centralized Management**: Sab assets ek jagah se manage
2. ✅ **Easy Refactoring**: Image path change karna easy
3. ✅ **Autocomplete Support**: IDE mein suggestions milenge
4. ✅ **Type Safety**: Easy to track which images exist
5. ✅ **Vite Optimization**: Automatic image optimization
6. ✅ **No Dead References**: Unused images easily identify

## Current Usage

### In App.jsx
```jsx
import { icons, categoryImages } from './assets/images.js';

// Icons in navigation
<img src={icons.all} alt="All" />
<img src={icons.home} alt="Home" />

// Category cards
<img src={categoryImages.fruits} alt="Fruits & Vegetables" />
<img src={categoryImages.dairy} alt="Dairy" />
```

### In Products.jsx
Currently product images use external URLs (Shopify CDN, Unsplash).
To use local images:

```jsx
import { productImages, placeholderImage } from '../assets/images.js';

const productData = [
  {
    id: 1,
    name: "Product Name",
    image: productImages.product1 || placeholderImage,
    // ... other fields
  }
];
```

## External vs Local Images

### Current Setup
- **Icons**: Local (assets folder) ✅
- **Category Images**: Local (assets folder) ✅
- **Product Images**: External URLs (Shopify, Unsplash)

### To Migrate Products to Local:
1. Download images to `src/assets/products/`
2. Update `src/assets/index.js` to export them
3. Update product data in `Products.jsx` to use imported images

## Image Formats Supported by Vite

- ✅ `.jpg`, `.jpeg`
- ✅ `.png`
- ✅ `.webp`
- ✅ `.svg`
- ✅ `.gif`
- ✅ `.avif`

## Tips

1. **Naming Convention**: Use kebab-case or camelCase
   ```
   ✅ product-image.jpg
   ✅ productImage.jpg
   ❌ Product Image.jpg (spaces not recommended)
   ```

2. **Optimize Images**: Compress before adding to project
3. **Use WebP**: Better compression than JPG/PNG
4. **SVG for Icons**: Scalable and small file size

## Placeholder Image

Default placeholder available:
```jsx
import { placeholderImage } from './assets/images.js';

<img src={placeholderImage} alt="Product" />
// Shows: https://via.placeholder.com/300x300?text=Product+Image
```
