import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Platform, View } from "react-native";

export default function RootLayout() {
  const queryClient = new QueryClient();

  const content = (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </QueryClientProvider>
  );

  if (Platform.OS === "web") {
    return <View style={{ flex: 1 }}>{content}</View>;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>{content}</SafeAreaView>
    </SafeAreaProvider>
  );
}
