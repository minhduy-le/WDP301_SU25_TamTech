import { FONTS } from "@/theme/typography";
import { APP_COLOR, API_URL } from "@/utils/constant";
import { useLocalSearchParams } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";

const VoucherDetailsPage = () => {
  const { id } = useLocalSearchParams();
  const [voucher, setVoucher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width;
  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const res = await axios.get(`${API_URL}/api/promotions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        });
        setVoucher(res.data);
      } catch (e) {
        setVoucher(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVoucher();
  }, [id]);

  if (loading)
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color={APP_COLOR.ORANGE}
      />
    );
  if (!voucher)
    return (
      <Text
        style={{ color: APP_COLOR.CANCEL, textAlign: "center", marginTop: 40 }}
      >
        Không tìm thấy thông tin voucher
      </Text>
    );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: APP_COLOR.WHITE }}>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
          flex: 0.4,
        }}
      >
        {voucher.barcode ? (
          <Image
            source={{ uri: voucher.barcode }}
            style={{ height: 200, width: screenWidth }}
            resizeMode="contain"
          />
        ) : null}
      </View>
      <View
        style={{
          position: "relative",
          top: -20,
          backgroundColor: APP_COLOR.WHITE,
          marginHorizontal: 30,
          alignItems: "center",
          shadowColor: "#000",
          padding: 15,
          borderRadius: 10,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: APP_COLOR.CANCEL + "90",
            borderRadius: 30,
            alignItems: "center",
            marginHorizontal: "auto",
            marginBottom: 5,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.medium,
              color: APP_COLOR.WHITE,
              fontSize: 13,
            }}
          >
            {voucher.code}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: FONTS.bold,
            textAlign: "center",
            fontSize: 20,
            marginBottom: 5,
          }}
        >
          {voucher.name}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.medium,
            textAlign: "center",
            marginBottom: 5,
          }}
        >
          {voucher.description}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.regular,
            color: APP_COLOR.BROWN,
            fontSize: 15,
            marginBottom: 5,
          }}
        >
          Giảm: {voucher.discountAmount?.toLocaleString()}đ
        </Text>
        <Text
          style={{
            fontFamily: FONTS.regular,
            color: APP_COLOR.BROWN,
            fontSize: 13,
          }}
        >
          HSD:{" "}
          {voucher.endDate
            ? new Date(voucher.endDate).toLocaleDateString()
            : ""}
        </Text>
      </View>
      <View style={{ marginHorizontal: 10 }}>
        <Text
          style={{
            fontFamily: FONTS.medium,
            color: APP_COLOR.BROWN,
            fontSize: 16,
            marginTop: 10,
          }}
        >
          Quy định sử dụng ưu đãi
        </Text>
        <View style={{ marginTop: 10, marginHorizontal: 10 }}>
          <Text style={styles.text}>
            + Đơn tối thiểu: {voucher.minOrderAmount?.toLocaleString()}đ
          </Text>
          <Text style={styles.text}>
            + Số lần sử dụng: {voucher.NumberCurrentUses} /{" "}
            {voucher.maxNumberOfUses}
          </Text>
          <Text style={styles.text}>
            + Trạng thái: {voucher.isActive ? "Còn hiệu lực" : "Hết hạn"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.regular,
    marginVertical: 2.5,
  },
});
export default VoucherDetailsPage;
