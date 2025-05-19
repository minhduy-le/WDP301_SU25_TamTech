import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { router } from "expo-router";
import { APP_COLOR } from "@/utils/constant";

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_COLOR.WHITE,
    gap: 10,
    flexDirection: "row",
    margin: 10,
    borderRadius: 30,
    width: "95%",
    height: 45,
    borderWidth: 1,
    borderColor: APP_COLOR.BROWN,
    marginHorizontal: "auto",
    marginTop: Platform.OS === "android" ? 25 : 0,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
});
const SearchHome = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable
        onPress={() => router.navigate("/(auth)/search")}
        style={styles.container}
      >
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
          Chọn địa chỉ bạn muốn giao đến
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default SearchHome;
