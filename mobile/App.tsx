import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// State Management
import { useAuthStore } from './src/stores/authStore';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import SearchScreen from './src/screens/main/SearchScreen';
import ProductDetailScreen from './src/screens/main/ProductDetailScreen';
import CartScreen from './src/screens/main/CartScreen';
import CheckoutScreen from './src/screens/main/CheckoutScreen';
import OrdersScreen from './src/screens/main/OrdersScreen';
import ChatScreen from './src/screens/main/ChatScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import OpenStoreScreen from './src/screens/seller/OpenStoreScreen';
import AddProductScreen from './src/screens/seller/AddProductScreen';
import MyStoreScreen from './src/screens/seller/MyStoreScreen';

import { colors } from './src/constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Temporary mock screens for incomplete routes
function WishlistScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyEmoji}>❤️</Text>
      <Text style={styles.title}>Wishlist</Text>
      <Text style={styles.subtitle}>Fitur ini akan segera hadir!</Text>
    </View>
  );
}

function ChatListScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyEmoji}>💬</Text>
      <Text style={styles.title}>Daftar Percakapan</Text>
      <Text style={styles.subtitle}>Fitur ini akan segera hadir!</Text>
    </View>
  );
}

// Modern Tab Icon Component
function TabIcon({ name, focused, emoji }: { name: string; focused: boolean; emoji: string }) {
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
          shadowColor: '#7C3AED',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 22 }}>{focused ? '🏠' : '🏠'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Cari',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 22 }}>{focused ? '🔍' : '🔍'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Keranjang',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 22 }}>🛒</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Pesanan',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 22 }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 22 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { isInitialized, initialize, user } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashIcon}>
          <Text style={styles.splashEmoji}>👗</Text>
        </View>
        <Text style={styles.splashTitle}>PreLove</Text>
        <Text style={styles.splashSub}>Marketplace Preloved Terpercaya</Text>
        <View style={styles.splashDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated Flows
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />

            {/* Seller Screens */}
            <Stack.Screen name="OpenStore" component={OpenStoreScreen} />
            <Stack.Screen name="MyStore" component={MyStoreScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />

            {/* Mocked/Pending Screen Stubs */}
            <Stack.Screen name="Wishlist" component={WishlistScreen} />
            <Stack.Screen name="ChatList" component={ChatListScreen} />
          </>
        ) : (
          // Auth Flows
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  splashIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  splashEmoji: { fontSize: 52 },
  splashTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  splashSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 40,
  },
  splashDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  emptyEmoji: { fontSize: 64, marginBottom: 12 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
  },
  tabIconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  tabIconWrapActive: {
    backgroundColor: colors.primarySurface,
  },
  tabEmoji: { fontSize: 20, opacity: 0.6 },
  tabEmojiActive: { opacity: 1 },
});
