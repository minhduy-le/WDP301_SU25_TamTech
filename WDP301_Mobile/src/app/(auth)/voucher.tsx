import { useEffect, useState } from "react";
import VoucherComponent from "@/components/account/user.voucher";
import { FONTS } from "@/theme/typography";
import { APP_COLOR, API_URL } from "@/utils/constant";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Voucher = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        let userId = "";
        if (token) {
          const decoded: any = jwtDecode(token);
          userId = decoded.id;
        }
        if (!userId) return setVouchers([]);
        const res = await axios.get(
          `${API_URL}/api/promotions/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "*/*",
            },
          }
        );
        setVouchers(res.data);
      } catch (e) {
        setVouchers([]);
      }
    };
    fetchVouchers();
  }, []);
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 10,
        }}
      >
        <Pressable
          onPress={() => router.navigate("/(tabs)")}
          style={{ flex: 0.5 }}
        >
          <AntDesign name="arrowleft" size={24} color={APP_COLOR.BROWN} />
        </Pressable>
        <Text style={styles.text}>Mã ưu đãi của tôi</Text>
      </View>
      <FlatList
        data={vouchers}
        renderItem={({ item }) => (
          <VoucherComponent
            code={item.name}
            description={`Giảm ${item.discountAmount.toLocaleString()}đ`}
            date={
              item.endDate ? new Date(item.endDate).toLocaleDateString() : ""
            }
            promotionId={item.promotionId}
          />
        )}
        keyExtractor={(item) => item.promotionId?.toString() || item.code}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  text: {
    alignSelf: "center",
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: APP_COLOR.BROWN,
    marginVertical: 20,
  },
});
export default Voucher;
