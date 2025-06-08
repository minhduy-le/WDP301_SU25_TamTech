import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import AppProvider from "@/context/app.context";
import useCustomFonts from "@/hooks/useFonts";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const TabLayout = () => {
  const { fontsLoaded, fontError, onLayoutRootView } = useCustomFonts();
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
          <Stack.Screen name="homepage" />
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
};

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          backgroundColor: APP_COLOR.WHITE,
          width: "75%",
        },
        drawerActiveBackgroundColor: APP_COLOR.ORANGE + "20",
        drawerLabelStyle: {
          fontFamily: APP_FONT.REGULAR,
          fontSize: 16,
        },
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen
        name="homepage"
        options={{
          drawerLabel: "Trang chủ",
          title: "",
          drawerActiveTintColor: APP_COLOR.ORANGE,
          drawerInactiveTintColor: APP_COLOR.BROWN,
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="confirmorder"
        options={{
          drawerLabel: "Quản lý đơn hàng",
          title: "",
          drawerActiveTintColor: APP_COLOR.ORANGE,
          drawerInactiveTintColor: APP_COLOR.BROWN,
          drawerIcon: ({ color, size }) => (
            <AntDesign name="filetext1" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="order.history"
        options={{
          drawerLabel: "Lịch sử giao dịch",
          title: "",
          drawerActiveTintColor: APP_COLOR.ORANGE,
          drawerInactiveTintColor: APP_COLOR.BROWN,
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="history" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="reports"
        options={{
          drawerLabel: "Báo cáo doanh thu",
          title: "",
          drawerActiveTintColor: APP_COLOR.ORANGE,
          drawerInactiveTintColor: APP_COLOR.BROWN,
          drawerIcon: ({ color, size }) => (
            <FontAwesome6 name="chart-line" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="search.information"
        options={{
          drawerLabel: "Tra cứu thông tin",
          title: "Tra cứu thông tin",
          drawerActiveTintColor: APP_COLOR.ORANGE,
          drawerInactiveTintColor: APP_COLOR.BROWN,
          drawerIcon: ({ color, size }) => (
            <AntDesign name="search1" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="manage.store"
        options={{
          drawerLabel: "Kiểm kho",
          title: "Kiểm kho",
          drawerActiveTintColor: APP_COLOR.ORANGE,
          drawerInactiveTintColor: APP_COLOR.BROWN,
          drawerIcon: ({ color, size }) => (
            <FontAwesome5 name="store" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="notification"
        options={{
          drawerLabel: "Thông báo",
          title: "Thông báo",
          drawerActiveTintColor: APP_COLOR.ORANGE,
          drawerInactiveTintColor: APP_COLOR.BROWN,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="setting"
        options={{
          drawerLabel: "Cài đặt",
          title: "Cài đặt",
          drawerActiveTintColor: APP_COLOR.ORANGE,
          drawerInactiveTintColor: APP_COLOR.BROWN,
          drawerIcon: ({ color, size }) => (
            <AntDesign name="setting" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Drawer>
  );
}
