import { useCurrentApp } from "@/context/app.context";
import { APP_COLOR } from "@/utils/constant";
import { View, Text, Image, Pressable, Alert, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FONTS } from "@/theme/typography";
import logo from "@/assets/logo.png";
const AccountPage = () => {
  const styles = StyleSheet.create({
    text: { color: APP_COLOR.ORANGE, fontSize: 20, fontFamily: FONTS.regular },
    img: {
      height: 100,
      width: 100,
      position: "absolute",
      right: 10,
    },
  });
  const insets = useSafeAreaInsets();
  const [decodeToken, setDecodeToken] = useState<any>("");
  const { appState } = useCurrentApp();
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setDecodeToken(decoded);
        } else {
          console.log("No access token found.");
        }
      } catch (error) {
        console.error("Error retrieving access token:", error);
      }
    };
    getAccessToken();
  }, []);
  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn chắc chắn đăng xuất người dùng ?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xác nhận",
        onPress: async () => {
          await AsyncStorage.removeItem("access_token");
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: APP_COLOR.YELLOW,
          flexDirection: "row",
        }}
      >
        <View>
          <Text style={styles.text}>{decodeToken.name}</Text>
          <Text style={styles.text}>{decodeToken.phone}</Text>
          <Text style={styles.text}>{decodeToken.address}</Text>
        </View>
        <Image source={logo} style={styles.img} />
      </View>

      <Pressable
        onPress={() => router.navigate("/(user)/account/info")}
        style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
          borderBottomColor: "#eee",
          borderBottomWidth: 1,
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Feather name="user-check" size={20} color="green" />
          <Text>Cập nhật thông tin</Text>
        </View>

        <MaterialIcons name="navigate-next" size={24} color="grey" />
      </Pressable>

      <Pressable
        onPress={() => router.navigate("/(user)/account/password")}
        style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
          borderBottomColor: "#eee",
          borderBottomWidth: 1,
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <MaterialIcons name="password" size={20} color="green" />
          <Text>Thay đổi mật khẩu</Text>
        </View>

        <MaterialIcons name="navigate-next" size={24} color="grey" />
      </Pressable>
      <Pressable
        onPress={() =>
          Alert.alert("Thông tin ứng dụng", "Ứng dụng Cơm Tấm Tắc")
        }
        style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
          borderBottomColor: "#eee",
          borderBottomWidth: 1,
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <MaterialIcons name="info-outline" size={20} color="green" />
          <Text>Về ứng dụng</Text>
        </View>

        <MaterialIcons name="navigate-next" size={24} color="grey" />
      </Pressable>

      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          gap: 10,
          paddingBottom: 15,
        }}
      >
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({
            opacity: pressed === true ? 0.5 : 1,
            padding: 10,
            marginHorizontal: 10,
            backgroundColor: APP_COLOR.ORANGE,
            borderRadius: 3,
          })}
        >
          <Text
            style={{
              textAlign: "center",
              color: "white",
            }}
          >
            Đăng Xuất
          </Text>
        </Pressable>
        <Text style={{ textAlign: "center", color: APP_COLOR.GREY }}>
          Version 1.0 - Tấm Tắc
        </Text>
        <View style={{ marginBottom: 10 }}></View>
      </View>
    </View>
  );
};

export default AccountPage;
