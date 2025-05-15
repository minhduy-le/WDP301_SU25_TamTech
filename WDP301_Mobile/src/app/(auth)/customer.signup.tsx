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
    marginHorizontal: 20,
    gap: 10,
  },
});

const handleSignUp = async (phoneNumber: string) => {
  try {
    const signUpResponse = await axios.post(`${BASE_URL}/customer/sign-up`, {
      phoneNumber: phoneNumber,
    });

    if (signUpResponse.data) {
      const generateCodeResponse = await axios.post(
        `${BASE_URL}/verify-code/send?mode=${phoneNumber}`,
        {
          phoneNumber: phoneNumber,
        }
      );
      if (generateCodeResponse.data) {
        router.replace({
          pathname: "/(auth)/verify",
          params: { phoneNumber: phoneNumber },
        });
      } else {
        Toast.show("Không thể tạo mã xác thực", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
      }
    } else {
      const message = Array.isArray(signUpResponse.message)
        ? signUpResponse.message[0]
        : signUpResponse.message;

      Toast.show(message, {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1,
      });
    }
  } catch (error: any) {
    console.log(
      ">>> Error during sign-up: ",
      error.response.data.errors[0].message
    );
    const errorMessage =
      error.response.data.errors[0].message || "Có lỗi xảy ra khi đăng ký";
    Toast.show(errorMessage, {
      duration: Toast.durations.LONG,
      textColor: "white",
      backgroundColor: APP_COLOR.ORANGE,
      opacity: 1,
    });
  }
};
const CustomerSignUpPage = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        validationSchema={CustomerSignUpSchema}
        initialValues={{ phoneNumber: "" }}
        onSubmit={(values) => {
          handleSignUp(values.phoneNumber);
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
            <View style={{ marginTop: 30 }}></View>
            <Image
              style={{ width: 200, height: 200, marginHorizontal: "auto" }}
              source={logo}
            />
            <ShareInput
              title="Số điện thoại"
              keyboardType="number-pad"
              onChangeText={handleChange("phoneNumber")}
              onBlur={handleBlur("phoneNumber")}
              value={values.phoneNumber}
              error={errors.phoneNumber}
              touched={touched.phoneNumber}
            />
            <View style={{ marginVertical: 10 }}></View>

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

            <SocialButton title="Đăng ký với" />
            <ShareButton
              title="Đăng Ký với Khách"
              onPress={handleSubmit}
              textStyle={{
                textTransform: "uppercase",
                color: "#fff",
                paddingVertical: 5,
                paddingHorizontal: 42,
                fontFamily: FONTS.bold,
              }}
              btnStyle={{
                borderRadius: 30,
                backgroundColor: APP_COLOR.ORANGE,
                width: 250,
                marginHorizontal: "auto",
                marginBottom: 150,
              }}
              pressStyle={{ alignSelf: "stretch" }}
            />
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default CustomerSignUpPage;
