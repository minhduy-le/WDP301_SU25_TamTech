import { APP_COLOR } from "@/constants/Colors";
import AppProvider from "@/context/app.context";
import useCustomFonts from "@/hooks/useFonts";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const { fontsLoaded, fontError, onLayoutRootView } = useCustomFonts();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: APP_COLOR.WHITE,
            },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
