import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { Pressable, StyleSheet, Text, View } from "react-native";

const SlotRegister = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text
          style={[styles.text, { fontFamily: APP_FONT.MEDIUM, fontSize: 15 }]}
        >
          Ngày 16/06/2025
        </Text>
        <Text
          style={[styles.text, { fontFamily: APP_FONT.REGULAR, fontSize: 14 }]}
        >
          Ca sáng
        </Text>
      </View>
      <Pressable style={styles.btn} onPress={() => console.log("Register")}>
        <Text style={styles.btnText}>Đăng ký</Text>
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: APP_COLOR.WHITE,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  text: { color: APP_COLOR.BROWN },
  btn: {
    backgroundColor: APP_COLOR.DONE + "80",
    borderRadius: 10,
    padding: 5,
  },
  btnText: {
    fontFamily: APP_FONT.REGULAR,
    fontSize: 13,
    color: APP_COLOR.WHITE,
  },
});
export default SlotRegister;
