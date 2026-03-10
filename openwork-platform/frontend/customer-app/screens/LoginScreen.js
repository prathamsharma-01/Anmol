import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, ActivityIndicator, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter both phone number and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/users/login', {
        phone,
        password
      });

      // Store token
      await SecureStore.setItemAsync('userToken', response.data.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
      
      setIsLoading(false);
      navigation.replace('Main');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <LinearGradient
      colors={['#5C6BC0', '#3949AB', '#283593']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Surface style={styles.logoSurface}>
              <Ionicons name="cart" size={60} color="#5C6BC0" />
            </Surface>
            <Text style={styles.title}>Quick Commerce</Text>
            <Text style={styles.subtitle}>Get your daily needs delivered in minutes</Text>
          </View>

          <Surface style={styles.formSurface}>
            <View style={styles.formContainer}>
              <TextInput
                label="Phone Number"
                mode="outlined"
                left={<TextInput.Icon icon="phone" />}
                style={styles.input}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                theme={{ roundness: 10 }}
              />
              
              <TextInput
                label="Password"
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={secureTextEntry ? "eye" : "eye-off"} 
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  />
                }
                style={styles.input}
                secureTextEntry={secureTextEntry}
                value={password}
                onChangeText={setPassword}
                theme={{ roundness: 10 }}
              />
              
              <Button 
                mode="contained" 
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoSurface: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'white',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
    marginHorizontal: 20,
  },
  formSurface: {
    borderRadius: 15,
    padding: 20,
    elevation: 8,
    backgroundColor: 'white',
    marginTop: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#5C6BC0',
    fontWeight: 'bold',
  },
});

export default LoginScreen;