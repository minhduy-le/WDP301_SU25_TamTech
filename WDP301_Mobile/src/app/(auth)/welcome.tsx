import {
  Text,
  View,
  StyleSheet,
  Image,
  Alert,
  ImageBackground,
} from "react-native";
import ShareButton from "components/button/share.button";
import { APP_COLOR, BASE_URL } from "utils/constant";
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
import footerFrame from "@/assets/frame_footer.png";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 30,
  },
  welcomeText: {
    flex: 0.4,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    top: 5,
    fontSize: 20,
    color: "#632713",
    fontFamily: FONTS.regular,
  },
  imgLogo: {
    height: 230,
    width: 400,
    marginTop: 70,
  },
  welcomeBtn: {
    paddingHorizontal: 30,
    flex: 0.3,
    gap: 30,
  },
  signUpText: {
    textDecorationLine: "underline",
    color: "#632713",
    fontFamily: FONTS.bold,
  },
  welcomeLoginBtn: {
    flexDirection: "row",
    marginHorizontal: "auto",
  },
  loginBtn: {
    width: 200,
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 10,
    backgroundColor: "#EC6426",
    marginHorizontal: "auto",
  },
  loginBtnFast: {
    width: 50,
    borderRadius: 50,
    paddingVertical: 10,
    marginLeft: 20,
    backgroundColor: "#EC6426",
  },
  normalText: {
    ...typography.bodyMedium,
    color: "#632713",
  },
  hrefLink: { marginTop: 4 },
  loginBtnText: {
    ...typography.labelLarge,
    color: APP_COLOR.WHITE,
    paddingVertical: 5,
    fontFamily: FONTS.medium,
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

const WelcomePage = () => {
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
            router.replace("/(tabs)");
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
    <View style={{ flex: 1, backgroundColor: "#FDE3CF" }}>
      <View style={styles.container}>
        <View style={styles.welcomeText}>
          <Image style={styles.imgLogo} source={logo} />
          <Text style={styles.headerText}>Chào mừng bạn đến với Tấm Tắc</Text>
        </View>
        <View style={styles.welcomeBtn}>
          <TextBetweenLine
            title="Đăng nhập với"
            textStyle={typography.bodyMedium}
          />
          <View style={styles.welcomeLoginBtn}>
            <ShareButton
              title="Số điện thoại"
              onPress={() => {
                router.navigate("/(auth)/customer.login");
              }}
              textStyle={styles.loginBtnText}
              btnStyle={styles.loginBtn}
              pressStyle={{ alignSelf: "stretch" }}
            />
            <ShareButton
              onPress={handleQuickLogin}
              textStyle={styles.loginBtnText}
              btnStyle={styles.loginBtnFast}
              pressStyle={{ alignSelf: "stretch" }}
            />
          </View>
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
      <Image
        source={footerFrame}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 250,
          height: 250,
          resizeMode: "contain",
        }}
      />
    </View>
  );
};

export default WelcomePage;
