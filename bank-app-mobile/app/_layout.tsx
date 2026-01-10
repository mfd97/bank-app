import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function RootLayout() {
  const queryClient = new QueryClient();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
