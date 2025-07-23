import ShareInput from "@/components/input/share.input";
import { UpdateUserSchema } from "@/utils/validate.schema";
import { Formik } from "formik";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { jwtDecode } from "jwt-decode";
import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShareButton from "../button/share.button";
import { APP_COLOR } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
import logo from "@/assets/logo.png";
import { router, useFocusEffect } from "expo-router";
import Toast from "react-native-root-toast";
import axios from "axios";
import { values } from "lodash";

interface DecodedToken {
  id: number;
  fullName: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
}

const UserInfo = () => {
  const [decodeToken, setDecodeToken] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const getAccessToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      setToken(token);
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        setDecodeToken(decoded);
      } else {
        Toast.show("No access token found. Please log in.", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.CANCEL,
          opacity: 1,
        });
      }
    } catch (error) {
      console.error("Error retrieving access token:", error);
      Toast.show("Failed to load user information.", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.CANCEL,
        opacity: 1,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getAccessToken();
    }, [getAccessToken])
  );

  const handleUpdateUser = async (
    id: number,
    fullName: string,
    email: string,
    phone_number: string,
    date_of_birth: string
  ) => {
    if (!decodeToken) {
      Toast.show("User information not available.", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.CANCEL,
        opacity: 1,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `https://wdp301-su25.space/api/profiles/${id}`,
        {
          fullName,
          email,
          phone_number,
          date_of_birth,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.push("/(tabs)/account");
    } catch (error) {
      console.error("Error updating user:", error);
      Toast.show("Failed to update user information.", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.CANCEL,
        opacity: 1,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!decodeToken) {
    return (
      <View style={styles.container}>
        <Text>No user information available.</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Image
          source={logo}
          style={{ height: 150, width: 300, alignSelf: "center" }}
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
          enableReinitialize
          validationSchema={UpdateUserSchema}
          initialValues={{
            id: decodeToken.id || 0,
            fullName: decodeToken.fullName || "",
            phone_number: decodeToken.phone_number || "",
            email: decodeToken.email || "",
            date_of_birth: decodeToken.date_of_birth || "",
          }}
          onSubmit={(values) => {
            // handleUpdateUser(
            //   values.fullName,
            //   values.phoneNumber,
            //   values.email,
            //   values.password,
            //   values.date_of_birth
            // );
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
            <View style={{ marginTop: 20, gap: 15 }}>
              <ShareInput
                title="Full Name"
                onChangeText={handleChange("fullName")}
                onBlur={handleBlur("fullName")}
                value={values.fullName}
                error={errors.fullName}
                touched={touched.fullName}
              />
              <ShareInput
                title="Email"
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                error={errors.email}
                touched={touched.email}
              />
              <ShareInput
                title="Phone Number"
                onChangeText={handleChange("phone_number")}
                onBlur={handleBlur("phone_number")}
                value={values.phone_number}
                error={errors.phone_number}
                touched={touched.phone_number}
              />
              <ShareInput
                title="Date of Birth"
                onChangeText={handleChange("date_of_birth")}
                onBlur={handleBlur("date_of_birth")}
                value={values.date_of_birth}
                error={errors.date_of_birth}
                touched={touched.date_of_birth}
                isDatePicker
              />

              <View style={{ alignSelf: "center" }}>
                <ShareButton
                  title={"Lưu thay đổi"}
                  btnStyle={{
                    backgroundColor: APP_COLOR.BROWN,
                    width: "50%",
                    borderWidth: 0.5,
                    borderRadius: 10,
                    borderColor: APP_COLOR.BROWN,
                    marginTop: 20,
                  }}
                  textStyle={{
                    color: APP_COLOR.WHITE,
                    fontSize: 17,
                    marginHorizontal: 20,
                    fontFamily: FONTS.regular,
                  }}
                  onPress={() =>
                    handleUpdateUser(
                      values.id,
                      values.fullName,
                      values.email,
                      values.phone_number,
                      values.date_of_birth
                    )
                  }
                  loading={isSubmitting}
                />
              </View>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 50,
    flex: 1,
  },
});

export default UserInfo;
