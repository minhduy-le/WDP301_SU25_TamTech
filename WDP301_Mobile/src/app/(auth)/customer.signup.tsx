import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import ShareInput from "@/components/input/share.input";
import { APP_COLOR } from "@/utils/constant";
import { CustomerSignUpSchema } from "@/utils/validate.schema";
import axios from "axios";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL } from "@/utils/constant";
import logo from "@/assets/logo.png";
import { FONTS } from "@/theme/typography";
import { customerRegisterAPI } from "@/utils/api";
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
  fullName: string,
  phoneNumber: string,
  email: string,
  password: string
) => {
  // try {
  //   const res = await customerRegisterAPI(
  //     fullName,
  //     phoneNumber,
  //     email,
  //     password
  //   );
  //   console.log(res.data.data);
  // } catch {}

  try {
    const signUpResponse = await axios.post(
      `https://wdp-301-0fd32c261026.herokuapp.com/api/auth/register`,
      {
        fullName: fullName,
        email: email,
        phone_number: phoneNumber,
        password: password,
      }
    );
    console.log(signUpResponse.data);
    if (signUpResponse.data) {
      Toast.show("Đã đăng ký thành công", {
        duration: Toast.durations.LONG,
        textColor: APP_COLOR.BROWN,
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1,
        position: -30,
      });
      router.replace("/(auth)/welcome");
    }
    // if (signUpResponse.data) {
    //   const generateCodeResponse = await axios.post(
    //     `${BASE_URL}/verify-code/send?mode=${phoneNumber}`,
    //     {
    //       phoneNumber: phoneNumber,
    //     }
    //   );
    //   if (generateCodeResponse.data) {
    //     router.replace({
    //       pathname: "/(auth)/verify",
    //       params: { phoneNumber: phoneNumber },
    //     });
    //   } else {
    //     Toast.show("Không thể tạo mã xác thực", {
    //       duration: Toast.durations.LONG,
    //       textColor: "white",
    //       backgroundColor: APP_COLOR.ORANGE,
    //       opacity: 1,
    //     });
    //   }
    // } else {
    //   const message = Array.isArray(signUpResponse.message)
    //     ? signUpResponse.message[0]
    //     : signUpResponse.message;
    //   Toast.show(message, {
    //     duration: Toast.durations.LONG,
    //     textColor: "white",
    //     backgroundColor: APP_COLOR.ORANGE,
    //     opacity: 1,
    //   });
    // }
  } catch (error: any) {
    console.log(error);
    // console.log(
    //   ">>> Error during sign-up: ",
    //   error.response.data.errors[0].message
    // );
    // const errorMessage =
    //   error.response.data.errors[0].message || "Có lỗi xảy ra khi đăng ký";
    // Toast.show(errorMessage, {
    //   duration: Toast.durations.LONG,
    //   textColor: "white",
    //   backgroundColor: APP_COLOR.ORANGE,
    //   opacity: 1,
    // });
  }
};
const CustomerSignUpPage = () => {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <Formik
        validationSchema={CustomerSignUpSchema}
        initialValues={{
          fullName: "",
          phoneNumber: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        onSubmit={(values) => {
          handleSignUp(
            values.fullName,
            values.phoneNumber,
            values.email,
            values.password
          );
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
                  fontSize: 18,
                  fontFamily: FONTS.medium,
                  color: APP_COLOR.BROWN,
                  marginBottom: 10,
                }}
              >
                Trở thành khách hàng của Tấm Tắc
              </Text>
              <View style={{ gap: 15 }}>
                <ShareInput
                  placeholder="Tên của bạn"
                  placeholderTextColor={APP_COLOR.BROWN}
                  onChangeText={handleChange("fullName")}
                  onBlur={handleBlur("fullName")}
                  value={values.fullName}
                  error={errors.fullName}
                  touched={touched.fullName}
                />
                <ShareInput
                  placeholder="Số điện thoại"
                  placeholderTextColor={APP_COLOR.BROWN}
                  onChangeText={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                  value={values.phoneNumber}
                  error={errors.phoneNumber}
                  touched={touched.phoneNumber}
                />
                <ShareInput
                  placeholder="Email"
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
                  secureTextEntry={true}
                />
                <ShareInput
                  placeholder="Xác nhận lại mật khẩu"
                  placeholderTextColor={APP_COLOR.BROWN}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  secureTextEntry={true}
                />
              </View>
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
    </ScrollView>
  );
};

export default CustomerSignUpPage;
