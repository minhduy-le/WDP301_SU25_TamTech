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
} from "react-native";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShareButton from "../button/share.button";

interface DecodedToken {
  id: number;
  name: string;
  address: string;
  phone: string;
}
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

  const handleUpdateUser = async (name: string, phone: string) => {
    if (decodeToken?.id) {
      //   const res =
      //   if (res.data) {
      //     Toast.show("Cập nhật thông tin user thành công!", {
      //       duration: Toast.durations.LONG,
      //       textColor: "white",
      //       backgroundColor: APP_COLOR.ORANGE,
      //       opacity: 1,
      //     });
      //     setDecodeToken((prev) =>
      //       prev
      //         ? {
      //             ...prev,
      //             name,
      //             phone,
      //           }
      //         : null
      //     );
      //   } else {
      //     const m = Array.isArray(res.message) ? res.message[0] : res.message;
      //     Toast.show(m, {
      //       duration: Toast.durations.LONG,
      //       textColor: "white",
      //       backgroundColor: APP_COLOR.ORANGE,
      //       opacity: 1,
      //     });
      //   }
    }
  };

  if (!decodeToken) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={{ alignItems: "center", gap: 5 }}>
            <Text>{decodeToken.name}</Text>
          </View>
          <Formik
            validationSchema={UpdateUserSchema}
            initialValues={{
              name: decodeToken.name,
              address: decodeToken.address,
              phone: decodeToken.phone,
            }}
            onSubmit={(values) =>
              handleUpdateUser(values?.name ?? "", values?.phone ?? "")
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
                  title="Họ tên"
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
                <ShareButton
                  title="Lưu thay đổi"
                  onPress={() => handleUpdateUser(values.name, values.phone)}
                />
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserInfo;
