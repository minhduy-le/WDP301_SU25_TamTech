import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { APP_COLOR } from "@/utils/constant";
import { StyleSheet, View } from "react-native";
import { FONTS } from "@/theme/typography";
import Entypo from "@expo/vector-icons/Entypo";
const TabLayout = () => {
  const getIcons = (routeName: string, focused: boolean, size: number) => {
    const styles = StyleSheet.create({
      qrIcon: {
        width: size + 40,
        height: size + 35,
        borderRadius: 30,
        backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
        justifyContent: "center",
        alignItems: "center",
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

    if (routeName === "qr") {
      return focused ? (
        <View style={styles.qrIcon}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={35}
            color={APP_COLOR.ORANGE}
          />
        </View>
      ) : (
        <View style={styles.qrIcon}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={35}
            color={APP_COLOR.BROWN}
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
    return <></>;
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          return getIcons(route.name, focused, size);
        },
        headerShown: false,
        tabBarLabelStyle: {
          paddingBottom: 3,
          fontFamily: FONTS.bold,
          fontSize: 12,
        },
        tabBarActiveTintColor: APP_COLOR.ORANGE,
        tabBarInactiveTintColor: APP_COLOR.BROWN,
        tabBarStyle: {
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
          backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
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
