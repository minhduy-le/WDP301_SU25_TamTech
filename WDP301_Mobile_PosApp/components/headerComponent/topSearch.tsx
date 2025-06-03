import { APP_COLOR } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SearchComponent = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress={() => console.log("hihi")} style={styles.container}>
        <EvilIcons
          style={{ marginVertical: "auto", marginLeft: 10 }}
          name="search"
          size={20}
          color={APP_COLOR.BROWN}
        />
        <Text
          style={{
            color: APP_COLOR.BROWN,
            marginVertical: "auto",
          }}
        >
          Chọn món ăn bạn cần tìm
        </Text>
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
    marginTop: 10,
  },
  safeArea: {
    flex: 1,
    flexDirection: "row",
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
  filterBtn: {
    height: 50,
    width: 50,
    backgroundColor: APP_COLOR.BROWN,
    marginTop: 5,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
export default SearchComponent;
