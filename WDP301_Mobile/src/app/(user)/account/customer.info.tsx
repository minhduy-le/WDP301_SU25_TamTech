import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TextInput,
  Pressable,
} from "react-native";
import { Formik } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import ShareButton from "@/components/button/share.button";
import CustomerInforInput from "@/components/input/customerInfo.input";
import { FONTS } from "@/theme/typography";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import { ChangePasswordSchema } from "@/utils/validate.schema";
import { router } from "expo-router";
import debounce from "debounce";

const CustomerInfoPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: 20,
      gap: 10,
    },
  });

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.id);
        } else {
          console.log("No access token found.");
        }
      } catch (error) {
        console.error("Error retrieving or decoding access token:", error);
      }
    };
    getAccessToken();
  }, []);

  const handleImportInfo = async (
    fullName: string,
    address: string,
    phone: string,
    isDefault: boolean,
    userId: string | null
  ) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/information/${userId}`, {
        userId: userId,
        fullName: fullName,
        address: address,
        phone: phone,
        isDefault: isDefault,
      });

      if (response.data) {
        router.replace("/(user)/product/place.order");
      } else {
        console.log("Error in API response:", response.status);
      }
    } catch (error) {
      console.error("Error in API call:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(
    debounce(async (text: string) => {
      setSearchTerm(text);
      if (!text) return;
      const res = await axios.get(
        `https://maps.gomaps.pro/maps/api/place/queryautocomplete/json?input=${text}&language=vi&key=AlzaSyNOiNuM9dYaAZxahUvMvBOIjx4xyOSi3yr`
      );
      if (res.data) {
        setAddressSuggestions(res.data.predictions);
      }
    }, 500),
    []
  );

  const handleSelectAddress = (address: string) => {
    setSearchTerm(address);
    setAddressSuggestions([]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        validationSchema={ChangePasswordSchema}
        initialValues={{
          fullName: "",
          address: "",
          phone: "",
          isDefault: false,
          userId: userId || "",
        }}
        onSubmit={(values) => {
          handleImportInfo(
            values.fullName,
            values.address,
            values.phone,
            values.isDefault,
            values.userId
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
          setFieldValue,
        }) => {
          useEffect(() => {
            if (userId) {
              setFieldValue("userId", userId);
            }
          }, [userId]);

          return (
            <View style={styles.container}>
              <CustomerInforInput
                title="Họ và Tên"
                onChangeText={handleChange("fullName")}
                onBlur={handleBlur("fullName")}
                value={values.fullName}
                error={errors.fullName}
                touched={touched.fullName}
              />
              <View>
                <Text style={{ fontFamily: FONTS.regular }}>Địa chỉ</Text>
                <TextInput
                  placeholder="Nhập địa chỉ"
                  onChangeText={(text) => {
                    setSearchTerm(text);
                    handleSearch(text);
                  }}
                  value={searchTerm}
                  style={{
                    borderWidth: 1,
                    borderColor: APP_COLOR.GREY,
                    borderRadius: 10,
                    padding: 6,
                    marginTop: 5,
                    backgroundColor: "white",
                    marginHorizontal: 5,
                  }}
                />
                {addressSuggestions.length > 0 && (
                  <FlatList
                    data={addressSuggestions}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => handleSelectAddress(item.description)}
                      >
                        <View
                          style={{
                            padding: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: "#eee",
                          }}
                        >
                          <Text>{item.description}</Text>
                        </View>
                      </Pressable>
                    )}
                  />
                )}
              </View>
              <CustomerInforInput
                title="Số điện thoại"
                onChangeText={handleChange("phone")}
                onBlur={handleBlur("phone")}
                value={values.phone}
                error={errors.phone}
                touched={touched.phone}
              />
              <CustomerInforInput
                title="Đặt làm mặc định"
                value={values.isDefault}
                setValue={(v) => setFieldValue("isDefault", v)}
                isBoolean={true}
              />
              <ShareButton
                loading={loading}
                title="Tạo địa chỉ mới"
                onPress={() => {
                  handleImportInfo(
                    values.fullName,
                    searchTerm,
                    values.phone,
                    values.isDefault,
                    values.userId
                  );
                }}
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
            </View>
          );
        }}
      </Formik>
    </SafeAreaView>
  );
};

export default CustomerInfoPage;
