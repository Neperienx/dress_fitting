import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import LoginScreen from '../screens/LoginScreen';
import SessionScreen from '../screens/SessionScreen';
import StoreDetailsScreen from '../screens/StoreDetailsScreen';
import StoresScreen from '../screens/StoresScreen';
import { getStoredOwnerEmail } from '../storage/session';
import { Store } from '../types';

export type RootStackParamList = {
  Login: undefined;
  Stores: { ownerEmail: string };
  StoreDetails: { ownerEmail: string; store: Store };
  Session: { ownerEmail: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
        <Stack.Screen name="Stores" component={StoresScreen} options={{ title: 'Stores' }} initialParams={{ ownerEmail }} />
        <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} options={{ title: 'Store details' }} />
        <Stack.Screen name="Session" component={SessionScreen} options={{ title: 'Session' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
