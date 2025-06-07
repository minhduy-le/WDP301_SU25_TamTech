import logo from "@/assets/data/logo.png";
import Sidebar from "@/components/headerComponent/sideBar";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import AppProvider, { useCurrentApp } from "@/context/app.context";
import useCustomFonts from "@/hooks/useFonts";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get("screen").width;

const HeaderRight = () => {
  const { cart } = useCurrentApp();
  const [quantity, setQuantity] = useState(0);
  useEffect(() => {
    if (
      cart &&
      cart.default &&
      typeof cart.default.quantity === "number" &&
      cart.default.quantity > 0
    ) {
      setQuantity(cart.default.quantity);
    } else {
      setQuantity(0);
    }
  }, [cart]);
  const sidebarAnimation = useRef(new Animated.Value(screenWidth)).current;
  const [showSidebar, setShowSidebar] = useState(false);
  const toggleSidebar = () => {
    const toValue = showSidebar ? screenWidth : 0;
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setShowSidebar(!showSidebar);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Image source={logo} style={{ height: 60, width: 100 }} />
        <Pressable
          style={styles.locationContainer}
          onPress={() => console.log("Địa chỉ nè")}
        >
          <Text style={styles.locationText}>Ho Chi Minh City</Text>
          <Octicons name="chevron-down" size={15} color={APP_COLOR.BROWN} />
        </Pressable>
        <View>
          <View
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              backgroundColor: APP_COLOR.BROWN,
              width: 20,
              height: 20,
              borderRadius: 50,
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <Text
              style={{
                fontFamily: APP_FONT.BOLD,
                color: APP_COLOR.ORANGE,
                zIndex: 1000,
              }}
            >
              {quantity}
            </Text>
          </View>
          <AntDesign
            name="shoppingcart"
            size={38}
            color={APP_COLOR.BROWN}
            onPress={toggleSidebar}
          />
        </View>
        <Sidebar
          sidebarAnimation={sidebarAnimation}
          toggleSidebar={toggleSidebar}
        />
      </View>
    </SafeAreaView>
  );
};

export default function RootLayout() {
  const { fontsLoaded, fontError, onLayoutRootView } = useCustomFonts();
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppProvider>
        <ThemeProvider value={DefaultTheme}>
          <Drawer
            screenOptions={{
              headerShown: true,
              header: () => <HeaderRight />,
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
              name="index"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />
            <Drawer.Screen
              name="(tabs)/homepage"
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
              name="(tabs)/order.history"
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
              name="(tabs)/reports"
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
              name="(tabs)/search.information"
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
              name="(tabs)/manage.store"
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
          </Drawer>

          <StatusBar style="auto" />
        </ThemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    ...Platform.select({
      android: {
        marginTop: 30,
      },
    }),
    backgroundColor: APP_COLOR.WHITE,
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    position: "relative",
    zIndex: 1,
    gap: 30,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginRight: 15,
  },
  locationText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.REGULAR,
    fontSize: 16,
  },
});
