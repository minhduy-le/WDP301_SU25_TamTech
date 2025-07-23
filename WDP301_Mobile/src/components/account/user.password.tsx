import ShareInput from "@/components/input/share.input";
import { FONTS } from "@/theme/typography";
import { updateUserPasswordAPI } from "@/utils/api";
import { API_URL, APP_COLOR } from "@/utils/constant";
import { UpdateUserPasswordSchema } from "@/utils/validate.schema";
import { Formik, FormikProps } from "formik";
import { useRef } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import Toast from "react-native-root-toast";
import logo from "@/assets/logo.png";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const UserPassword = () => {
  const formikRef = useRef<FormikProps<any>>(null);
  const handleUpdatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        Toast.show("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.CANCEL,
          opacity: 1,
        });
        return;
      }

      const res = await axios.post(
        `${API_URL}/api/auth/change-password`,
        {
          oldPassword: currentPassword,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 && res.data.success) {
        Toast.show("Cập nhật mật khẩu thành công!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.DONE,
          opacity: 1,
        });

        formikRef?.current?.resetForm();
      } else {
        const message = Array.isArray(res.data.message)
          ? res.data.message[0]
          : res.data.message || "Đã có lỗi xảy ra.";
        Toast.show(message, {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.CANCEL,
          opacity: 1,
        });
      }
    } catch (error) {
      let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        } else if (error.response?.data?.message) {
          errorMessage = Array.isArray(error.response.data.message)
            ? error.response.data.message[0]
            : error.response.data.message;
        }
      }

      Toast.show(errorMessage, {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.CANCEL,
        opacity: 1,
      });
    }
  };
  return (
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
                    color: isValid && dirty ? APP_COLOR.WHITE : APP_COLOR.WHITE,
                    fontFamily: FONTS.regular,
                    fontSize: 15,
                  }}
                >
                  {isValid && dirty ? "Lưu thay đổi" : "Không thể lưu"}
                </Text>
              </Pressable>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

export default UserPassword;
