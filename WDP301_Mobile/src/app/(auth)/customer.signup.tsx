import ShareButton from "@/components/button/share.button";
import ShareInput from "@/components/input/share.input";
import DateInput from "@/components/input/date.input";
import { APP_COLOR } from "@/utils/constant";
import { CustomerSignUpSchema } from "@/utils/validate.schema";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import Toast from "react-native-root-toast";
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
  password: string,
  date_of_birth: string
) => {
  try {
    const signUpResponse = await customerRegisterAPI(
      fullName,
      phoneNumber,
      email,
      password,
      date_of_birth
    );
    if (signUpResponse.status === 200 || signUpResponse.status === 201) {
      Toast.show("Đăng ký thành công!", {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: APP_COLOR.ORANGE,
      });
      router.replace({
        pathname: "/(auth)/verify",
        params: { email: email },
      });
    } else {
      throw new Error("Đăng ký thất bại. Vui lòng thử lại.");
    }
  } catch (error: any) {
    console.log(
      "Lỗi khi tạo mới người dùng:",
      error.response?.data || error.message
    );
    Toast.show(
      error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: APP_COLOR.CANCEL,
      }
    );
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
          date_of_birth: "",
          password: "",
          confirmPassword: "",
        }}
        onSubmit={(values) => {
          handleSignUp(
            values.fullName,
            values.phoneNumber,
            values.email,
            values.password,
            values.date_of_birth
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
                <DateInput
                  placeholder="Nhập ngày sinh của bạn"
                  onChangeText={handleChange("date_of_birth")}
                  onBlur={handleBlur("date_of_birth")}
                  value={values.date_of_birth}
                  error={errors.date_of_birth}
                  touched={touched.date_of_birth}
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
