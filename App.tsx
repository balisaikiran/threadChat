/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import LoginScreen from './src/screens/LoginScreen';
import GroupListScreen from './src/screens/GroupListScreen';
import ChatScreen from './src/screens/ChatScreen';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  // Handle user state changes
  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "GroupList" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="GroupList" component={GroupListScreen} />
        <Stack.Screen name="Chat" component={({ route }: { route: any }) => <ChatScreen route={route} />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
