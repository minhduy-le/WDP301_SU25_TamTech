import ShareInput from "@/components/input/share.input";
import { UpdateUserSchema } from "@/utils/validate.schema";
import { Formik } from "formik";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from "react-native";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShareButton from "../button/share.button";
import { APP_COLOR } from "@/utils/constant";
import Toast from "react-native-root-toast";
import { FONTS } from "@/theme/typography";
import logo from "@/assets/logo.png";
interface DecodedToken {
  id: number;
  name: string;
  address: string;
  phone: string;
}
const sampleData = {
  id: 1,
  name: "Lê Minh Duy",
  address: "Thành phố Thủ Đức, Thành phố Hồ Chí Minh",
  phone: "0889679561",
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 50,
  },
});
const UserInfo = () => {
  const [decodeToken, setDecodeToken] = useState<DecodedToken | null>(null);
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setDecodeToken(decoded);
        } else {
          console.log("No access token found.");
        }
      } catch (error) {
        console.error("Error retrieving access token:", error);
      }
    };
    getAccessToken();
  }, []);

  // const handleUpdateUser = async (name: string, phone: string) => {
  //   if (sampleData?.id) {
  //       const res = await updateUserInfo({ id: sampleData.id, name, phone });
  //       if(res.data) {
  //         Toast.show("Cập nhật thông tin user thành công!", {
  //           duration: Toast.durations.LONG,
  //           textColor: "white",
  //           backgroundColor: APP_COLOR.ORANGE,
  //           opacity: 1,
  //         });
  //         setDecodeToken((prev) =>
  //           prev
  //             ? {
  //                 ...prev,
  //                 name,
  //                 phone,
  //               }
  //             : null
  //         );
  //       } else {
  //         const m = Array.isArray(res.message) ? res.message[0] : res.message;
  //         Toast.show(m, {
  //           duration: Toast.durations.LONG,
  //           textColor: "white",
  //           backgroundColor: APP_COLOR.ORANGE,
  //           opacity: 1,
  //         });
  //       }
  //   }
  // };

  // if (!decodeToken) {
  //   return null;
  // }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Image
            source={logo}
            style={{ height: 150, width: 300, marginHorizontal: "auto" }}
          />
          <View style={{ alignItems: "center", gap: 5 }}>
            <Text
              style={{
                fontSize: 20,
                color: APP_COLOR.BROWN,
                fontFamily: FONTS.semiBold,
              }}
            >
              Thay đổi thông tin của bạn
            </Text>
          </View>
          <Formik
            validationSchema={UpdateUserSchema}
            initialValues={{
              name: sampleData.name,
              address: sampleData.address,
              phone: sampleData.phone,
            }}
            onSubmit={
              (values) => console.log("Test")
              // handleUpdateUser(values?.name ?? "", values?.phone ?? "")
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
              <View
                style={{ marginTop: 20, gap: 15, marginHorizontal: "auto" }}
              >
                <ShareInput
                  title="Họ và tên"
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                  error={errors.name}
                  touched={touched.name}
                />
                <ShareInput
                  title="Địa chỉ"
                  onChangeText={handleChange("address")}
                  onBlur={handleBlur("address")}
                  value={values.address}
                  error={errors.address}
                  touched={touched.address}
                />

                <ShareInput
                  title="Số điện thoại"
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  value={values.phone}
                  error={errors.phone}
                  touched={touched.phone}
                />
              </View>
            )}
          </Formik>
          <ShareButton
            title="Lưu thay đổi"
            btnStyle={{
              backgroundColor: APP_COLOR.BROWN,
              width: "auto",
              marginHorizontal: "25%",
              borderWidth: 0.5,
              borderRadius: 10,
              borderColor: APP_COLOR.BROWN,
              marginTop: 30,
            }}
            textStyle={{
              color: APP_COLOR.WHITE,
              fontSize: 17,
              marginHorizontal: 20,
              fontFamily: FONTS.regular,
            }}
            onPress={() => console.log("Lưu")}
            // onPress={() => handleUpdateUser(values.name, values.phone)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserInfo;
