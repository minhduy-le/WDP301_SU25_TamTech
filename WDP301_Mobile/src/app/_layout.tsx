import AppProvider from "context/app.context";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { ErrorBoundaryProps, Stack, Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, View } from "react-native";
import { APP_COLOR } from "@/utils/constant";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 10, gap: 15 }}>
        <View
          style={{
            backgroundColor: "#333",
            padding: 10,
            borderRadius: 3,
            gap: 10,
          }}
        >
          <Text style={{ color: "red", fontSize: 20 }}>
            Something went wrong
          </Text>
          <Text style={{ color: "#fff" }}>{error.message}</Text>
        </View>
        <Button title="Try Again ?" onPress={retry} />
      </View>
    </SafeAreaView>
  );
}

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("@/assets/font/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("@/assets/font/Montserrat-Medium.ttf"),
    "Montserrat-Bold": require("@/assets/font/Montserrat-Bold.ttf"),
    "Montserrat-SemiBold": require("@/assets/font/Montserrat-SemiBold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "white",
    },
  };

  return (
    <GestureHandlerRootView onLayout={onLayoutRootView}>
      <RootSiblingParent>
        <AppProvider>
          <ThemeProvider value={navTheme}>
            <Stack
              screenOptions={{
                headerTintColor: APP_COLOR.ORANGE,
                headerTitleStyle: {
                  color: "black",
                  fontFamily: "Montserrat-SemiBold",
                },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="(auth)/login"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/signup"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/verify"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/welcome"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/request.password"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/employee.login"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/search"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/restaurants"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/qrcode"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/popup.sale"
                options={{
                  headerShown: false,
                  animation: "fade",
                  presentation: "transparentModal",
                }}
              />
              <Stack.Screen
                name="(auth)/role.signup"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/customer.signup"
                options={{ headerShown: false }}
              ></Stack.Screen>
              <Stack.Screen
                name="(auth)/customer.changepassword"
                options={{ headerShown: false }}
              ></Stack.Screen>
              <Stack.Screen
                name="(auth)/customer.login"
                options={{ headerShown: false }}
              ></Stack.Screen>
              <Stack.Screen
                name="(employee)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(user)/product/create.modal"
                options={{
                  headerShown: false,
                  animation: "fade",
                  presentation: "transparentModal",
                }}
              />
              <Stack.Screen
                name="(user)/product/update.modal"
                options={{
                  headerShown: false,
                  animation: "fade",
                  presentation: "transparentModal",
                }}
              />
              <Stack.Screen
                name="(user)/order/[id]"
                options={{
                  headerShown: false,
                }}
              />
              <Tabs.Screen
                name="chat/[id]"
                options={{
                  headerBackButtonDisplayMode: "minimal",
                  headerTintColor: APP_COLOR.WHITE,
                  headerStyle: {
                    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
                  },
                }}
              />
              <Stack.Screen
                name="(user)/product/place.order"
                options={{ headerShown: false }}
              />
              <Tabs.Screen
                name="(user)/account/info"
                options={{ headerShown: false }}
              />

              <Tabs.Screen
                name="(user)/account/password"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(user)/account/customer.info"
                options={{ headerTitle: "Nhập thông tin người dùng" }}
              />
            </Stack>
          </ThemeProvider>
        </AppProvider>
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
