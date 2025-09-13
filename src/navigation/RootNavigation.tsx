import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AccessibilityScanner from '../screens/AccessibilityScannerScreen/AccessibilityScanner';
import {NavigationContainer} from '@react-navigation/native';
import ResultsScreen from '../screens/ResultsScreen/ResultsScreen';
import HistoryScreen from '../screens/HistoryScreen/HistoryScreen';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();
const RootNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Scanner"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563EB',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Scanner"
          component={AccessibilityScanner}
          options={{title: 'AccessibilityLens'}}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{title: 'Analysis Results'}}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{title: 'Scan History'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;

const styles = StyleSheet.create({});
