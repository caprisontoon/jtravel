import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { colors } from '@/theme';
import { HomeScreen } from '@/screens/HomeScreen';
import { AnalysisLoadingScreen } from '@/screens/AnalysisLoadingScreen';
import { ItineraryScreen } from '@/screens/ItineraryScreen';
import { PlaceDetailScreen } from '@/screens/PlaceDetailScreen';
import { ReservationScreen } from '@/screens/ReservationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'JTravel' }} />
      <Stack.Screen
        name="AnalysisLoading"
        component={AnalysisLoadingScreen}
        options={{ title: '', headerShadowVisible: false }}
      />
      <Stack.Screen
        name="Itinerary"
        component={ItineraryScreen}
        options={{ title: '여행 일정' }}
      />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{ presentation: 'modal', title: '' }}
      />
      <Stack.Screen name="Reservation" component={ReservationScreen} options={{ title: '예약' }} />
    </Stack.Navigator>
  );
}
