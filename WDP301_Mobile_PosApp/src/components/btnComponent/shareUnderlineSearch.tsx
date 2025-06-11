import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import debounce from "debounce";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
interface ICustomer {
  cusName: string;
  cusPhone: string;
  cusAddress: string;
}
const ShareUnderlineInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const fetchProducts = useCallback(
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
    fetchProducts(text);
  };
  return (
    <Pressable onPress={() => console.log("hihi")} style={{ marginTop: 10 }}>
      <Text
        style={{
          color: APP_COLOR.BROWN,
          fontSize: 15,
          fontFamily: APP_FONT.MEDIUM,
        }}
      >
        SĐT khách hàng
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
        <View style={styles.container}>
          <TextInput
            style={{ fontFamily: APP_FONT.REGULAR }}
            placeholder="Nhập sdt khách hàng"
            placeholderTextColor={APP_COLOR.ORANGE}
            onChangeText={handleChangeText}
            value={searchTerm}
          />
        </View>
        <Pressable onPress={() => console.log("add new customer")}>
          <AntDesign name="pluscircle" size={28} color={APP_COLOR.BROWN} />
        </Pressable>
      </View>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  container: {
    borderBottomColor: APP_COLOR.BROWN,
    borderBottomWidth: 0.5,
    width: 200,
  },
});
export default ShareUnderlineInput;
