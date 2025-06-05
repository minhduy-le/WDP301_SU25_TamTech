import { APP_COLOR } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import debounce from "debounce";
import { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
interface IProduct {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
}
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const fetchProducts = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setProducts([]);
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
        setProducts([]);
      }
    }, 500),
    []
  );
  const handleChangeText = (text: string) => {
    setSearchTerm(text);
    fetchProducts(text);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress={() => console.log("hihi")} style={styles.container}>
        <EvilIcons
          style={{ marginVertical: "auto", marginLeft: 10 }}
          name="search"
          size={20}
          color={APP_COLOR.BROWN}
        />
        <TextInput
          placeholder="Hôm nay bạn muốn ăn gì nào?"
          placeholderTextColor={APP_COLOR.BROWN}
          style={styles.input}
          onChangeText={handleChangeText}
          value={searchTerm}
        />
      </Pressable>
      <Pressable>
        <View style={styles.filterBtn}>
          <AntDesign name="filter" size={24} color={APP_COLOR.WHITE} />
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_COLOR.WHITE,
    gap: 10,
    flexDirection: "row",
    borderRadius: 30,
    width: "75%",
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
  safeArea: {
    flex: 1,
    flexDirection: "row",
    marginTop: 10,
  },
  filterBtn: {
    height: 50,
    width: 50,
    backgroundColor: APP_COLOR.BROWN,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    marginLeft: 10,
    flex: 1,
  },
});
export default SearchComponent;
