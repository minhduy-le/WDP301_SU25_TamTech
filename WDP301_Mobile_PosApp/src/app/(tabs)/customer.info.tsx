import SearchCustomerInfo from "@/components/cardStaff/searchCustomerInfo";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR } from "@/constants/Colors";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import debounce from "debounce";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface ICustomers {
  cusName?: string;
  cusPhone?: string;
  cusEmail: string;
}
const CustomerInfor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<ICustomers[]>([]);
  const fetchCustomers = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setCustomers([]);
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
        setCustomers([]);
      }
    }, 500),
    []
  );
  const handleChangeText = (text: string) => {
    setSearchTerm(text);
    fetchCustomers(text);
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <LinearGradient
        style={styles.gradientContainer}
        colors={[APP_COLOR.BACKGROUND_ORANGE, APP_COLOR.WHITE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <StaffHeader />
        <Pressable onPress={() => console.log("hihi")} style={styles.container}>
          <EvilIcons
            style={{ marginVertical: "auto", marginLeft: 10 }}
            name="search"
            size={20}
            color={APP_COLOR.BROWN}
          />
          <TextInput
            placeholder="Nhập sdt/email của khách hàng"
            placeholderTextColor={APP_COLOR.BROWN}
            style={styles.input}
            onChangeText={handleChangeText}
            value={searchTerm}
          />
        </Pressable>
        <SearchCustomerInfo />
      </LinearGradient>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  container: {
    backgroundColor: APP_COLOR.WHITE,
    gap: 10,
    flexDirection: "row",
    borderRadius: 30,
    height: 45,
    borderWidth: 1,
    borderColor: APP_COLOR.BROWN,
    marginHorizontal: 17,
    marginTop: 3,
    ...Platform.select({
      ios: {
        shadowColor: APP_COLOR.BLACK,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    marginLeft: 10,
    flex: 1,
  },
});
export default CustomerInfor;
