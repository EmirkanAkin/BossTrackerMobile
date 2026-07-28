import { Stack } from 'expo-router';
import { AppProvider, useAppContext } from '../lib/kulliyat/context';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';



function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-[#0B0A08]" edges={['left', 'right', 'bottom']}>
          <View className="flex-1 bg-[#0B0A08]">
            <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0A08' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="detail" />
          <Stack.Screen name="pairing" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="add-boss" options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
            </Stack>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}
