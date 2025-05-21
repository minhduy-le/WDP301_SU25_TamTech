import { useCurrentApp } from "@/context/app.context";
import { APP_COLOR } from "@/utils/constant";
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FONTS } from "@/theme/typography";
import logo from "@/assets/logo.png";
const sampleData = {
  name: "Lê Minh Duy",
  phone: "0889679561",
  address: "TP Thủ Đức, TP Hồ Chí Minh",
};

const getCurrentDateTime = (): string => {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 5 && hour < 11) {
    return "Buổi sáng năng lượng!";
  } else if (hour >= 11 && hour < 13) {
    return "Buổi trưa vui vẻ!";
  } else if (hour >= 13 && hour < 18) {
    return "Buổi chiều nhẹ nhàng!";
  } else {
    return "Buổi tối thư giãn!";
  }
};

const realTime = getCurrentDateTime();
const AccountPage = () => {
  const styles = StyleSheet.create({
    text: { color: APP_COLOR.BROWN, fontSize: 17, fontFamily: FONTS.regular },
    img: {
      height: 100,
      width: 150,
      position: "absolute",
      right: -5,
      top: -25,
    },
    btnText: {
      color: APP_COLOR.BROWN,
      fontFamily: FONTS.semiBold,
      fontSize: 17,
    },
  });
  const insets = useSafeAreaInsets();
  const [decodeToken, setDecodeToken] = useState<any>("");
  const { appState } = useCurrentApp();
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(getCurrentDateTime());
  }, []);

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <View style={{ flex: 1, marginTop: Platform.OS === "android" ? 15 : 0 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 10,
            marginVertical: "auto",
            borderBottomColor: APP_COLOR.BROWN,
            borderBottomWidth: 0.5,
            paddingBottom: 10,
          }}
        >
          <View style={{ width: "50%" }}>
            <Text
              style={[styles.text, { fontFamily: FONTS.medium, fontSize: 20 }]}
            >
              {time}
            </Text>
            <Text
              style={[
                styles.text,
                {
                  fontFamily: FONTS.bold,
                  color: APP_COLOR.ORANGE,
                },
              ]}
            >
              {sampleData.name}
            </Text>
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
            <Feather name="user-check" size={30} color={APP_COLOR.BROWN} />
            <Text style={styles.btnText}>Cập nhật thông tin</Text>
          </View>

          <MaterialIcons
            name="navigate-next"
            size={24}
            color={APP_COLOR.BROWN}
          />
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
            <MaterialIcons name="password" size={30} color={APP_COLOR.BROWN} />
            <Text style={styles.btnText}>Thay đổi mật khẩu</Text>
          </View>

          <MaterialIcons
            name="navigate-next"
            size={24}
            color={APP_COLOR.BROWN}
          />
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert("App Tấm Tắc", "Ứng dụng Cơm Tấm Tắc ver 2.0")
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
            <MaterialIcons
              name="info-outline"
              size={30}
              color={APP_COLOR.BROWN}
            />
            <Text style={styles.btnText}>Về ứng dụng</Text>
          </View>

          <MaterialIcons
            name="navigate-next"
            size={24}
            color={APP_COLOR.BROWN}
          />
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
          <View style={{ marginBottom: 10 }}></View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccountPage;
