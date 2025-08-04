import { useCurrentApp } from "@/context/app.context";
import { API_URL, APP_COLOR } from "@/utils/constant";
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { FONTS, typography } from "@/theme/typography";
import logo from "@/assets/logo.png";
import ShareButton from "@/components/button/share.button";
import icon from "@/assets/icons/loi-chuc.png";
import CusInfoText from "@/components/account/user.info.text";
import { formatDateOnlyToDDMMYYYY } from "@/utils/function";
import axios from "axios";

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
const ScreenWidth = Dimensions.get("screen").width;
const AccountPage = () => {
  const [decodeToken, setDecodeToken] = useState<any>("");
  const { appState, setAppState, cart, setCart } = useCurrentApp();
  const [time, setTime] = useState("");
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        // Decode token để lấy user ID
        const decoded = jwtDecode(token) as any;
        const userId = decoded.id;

        // Gọi API để lấy thông tin user
        const response = await axios.get(`${API_URL}/api/profiles/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.user) {
          setDecodeToken(response.data.user);
        } else {
          setDecodeToken("");
        }
      } else {
        setDecodeToken("");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setDecodeToken("");
    }
  };

  useEffect(() => {
    setTime(getCurrentDateTime());
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [appState]);
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn chắc chắn đăng xuất người dùng ?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xác nhận",
        onPress: async () => {
          setCart({});
          await AsyncStorage.removeItem("access_token");
          setAppState(0);
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
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
          {appState && (
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
              {decodeToken.fullName}
            </Text>
          )}
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
              Hãy đăng nhập/đăng ký để nhận được các thông tin ưu đã từ Tấm Tắc
              nhé.
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
      {appState && (
        <View
          style={{
            position: "relative",
            bottom: -25,
            backgroundColor: APP_COLOR.ORANGE,
            marginHorizontal: 10,
            padding: 5,
            borderRadius: 10,
            width: ScreenWidth * 0.85,
            alignSelf: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 10,
              backgroundColor: APP_COLOR.ORANGE,
              borderWidth: 1,
              borderColor: APP_COLOR.WHITE,
              borderRadius: 10,
              paddingTop: 15,
              paddingBottom: 20,
            }}
          >
            <Text
              style={[
                styles.text,
                {
                  marginLeft: 10,
                  color: APP_COLOR.WHITE,
                  fontFamily: FONTS.medium,
                },
              ]}
            >
              {decodeToken.fullName}
            </Text>
            <Image source={icon} style={{ height: 39, width: 80 }} />
          </View>
        </View>
      )}
      <View style={styles.buttonContainer}>
        {appState && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingTop: 10,
            }}
          >
            <Text
              style={[styles.text, { fontFamily: FONTS.bold, marginBottom: 5 }]}
            >
              Thông tin tài khoản
            </Text>
            <View style={{ marginHorizontal: 5 }}>
              <CusInfoText title="Họ và tên" info={decodeToken.fullName} />
              <CusInfoText
                title="Ngày sinh"
                info={formatDateOnlyToDDMMYYYY(decodeToken.date_of_birth)}
              />
              <CusInfoText title="SĐT" info={decodeToken.phone_number} />
              <CusInfoText title="Email" info={decodeToken.email} />
            </View>
          </View>
        )}
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
            <MaterialIcons name="password" size={25} color={APP_COLOR.BROWN} />
            <Text style={styles.btnText}>Thay đổi mật khẩu</Text>
          </View>
          <MaterialIcons
            name="navigate-next"
            size={24}
            color={APP_COLOR.BROWN}
          />
        </Pressable>
        <Pressable
          onPress={() => router.navigate("/(auth)/voucher")}
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
            <Feather name="gift" size={25} color={APP_COLOR.BROWN} />
            <Text style={styles.btnText}>Ưu đãi của bạn</Text>
          </View>
          <MaterialIcons
            name="navigate-next"
            size={24}
            color={APP_COLOR.BROWN}
          />
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert("App Tấm Tắc", "Ứng dụng Cơm Tấm Tắc ver 1.0.6")
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
      <View
        style={{
          marginHorizontal: 10,
          marginTop: 10,
        }}
      >
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
      <View
        style={{ backgroundColor: APP_COLOR.BACKGROUND_ORANGE, height: 30 }}
      ></View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  text: { color: APP_COLOR.BROWN, fontSize: 17, fontFamily: FONTS.regular },
  img: {
    height: 100,
    width: 150,
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
    paddingBottom: 3,
    marginBottom: 3,
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
    width: ScreenWidth * 0.35,
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
