import OrderCard from "@/components/cardStaff/orderConfirmCard";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import debounce from "debounce";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface IOrder {
  orderName: string;
  orderId: string;
  date: string;
  orderStatus: boolean;
}
const ConfirmOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<IOrder[]>([]);
  const fetchOrders = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setOrders([]);
        return;
      }
      try {
        // const res = await axios.get(
        //   `${BASE_URL}/products?page=0&size=10&keyword=${text}`
        // );
        // if (res.data?.data?.content) {
        //   setProducts(res.data.data.content);
        // } else {
        //   setProducts([]);
        // }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setOrders([]);
      }
    }, 500),
    []
  );
  const handleChangeText = (text: string) => {
    setSearchTerm(text);
    fetchOrders(text);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        style={styles.gradientContainer}
        colors={[APP_COLOR.BACKGROUND_ORANGE, APP_COLOR.WHITE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <StaffHeader />
        <ScrollView>
          <View
            style={{
              marginLeft: 5,
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
            }}
          >
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderColor: APP_COLOR.BROWN,
                borderWidth: 0.5,
                borderRadius: 30,
                paddingVertical: 3,
                ...Platform.select({
                  ios: {
                    paddingVertical: 10,
                  },
                }),
                backgroundColor: APP_COLOR.WHITE,
                marginTop: 10,
                width: "75%",
                paddingHorizontal: 5,
                marginHorizontal: 7,
                marginBottom: 10,
              }}
              onPress={() => console.log("hihi")}
            >
              <EvilIcons name="search" size={20} color={APP_COLOR.BROWN} />
              <TextInput
                placeholder="Nhập tên/mã sản phẩm"
                placeholderTextColor={APP_COLOR.BROWN}
                onChangeText={handleChangeText}
                value={searchTerm}
              />
            </Pressable>
            <Pressable>
              <View style={styles.filterBtn}>
                <AntDesign name="filter" size={24} color={APP_COLOR.WHITE} />
              </View>
            </Pressable>
          </View>
          <View style={{ marginBottom: 10 }}>
            <OrderCard />
            <OrderCard />
            <OrderCard />
            <OrderCard />
            <OrderCard />
            <OrderCard />
            <OrderCard />
            <OrderCard />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  filterBtn: {
    height: 50,
    width: 50,
    backgroundColor: APP_COLOR.BROWN,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
export default ConfirmOrder;
