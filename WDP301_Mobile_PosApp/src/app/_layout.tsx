import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const HeaderRight = () => {
  return (
    <View style={styles.headerContainer}>
      <Pressable
        style={styles.locationContent}
        onPress={() => console.log("Địa chỉ nè")}
      >
        <Entypo name="location-pin" size={24} color="red" />
        <Text style={styles.locationText}>Ho Chi Minh City</Text>
        <Octicons name="chevron-down" size={20} color={APP_COLOR.BROWN} />
      </Pressable>
      <MaterialIcons name="settings" size={29} color={APP_COLOR.BROWN} />
    </View>
  );
};

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            name="(tabs)/orderHistory"
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
    gap: 70,
    marginRight: 10,
    ...Platform.select({
      android: {
        position: "absolute",
        left: 40,
      },
    }),
  },
  locationContent: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  locationText: {
    fontFamily: APP_FONT.REGULAR,
    fontSize: 17,
    color: APP_COLOR.BROWN,
  },
});
