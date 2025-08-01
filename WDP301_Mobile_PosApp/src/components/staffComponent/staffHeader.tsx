import logo from "@/assets/data/logo.png";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
interface IStaff {
  staffName?: string;
  staffCounter?: string;
}
const StaffHeader = (props: IStaff) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 10,
        gap: 10,
        alignItems: "center",
        backgroundColor: "rgb(0, 0, 0, 0.5)",
        borderRadius: 13,
      }}
    >
      <Image source={logo} style={{ width: 105, height: 70 }} />
      <View>
        <View style={styles.infoContent}>
          <MaterialIcons
            name="account-circle"
            size={24}
            color={APP_COLOR.BROWN}
          />
          <Text style={styles.text}>
            {props.staffName ? props.staffName : "Lê Minh Duy"}
          </Text>
        </View>
        <View style={styles.infoContent}>
          <FontAwesome5 name="store" size={20} color={APP_COLOR.BROWN} />
          <Text style={styles.text}>
            {props.staffCounter ? props.staffCounter : "NVH Sinh Viên"}
          </Text>
        </View>
      </View>
      <Pressable onPress={() => router.navigate("/(tabs)/notification")}>
        <Ionicons name="notifications" size={30} color={APP_COLOR.BROWN} />
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  text: {
    fontFamily: APP_FONT.REGULAR,
    color: APP_COLOR.BROWN,
    fontSize: 17,
  },
  infoContent: { flexDirection: "row", gap: 10, marginVertical: 2.5 },
});
export default StaffHeader;
