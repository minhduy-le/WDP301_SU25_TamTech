import { Pressable, StyleSheet, Text, View } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { router } from "expo-router";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#eee",
    gap: 5,
    flexDirection: "row",
    margin: 5,
    paddingHorizontal: 3,
    paddingVertical: 7,
    borderRadius: 3,
  },
});
const SearchHome = () => {
  return (
    <Pressable
      onPress={() => router.navigate("/(auth)/search")}
      style={styles.container}
    >
      <EvilIcons name="search" size={20} color="black" />
      <Text
        style={{
          color: "#707070",
        }}
      >
        Chọn địa chỉ bạn muốn giao đến
      </Text>
    </Pressable>
  );
};

export default SearchHome;
