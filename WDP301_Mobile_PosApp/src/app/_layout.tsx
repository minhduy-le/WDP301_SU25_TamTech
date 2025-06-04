import logo from "@/assets/data/logo.png";
import Sidebar from "@/components/headerComponent/sideBar";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import useCustomFonts from "@/hooks/useFonts";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get("screen").width;

const HeaderRight = () => {
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
    <View style={styles.headerContainer}>
      <Pressable
        style={styles.locationContainer}
        onPress={() => console.log("Địa chỉ nè")}
      >
        <Image source={logo} style={{ height: 50, width: 75 }} />
        <Text style={styles.locationText}>Ho Chi Minh City</Text>
        <Octicons name="chevron-down" size={20} color={APP_COLOR.BROWN} />
      </Pressable>
      <AntDesign
        name="shoppingcart"
        size={24}
        color={APP_COLOR.BROWN}
        onPress={toggleSidebar}
      />
      <Sidebar
        sidebarAnimation={sidebarAnimation}
        toggleSidebar={toggleSidebar}
      />
    </View>
  );
};

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const { fontsLoaded, onLayoutRootView } = useCustomFonts();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Drawer
          screenOptions={{
            headerRight: () => <HeaderRight />,
            headerStyle: {
              backgroundColor: APP_COLOR.WHITE,
            },
            headerTintColor: APP_COLOR.BROWN,
            headerTitleStyle: {
              fontFamily: APP_FONT.BOLD,
            },
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
              drawerActiveTintColor: APP_COLOR.BROWN,
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
            }}
          />
          <Drawer.Screen
            name="(tabs)/reports"
            options={{
              drawerLabel: "Báo cáo doanh thu",
              title: "",
            }}
          />
        </Drawer>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    marginRight: 10,
    ...Platform.select({
      android: {
        position: "absolute",
        left: 20,
      },
    }),
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locationText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.REGULAR,
    fontSize: 16,
  },
});
