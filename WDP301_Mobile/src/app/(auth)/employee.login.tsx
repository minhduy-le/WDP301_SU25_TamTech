import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
} from "react-native";
import ShareButton from "components/button/share.button";
import { APP_COLOR, BASE_URL } from "utils/constant";
import bg from "@/assets/auth/welcome-background.jpg";
import { LinearGradient } from "expo-linear-gradient";
import TextBetweenLine from "@/components/button/text.between.line";
import { Link, router } from "expo-router";
import logo from "@/assets/logo.png";
import { FONTS, typography } from "@/theme/typography";
import { useEffect, useState } from "react";
import {
  authenticateWithBiometric,
  checkBiometricAuth,
} from "@/utils/biometric";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCurrentApp } from "@/context/app.context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  welcomeText: {
    flex: 0.6,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 20,
    position: "relative",
  },
  textBackground: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    zIndex: -1,
    height: 130,
  },
  heading: {
    fontSize: 60,
    fontFamily: FONTS.bold,
    color: APP_COLOR.YELLOW,
    marginTop: 150,
  },
  body: {
    fontSize: 35,
    fontFamily: FONTS.regular,
    color: APP_COLOR.ORANGE,
    marginLeft: 170,
  },
  imgLogo: {
    position: "absolute",
    top: 0,
    left: 90,
    height: 200,
    width: 200,
    marginBottom: 30,
    marginTop: 50,
  },
  welcomeBtn: {
    flex: 0.4,
    gap: 30,
  },
  signUpText: {
    color: "white",
    textDecorationLine: "underline",
    fontFamily: FONTS.regular,
  },
  loginBtnFast: {
    width: 250,
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 10,
    backgroundColor: "#2c2c2c",
    borderColor: "#505050",
    borderWidth: 1,
    marginHorizontal: "auto",
  },
  normalText: {
    ...typography.bodyMedium,
    color: "white",
  },
  hrefLink: { marginTop: 4 },
  loginBtnText: {
    ...typography.labelLarge,
    color: "#fff",
    paddingVertical: 5,
  },
  quickLoginButton: {
    backgroundColor: APP_COLOR.ORANGE,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  quickLoginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const EmployeeWelcomePage = () => {
  const { setAppState } = useCurrentApp();
  useEffect(() => {
    async function prepare() {
      try {
        const refresh_token = await AsyncStorage.getItem("refresh_token");
        const res = await axios.post(
          `${BASE_URL}/token/refresh?token=${refresh_token}`
        );
        if (res.data) {
          await AsyncStorage.setItem("access_token", res.data.access_token);
          setAppState({
            access_token: await AsyncStorage.getItem("access_token"),
          });
        } else {
          Alert.alert("Hết hạn đăng nhập", "Hãy đăng nhập lại để sử dụng");
        }
      } catch (e) {}
    }
    prepare();
  }, []);
  const handleQuickLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        const isBiometricAuth = await checkBiometricAuth();
        if (isBiometricAuth) {
          const authenticated = await authenticateWithBiometric();
          if (authenticated) {
            router.replace("/(employee)");
          } else {
            console.log("Xác thực không thành công.");
          }
        } else {
          console.log("Không có phương thức xác thực vân tay.");
        }
      } else {
        Alert.alert(
          "Đăng nhập quá hạn",
          "Hãy đăng nhập để sử dụng tính năng này"
        );
      }
    } catch (error) {
      console.error("Lỗi đăng nhập vân tay:", error);
    }
  };

  return (
    <ImageBackground style={{ flex: 1 }} source={bg}>
      <LinearGradient
        style={{ flex: 1 }}
        colors={["transparent", "#191B2F"]}
        locations={[0.2, 0.8]}
      >
        <View style={styles.container}>
          <View style={styles.welcomeText}>
            <Image style={styles.imgLogo} source={logo} />
            <View style={styles.textBackground}></View>
            <Text style={styles.heading}>Tấm Tắc</Text>
            <Text style={styles.body}>Giao hàng.</Text>
          </View>

          <View style={styles.welcomeBtn}>
            <TextBetweenLine
              title="Đăng nhập với"
              textStyle={typography.bodyMedium}
            />
            <ShareButton
              title="Email"
              onPress={() => {
                router.navigate("/(auth)/login");
              }}
              textStyle={styles.loginBtnText}
              btnStyle={styles.loginBtnFast}
              pressStyle={{ alignSelf: "stretch" }}
            />

            <ShareButton
              title="Đăng nhập nhanh"
              onPress={handleQuickLogin}
              textStyle={styles.loginBtnText}
              btnStyle={styles.loginBtnFast}
              pressStyle={{ alignSelf: "stretch" }}
            />

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <Text style={styles.normalText}>Chưa có tài khoản?</Text>
              <Link href={"/(auth)/role.signup"} style={styles.hrefLink}>
                <Text style={styles.signUpText}>Đăng ký.</Text>
              </Link>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default EmployeeWelcomePage;
