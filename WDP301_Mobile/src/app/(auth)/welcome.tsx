import {
  Text,
  View,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { Formik } from "formik";
import ShareInput from "@/components/input/share.input";
import { CustomerSignInSchema } from "@/utils/validate.schema";
import Toast from "react-native-root-toast";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 30,
    zIndex: 9999,
  },
  welcomeText: {
    flex: 0.4,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    bottom: 40,
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
    gap: 20,
  },
  signUpText: {
    textDecorationLine: "underline",
    color: APP_COLOR.BROWN,
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
    height: 50,
    borderRadius: 50,
    paddingVertical: 10,
    marginLeft: 20,
    backgroundColor: "#EC6426",
  },
  normalText: {
    ...typography.bodyMedium,
    color: "#632713",
  },
  hrefLink: { marginTop: 5 },
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
  const [loading, setLoading] = useState<boolean>(false);
  const [fogotPasword, setFogotPassword] = useState(false);
  const handleLogin = async (
    phoneNumber: string,
    password: string,
    resetForm: any
  ) => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/customer/sign-in`, {
        phoneNumber: phoneNumber,
        password: password,
      });
      setLoading(false);
      if (res.data.data) {
        await AsyncStorage.setItem("access_token", res.data.data.access_token);
        await AsyncStorage.setItem(
          "refresh_token",
          res.data.data.refresh_token
        );
        setAppState(res.data.data);
        router.replace({
          pathname: "/(tabs)",
          params: { access_token: res.data.data.access_token, isLogin: 1 },
        });
      } else {
        setFogotPassword(true);
        Toast.show("Đăng nhập không thành công", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });

        if (res.statusCode === 400) {
          router.replace({
            pathname: "/(tabs)",
            params: { token: res.data, isLogin: 1 },
          });
        }
      }
    } catch (error) {
      console.log(">>> check error login: ", error);
      Toast.show("Lỗi khi đăng nhập. Vui lòng thử lại.", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1,
      });
      resetForm();
      setLoading(false);
    }
  };

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.welcomeText}>
            <Image style={styles.imgLogo} source={logo} />
            <Text style={styles.headerText}>Chào mừng bạn đến với Tấm Tắc</Text>
            <View style={styles.welcomeBtn}>
              <TextBetweenLine
                title="Đăng nhập với"
                textStyle={typography.bodyMedium}
              />
              <View>
                <Formik
                  validationSchema={CustomerSignInSchema}
                  initialValues={{ email: "", password: "" }}
                  onSubmit={(values, { resetForm }) =>
                    handleLogin(values.email, values.password, resetForm)
                  }
                >
                  {({ handleChange, handleBlur, values, errors, touched }) => (
                    <View>
                      <ShareInput
                        placeholder="Đăng nhập bằng email"
                        keyboardType="ascii-capable"
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        value={values.email}
                        error={errors.email}
                        touched={touched.email}
                      />
                      <View style={{ height: 10 }}></View>
                      <ShareInput
                        placeholder="Mật khẩu"
                        keyboardType="ascii-capable"
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        value={values.password}
                        error={errors.password}
                        touched={touched.password}
                      />
                      {fogotPasword && <Text>Quên mật khẩu?</Text>}
                    </View>
                  )}
                </Formik>
              </View>
              <View style={{ flexDirection: "row" }}>
                <ShareButton
                  title="Đăng nhập"
                  onPress={() => {
                    // router.navigate("/(auth)/verify");
                    router.navigate("/(tabs)");
                  }}
                  textStyle={styles.loginBtnText}
                  btnStyle={styles.loginBtn}
                  pressStyle={{ alignSelf: "stretch" }}
                />
                <ShareButton
                  title=" "
                  onPress={handleQuickLogin}
                  textStyle={styles.loginBtnText}
                  btnStyle={styles.loginBtnFast}
                  pressStyle={{ alignSelf: "stretch" }}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Text style={styles.normalText}>Chưa có tài khoản?</Text>
              <Link href={"/(auth)/customer.signup"} style={styles.hrefLink}>
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
            width: 200,
            height: 200,
            resizeMode: "contain",
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default WelcomePage;
