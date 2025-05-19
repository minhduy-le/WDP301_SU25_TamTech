import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { APP_COLOR } from "@/utils/constant";
import { StyleSheet, View } from "react-native";
import { FONTS } from "@/theme/typography";
import Entypo from "@expo/vector-icons/Entypo";

const TabLayout = () => {
  const getIcons = (routeName: string, focused: boolean, size: number) => {
    const styles = StyleSheet.create({
      qrIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginBottom: 30,
      },
    });
    if (routeName === "index") {
      return (
        <MaterialCommunityIcons
          name="food-fork-drink"
          size={size}
          color={focused ? APP_COLOR.ORANGE : APP_COLOR.BROWN}
        />
      );
    }
    if (routeName === "order") {
      return (
        <MaterialIcons
          name="list-alt"
          size={size}
          color={focused ? APP_COLOR.ORANGE : APP_COLOR.BROWN}
        />
      );
    }

    if (routeName === "ai") {
      return (
        <View style={styles.qrIcon}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={35}
            color={focused ? APP_COLOR.ORANGE : APP_COLOR.BROWN}
          />
        </View>
      );
    }

    if (routeName === "chat") {
      return focused ? (
        <Entypo name="chat" size={24} color={APP_COLOR.ORANGE} />
      ) : (
        <Entypo name="chat" size={24} color={APP_COLOR.BROWN} />
      );
    }

    if (routeName === "account") {
      return focused ? (
        <MaterialCommunityIcons
          name="account"
          size={size}
          color={APP_COLOR.ORANGE}
        />
      ) : (
        <MaterialCommunityIcons
          name="account-outline"
          size={size}
          color={APP_COLOR.BROWN}
        />
      );
    }
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          return getIcons(route.name, focused, size);
        },
        headerShown: false,
        tabBarLabelStyle: {
          paddingBottom: 5,
          fontFamily: FONTS.bold,
          fontSize: 12,
        },
        tabBarActiveTintColor: APP_COLOR.ORANGE,
        tabBarInactiveTintColor: APP_COLOR.BROWN,
        tabBarStyle: {
          borderTopWidth: 0,
          // marginBottom: 20,
          height: 80,
          paddingBottom: 5,
          backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
        },
        tabBarLabel:
          route.name === "ai"
            ? "AI Chat"
            : route.name === "order"
            ? "Đơn hàng"
            : route.name === "index"
            ? "Trang chủ"
            : route.name === "chat"
            ? "Nhắn tin"
            : "Tôi",
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: "Đơn hàng",
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI Chat",
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Nhắn tin",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Tôi",
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
