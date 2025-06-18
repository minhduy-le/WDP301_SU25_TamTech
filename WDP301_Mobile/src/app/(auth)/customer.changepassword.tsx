import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import ShareInput from "@/components/input/share.input";
import { useCurrentApp } from "@/context/app.context";
import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { ChangePasswordSchema } from "@/utils/validate.schema";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL } from "@/utils/constant";
import axios from "axios";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    gap: 10,
  },
});

const CustomerChangePassword = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setAppState } = useCurrentApp();
  const { token } = useLocalSearchParams();
  const handleChangePassword = async (
    password: string,
    confirmPassword: string
  ) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${BASE_URL}/customer/change-password`,
        {
          password: password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      if (res.data) {
        router.replace("/(auth)/welcome");
      } else {
        Toast.show("Đổi mật khẩu thành công", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });

        if (res.statusCode === 400) {
          router.replace("/(auth)/login");
        }
      }
    } catch (error: any) {
      console.log(">>> check error login: ", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        validationSchema={ChangePasswordSchema}
        initialValues={{ password: "", cofirmPassword: "" }}
        onSubmit={(values) =>
          handleChangePassword(values.password, values.cofirmPassword)
        }
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.container}>
            <View>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: 600,
                  marginVertical: 30,
                }}
              >
                Đăng nhập
              </Text>
            </View>

            <ShareInput
              title="Password"
              secureTextEntry={true}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              value={values.password}
              error={errors.password}
              touched={touched.password}
            />

            <ShareInput
              title="Confirm Password"
              secureTextEntry={true}
              onChangeText={handleChange("cofirmPassword")}
              onBlur={handleBlur("cofirmPassword")}
              value={values.cofirmPassword}
              error={errors.cofirmPassword}
              touched={touched.cofirmPassword}
            />

            <View style={{ marginVertical: 10 }}>
              <Text
                onPress={() => router.navigate("/(auth)/request.password")}
                style={{
                  textAlign: "center",
                  color: APP_COLOR.ORANGE,
                  fontFamily: FONTS.regular,
                }}
              >
                Quên mật khẩu ?
              </Text>
            </View>
            <ShareButton
              loading={loading}
              title="Xác nhận"
              onPress={handleSubmit as any}
              textStyle={{
                textTransform: "uppercase",
                color: "#fff",
                paddingVertical: 5,
                fontFamily: FONTS.regular,
                fontSize: 20,
              }}
              btnStyle={{
                justifyContent: "center",
                borderRadius: 30,
                marginHorizontal: 50,
                paddingVertical: 10,
                backgroundColor: APP_COLOR.ORANGE,
              }}
              pressStyle={{ alignSelf: "stretch" }}
            />

            <View
              style={{
                marginVertical: 15,
                flexDirection: "row",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: APP_COLOR.BLACK,
                  fontFamily: FONTS.regular,
                  fontSize: 20,
                }}
              >
                Chưa có tài khoản?
              </Text>
              <Link href={"/(auth)/signup"}>
                <Text
                  style={{
                    color: APP_COLOR.ORANGE,
                    textDecorationLine: "underline",
                    fontFamily: FONTS.regular,
                    fontSize: 20,
                  }}
                >
                  Đăng ký.
                </Text>
              </Link>
            </View>

            <SocialButton title="Đăng nhập với" />
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default CustomerChangePassword;
