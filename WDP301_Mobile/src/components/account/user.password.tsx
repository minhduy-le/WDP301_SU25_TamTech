import ShareInput from "@/components/input/share.input";
import { FONTS } from "@/theme/typography";
import { updateUserPasswordAPI } from "@/utils/api";
import { APP_COLOR } from "@/utils/constant";
import { UpdateUserPasswordSchema } from "@/utils/validate.schema";
import { Formik, FormikProps } from "formik";
import { useRef } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import Toast from "react-native-root-toast";
import logo from "@/assets/logo.png";
const UserPassword = () => {
  const formikRef = useRef<FormikProps<any>>(null);

  const handleUpdatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const res = await updateUserPasswordAPI(currentPassword, newPassword);
    if (res.data) {
      Toast.show("Cập nhật mật khẩu thành công!", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1,
      });

      formikRef?.current?.resetForm();
    } else {
      const m = Array.isArray(res.message) ? res.message[0] : res.message;

      Toast.show(m, {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingTop: 20,
          }}
        >
          <Image
            source={logo}
            style={{ width: 300, height: 150, marginHorizontal: "auto" }}
          />
          <Text
            style={{
              color: APP_COLOR.BROWN,
              fontFamily: FONTS.semiBold,
              fontSize: 20,
              marginHorizontal: "auto",
            }}
          >
            Thay đổi mật khẩu của bạn
          </Text>
          <Formik
            innerRef={formikRef}
            validationSchema={UpdateUserPasswordSchema}
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmNewPassword: "",
            }}
            onSubmit={(values) =>
              handleUpdatePassword(
                values?.currentPassword ?? "",
                values?.newPassword ?? ""
              )
            }
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
              dirty,
            }) => (
              <View style={{ marginTop: 20, gap: 20 }}>
                <ShareInput
                  title="Mật khẩu hiện tại"
                  secureTextEntry={true}
                  onChangeText={handleChange("currentPassword")}
                  onBlur={handleBlur("currentPassword")}
                  value={values.currentPassword}
                  error={errors.currentPassword}
                  touched={touched.currentPassword}
                />

                <ShareInput
                  title="Mật khẩu mới"
                  secureTextEntry={true}
                  onChangeText={handleChange("newPassword")}
                  onBlur={handleBlur("newPassword")}
                  value={values.newPassword}
                  error={errors.newPassword}
                  touched={touched.newPassword}
                />

                <ShareInput
                  title="Xác nhận mật khẩu mới"
                  secureTextEntry={true}
                  onChangeText={handleChange("confirmNewPassword")}
                  onBlur={handleBlur("confirmNewPassword")}
                  value={values.confirmNewPassword}
                  error={errors.confirmNewPassword}
                  touched={touched.confirmNewPassword}
                />

                <Pressable
                  disabled={!(isValid && dirty)}
                  onPress={handleSubmit as any}
                  style={({ pressed }) => ({
                    opacity: pressed === true ? 0.5 : 1,
                    backgroundColor:
                      isValid && dirty ? APP_COLOR.BROWN : APP_COLOR.GREY,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    marginHorizontal: "auto",
                    borderRadius: 10,
                  })}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color:
                        isValid && dirty ? APP_COLOR.WHITE : APP_COLOR.WHITE,
                      fontFamily: FONTS.regular,
                      fontSize: 17,
                    }}
                  >
                    {isValid && dirty
                      ? "Lưu thay đổi"
                      : "Xin nhập đầy đủ thông tin"}
                  </Text>
                </Pressable>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserPassword;
