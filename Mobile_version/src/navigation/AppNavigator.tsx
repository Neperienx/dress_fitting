import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import LoginScreen from '../screens/LoginScreen';
import SessionScreen from '../screens/SessionScreen';
import StoreDetailsScreen from '../screens/StoreDetailsScreen';
import StoresScreen from '../screens/StoresScreen';
import { clearSession, getStoredOwnerEmail } from '../storage/session';
import { Store } from '../types';

export type RootStackParamList = {
  Login: undefined;
  Stores: { ownerEmail: string };
  StoreDetails: { ownerEmail: string; store: Store };
  Session: { ownerEmail: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function AppNavigator() {
  const [booting, setBooting] = useState(true);
  const [ownerEmail, setOwnerEmail] = useState('');

  useEffect(() => {
    (async () => {
      const stored = await getStoredOwnerEmail();
      setOwnerEmail(stored);
      setBooting(false);
    })();
  }, []);

  const initialRoute = useMemo(() => (ownerEmail ? 'Stores' : 'Login'), [ownerEmail]);

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const onLogout = async () => {
    await clearSession();
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const renderUserMenu = (email?: string) => {
    if (!email) {
      return null;
    }

    return (
      <Pressable
        onPress={() => {
          Alert.alert(email, '', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: () => {
                void onLogout();
              },
            },
          ]);
        }}
      >
        <Text style={styles.userEmail}>{email}</Text>
      </Pressable>
    );
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
        <Stack.Screen
          name="Stores"
          component={StoresScreen}
          options={({ route }) => ({ title: 'Stores', headerRight: () => renderUserMenu(route.params?.ownerEmail) })}
          initialParams={{ ownerEmail }}
        />
        <Stack.Screen
          name="StoreDetails"
          component={StoreDetailsScreen}
          options={({ route }) => ({
            title: 'Store details',
            headerRight: () => renderUserMenu(route.params?.ownerEmail),
          })}
        />
        <Stack.Screen
          name="Session"
          component={SessionScreen}
          options={({ route }) => ({ title: 'Session', headerRight: () => renderUserMenu(route.params?.ownerEmail) })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  userEmail: {
    color: '#2563eb',
    fontWeight: '600',
    maxWidth: 150,
  },
});
