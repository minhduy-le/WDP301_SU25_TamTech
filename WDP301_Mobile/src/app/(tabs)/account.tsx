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
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FONTS, typography } from "@/theme/typography";
import logo from "@/assets/logo.png";
import ShareButton from "@/components/button/share.button";

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

const AccountPage = () => {
  const insets = useSafeAreaInsets();
  const [decodeToken, setDecodeToken] = useState<any>("");
  const { appState, setAppState } = useCurrentApp();
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
          setAppState(0);
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <View style={styles.headerContainer}>
          <View>
            <Text
              style={[
                styles.text,
                { fontFamily: FONTS.medium, fontSize: 19, textAlign: "center" },
              ]}
            >
              {time}
            </Text>
            <Text
              style={[
                styles.text,
                {
                  fontFamily: FONTS.bold,
                  color: APP_COLOR.ORANGE,
                  textAlign: "center",
                },
              ]}
            >
              {sampleData.name}
            </Text>
          </View>
          <Image source={logo} style={styles.img} />
        </View>
        {!appState && (
          <>
            <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
              <Text
                style={{
                  color: APP_COLOR.BROWN,
                  fontSize: 17,
                  fontFamily: FONTS.regular,
                  textAlign: "center",
                }}
              >
                Hãy đăng nhập/đăng ký để nhận được các thông tin ưu đã từ Tấm
                Tắc nhé.
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 10,
                marginHorizontal: 10,
                justifyContent: "space-around",
              }}
            >
              <ShareButton
                title="Đăng Nhập"
                onPress={() => router.push("/(auth)/welcome")}
                textStyle={styles.loginBtnText}
                btnStyle={styles.loginBtn}
              />
              <ShareButton
                title="Đăng Ký"
                onPress={() => router.push("/(auth)/customer.signup")}
                textStyle={styles.loginBtnText}
                btnStyle={styles.loginBtn}
              />
            </View>
          </>
        )}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => router.navigate("/(user)/account/info")}
            style={{
              paddingVertical: 15,
              paddingHorizontal: 10,
              borderBottomColor: "#eee",
              borderBottomWidth: 1,
              flexDirection: "row",
              justifyContent: "space-between",
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
              <Feather name="user-check" size={25} color={APP_COLOR.BROWN} />
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
              flexDirection: "row",
              justifyContent: "space-between",
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
                name="password"
                size={25}
                color={APP_COLOR.BROWN}
              />
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
              flexDirection: "row",
              justifyContent: "space-between",
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
                size={25}
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

          <Pressable
            onPress={() => handleLogout()}
            style={{
              paddingVertical: 15,
              paddingHorizontal: 10,
              borderBottomColor: "#eee",
              borderBottomWidth: 1,
              flexDirection: "row",
              justifyContent: "space-between",
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
              <MaterialIcons name="logout" size={25} color={APP_COLOR.BROWN} />
              <Text style={styles.btnText}>Đăng xuất</Text>
            </View>
            <MaterialIcons
              name="navigate-next"
              size={24}
              color={APP_COLOR.BROWN}
            />
          </Pressable>
        </View>
      </View>
      <View style={{ marginHorizontal: 10 }}>
        <Text style={[styles.text, { fontSize: 15, fontFamily: FONTS.medium }]}>
          Mọi thắc mắc vui lòng liên hệ qua CSKH:
        </Text>
        <Text style={[styles.text, { fontSize: 15, fontFamily: FONTS.medium }]}>
          Hotline:{" "}
          <Text style={[styles.text, { color: APP_COLOR.ORANGE }]}>
            0889679561
          </Text>
        </Text>
        <Text style={[styles.text, { fontSize: 15, fontFamily: FONTS.medium }]}>
          Email:{" "}
          <Text style={[styles.text, { color: APP_COLOR.ORANGE }]}>
            minhduy.fptu.se@gmail.com
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  text: { color: APP_COLOR.BROWN, fontSize: 17, fontFamily: FONTS.regular },
  img: {
    height: 100,
    width: 150,
    marginTop: 10,
    alignSelf: "center",
  },
  btnText: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  headerContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    paddingBottom: 5,
    marginBottom: 10,
    borderBottomColor: APP_COLOR.BROWN,
    borderBottomWidth: 0.5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  loginBtnText: {
    ...typography.labelLarge,
    color: APP_COLOR.WHITE,
    paddingVertical: 5,
    fontFamily: FONTS.medium,
  },
  loginBtn: {
    width: 150,
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: "#EC6426",
    marginHorizontal: "auto",
  },
  buttonContainer: {
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: APP_COLOR.WHITE,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
});
export default AccountPage;
