import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, StatusBar } from 'react-native';
import { ActivityIndicator, Searchbar, Card, Title, Paragraph, Badge, Chip, Surface, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/catalog/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/catalog/categories');
      setCategories([{ id: 'all', name: 'All' }, ...response.data]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterProducts = () => {
    if (selectedCategory === 'all') return products;
    return products.filter(product => product.category === selectedCategory);
  };

  const renderCategoryItem = ({ item }) => (
    <Chip
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      textStyle={[
        styles.categoryText,
        selectedCategory === item.id && styles.selectedCategoryText,
      ]}
      onPress={() => setSelectedCategory(item.id)}
      mode={selectedCategory === item.id ? "flat" : "outlined"}
    >
      {item.name}
    </Chip>
  );

  const renderProductItem = ({ item }) => (
    <Card 
      style={styles.productCard}
      onPress={() => navigation.navigate('Product', { id: item._id, name: item.name })}
    >
      <Card.Cover 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <Card.Content style={styles.productInfo}>
        <Title style={styles.productName}>{item.name}</Title>
        <Paragraph style={styles.productPrice}>₹{item.price}</Paragraph>
        <View style={styles.productMeta}>
          <Chip style={styles.productUnit} textStyle={{fontSize: 12}}>{item.unit}</Chip>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#5C6BC0" barStyle="light-content" />
      
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Quick Commerce</Text>
            <Text style={styles.headerSubtitle}>Delivering to your doorstep</Text>
          </View>
          <Badge size={30} style={styles.cartBadge}>3</Badge>
        </View>
        
        <Searchbar
          placeholder="Search products..."
          style={styles.searchBar}
          iconColor="#5C6BC0"
          placeholderTextColor="#888"
        />
      </Surface>

      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
      />
      
      <Divider style={styles.divider} />

      <FlatList
        data={filterProducts()}
        renderItem={renderProductItem}
        keyExtractor={item => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 15,
    backgroundColor: '#5C6BC0',
    elevation: 4,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cartBadge: {
    backgroundColor: '#FF5722',
  },
  searchBar: {
    borderRadius: 10,
    elevation: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  categoryList: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  categoryItem: {
    marginHorizontal: 5,
    height: 36,
  },
  selectedCategory: {
    backgroundColor: '#5C6BC0',
  },
  categoryText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  productList: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 6,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  productImage: {
    height: 130,
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C6BC0',
    marginTop: 2,
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productUnit: {
    backgroundColor: '#f0f0f0',
    height: 26,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});

export default HomeScreen;