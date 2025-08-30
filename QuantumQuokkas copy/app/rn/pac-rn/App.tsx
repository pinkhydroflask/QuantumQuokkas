import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Home from './src/screens/Home';
import TextCapsule from './src/screens/TextCapsule';
import ImageCapsule from './src/screens/ImageCapsule';
import Audit from './src/screens/Audit';
import Settings from './src/screens/Settings';

export type RootStackParamList = {
  Home: undefined;
  TextCapsule: undefined;
  ImageCapsule: undefined;
  Audit: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={Home} 
            options={{ title: 'PAC - Privacy Capsule' }}
          />
          <Stack.Screen 
            name="TextCapsule" 
            component={TextCapsule} 
            options={{ title: 'Text Capsule' }}
          />
          <Stack.Screen 
            name="ImageCapsule" 
            component={ImageCapsule} 
            options={{ title: 'Image Capsule' }}
          />
          <Stack.Screen 
            name="Audit" 
            component={Audit} 
            options={{ title: 'Audit & Receipts' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={Settings} 
            options={{ title: 'Settings' }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
