import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import ShareInput from "@/components/input/share.input";
import { APP_COLOR } from "@/utils/constant";
import { CustomerSignUpSchema } from "@/utils/validate.schema";
import axios from "axios";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import { Text, View, StyleSheet, Image } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL } from "@/utils/constant";
import logo from "@/assets/logo.png";
import { FONTS } from "@/theme/typography";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  itemContainer: {
    marginHorizontal: 30,
    marginTop: 70,
  },
});

const handleSignUp = async (
  email: string,
  password: string,
  confirmPassword: string
) => {
  // try {
  //   const signUpResponse = await axios.post(`${BASE_URL}/customer/sign-up`, {
  //     phoneNumber: phoneNumber,
  //   });
  //   if (signUpResponse.data) {
  //     const generateCodeResponse = await axios.post(
  //       `${BASE_URL}/verify-code/send?mode=${phoneNumber}`,
  //       {
  //         phoneNumber: phoneNumber,
  //       }
  //     );
  //     if (generateCodeResponse.data) {
  //       router.replace({
  //         pathname: "/(auth)/verify",
  //         params: { phoneNumber: phoneNumber },
  //       });
  //     } else {
  //       Toast.show("Không thể tạo mã xác thực", {
  //         duration: Toast.durations.LONG,
  //         textColor: "white",
  //         backgroundColor: APP_COLOR.ORANGE,
  //         opacity: 1,
  //       });
  //     }
  //   } else {
  //     const message = Array.isArray(signUpResponse.message)
  //       ? signUpResponse.message[0]
  //       : signUpResponse.message;
  //     Toast.show(message, {
  //       duration: Toast.durations.LONG,
  //       textColor: "white",
  //       backgroundColor: APP_COLOR.ORANGE,
  //       opacity: 1,
  //     });
  //   }
  // } catch (error: any) {
  //   console.log(
  //     ">>> Error during sign-up: ",
  //     error.response.data.errors[0].message
  //   );
  //   const errorMessage =
  //     error.response.data.errors[0].message || "Có lỗi xảy ra khi đăng ký";
  //   Toast.show(errorMessage, {
  //     duration: Toast.durations.LONG,
  //     textColor: "white",
  //     backgroundColor: APP_COLOR.ORANGE,
  //     opacity: 1,
  //   });
  // }
};
const CustomerSignUpPage = () => {
  return (
    <Formik
      validationSchema={CustomerSignUpSchema}
      initialValues={{ email: "", password: "", confirmPassword: "" }}
      onSubmit={(values) => {
        handleSignUp(values.email, values.password, values.confirmPassword);
      }}
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
          <View style={styles.itemContainer}>
            <Image
              style={{ width: 300, height: 200, marginHorizontal: "auto" }}
              source={logo}
            />
            <Text
              style={{
                fontSize: 19,
                fontFamily: FONTS.medium,
                color: APP_COLOR.BROWN,
              }}
            >
              Trở thành khách hàng của Tấm Tắc
            </Text>
            <ShareInput
              placeholder="Nhập email"
              placeholderTextColor={APP_COLOR.BROWN}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
              error={errors.email}
              touched={touched.email}
            />
            <ShareInput
              placeholder="Nhập mật khẩu"
              placeholderTextColor={APP_COLOR.BROWN}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              value={values.password}
              error={errors.password}
              touched={touched.password}
            />
            <ShareInput
              placeholder="Xác nhận lại mật khẩu"
              placeholderTextColor={APP_COLOR.BROWN}
              onChangeText={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
              value={values.confirmPassword}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
            />
          </View>

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
                color: "black",
                fontFamily: FONTS.regular,
                fontSize: 17,
              }}
            >
              Đã có tài khoản?
            </Text>
            <Link href={"/(auth)/welcome"}>
              <Text
                style={{
                  color: APP_COLOR.ORANGE,
                  textDecorationLine: "underline",
                  fontFamily: FONTS.regular,
                  fontSize: 17,
                }}
              >
                Đăng nhập.
              </Text>
            </Link>
          </View>
          <ShareButton
            title="Đăng Ký với Khách"
            onPress={handleSubmit}
            textStyle={{
              textTransform: "uppercase",
              color: APP_COLOR.WHITE,
              paddingHorizontal: 35,
              fontFamily: FONTS.medium,
              fontSize: 15,
              position: "absolute",
              left: 20,
              top: 15,
            }}
            btnStyle={{
              borderRadius: 30,
              backgroundColor: APP_COLOR.ORANGE,
              width: 250,
              marginHorizontal: "auto",
              marginBottom: 230,
            }}
            pressStyle={{ alignSelf: "stretch" }}
          />
        </View>
      )}
    </Formik>
  );
};

export default CustomerSignUpPage;
