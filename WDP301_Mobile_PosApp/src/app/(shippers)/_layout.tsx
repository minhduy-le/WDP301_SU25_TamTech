import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import AppProvider from "@/context/app.context";
import useCustomFonts from "@/hooks/useFonts";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TabLayout() {
  const { fontsLoaded, fontError, onLayoutRootView } = useCustomFonts();

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: APP_COLOR.ORANGE,
              tabBarInactiveTintColor: APP_COLOR.BROWN,
              tabBarStyle: {
                backgroundColor: APP_COLOR.WHITE,
                borderTopColor: APP_COLOR.WHITE,
                height: 60,
                paddingBottom: 5,
              },
              tabBarLabelStyle: {
                fontFamily: APP_FONT.REGULAR,
                fontSize: 12,
                marginBottom: 5,
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Lịch trình",
                tabBarIcon: ({ color, size }) => (
                  <AntDesign name="calendar" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="shipping"
              options={{
                title: "Nhận đơn",
                tabBarIcon: ({ color, size }) => (
                  <AntDesign name="filetext1" size={size - 1} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="attendance"
              options={{
                title: "Chấm công",
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome6 name="check" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </SafeAreaView>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
