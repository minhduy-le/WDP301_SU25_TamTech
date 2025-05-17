import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { APP_COLOR, APP_FONT } from "@/utils/constant";
import { View } from "react-native";
import { FONTS } from "@/theme/typography";
import Entypo from "@expo/vector-icons/Entypo";
const TabLayout = () => {
  const getIcons = (routeName: string, focused: boolean, size: number) => {
    if (routeName === "index") {
      return (
        <MaterialCommunityIcons
          name="food-fork-drink"
          size={size}
          color={focused ? APP_COLOR.ORANGE : APP_COLOR.GREY}
        />
      );
    }
    if (routeName === "order") {
      return (
        <MaterialIcons
          name="list-alt"
          size={size}
          color={focused ? APP_COLOR.ORANGE : APP_COLOR.GREY}
        />
      );
    }

    if (routeName === "qr") {
      return focused ? (
        <View
          style={{
            width: size + 25,
            height: size + 25,
            borderRadius: (size + 25) / 2,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            elevation: 5,
          }}
        >
          <AntDesign name="qrcode" size={size + 5} color={APP_COLOR.ORANGE} />
        </View>
      ) : (
        <View
          style={{
            width: size + 25,
            height: size + 25,
            borderRadius: (size + 25) / 2,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            elevation: 5,
          }}
        >
          <AntDesign name="qrcode" size={size + 5} color={APP_COLOR.GREY} />
        </View>
      );
    }

    if (routeName === "chat") {
      return focused ? (
        <Entypo name="chat" size={24} color={APP_COLOR.ORANGE} />
      ) : (
        <Entypo name="chat" size={24} color={APP_COLOR.GREY} />
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
          color={APP_COLOR.GREY}
        />
      );
    }

    return <></>;
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          return getIcons(route.name, focused, size);
        },
        headerShown: false,
        tabBarLabelStyle: {
          paddingBottom: 3,
          fontFamily: FONTS.bold,
          fontSize: 12,
        },
        tabBarActiveTintColor: APP_COLOR.ORANGE,
        tabBarStyle: {
          borderTopWidth: 0,
          height: 50,
          paddingBottom: 5,
          backgroundColor: "#fff",
        },
        tabBarLabel:
          route.name === "qr"
            ? "Quét mã QR"
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
        name="qr"
        options={{
          title: "Quét mã QR",
          tabBarItemStyle: {
            transform: [{ translateY: -20 }],
            elevation: 10,
          },
          tabBarLabelStyle: {
            position: "absolute",
            bottom: -17,
            fontFamily: FONTS.bold,
            fontSize: 12,
          },
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
