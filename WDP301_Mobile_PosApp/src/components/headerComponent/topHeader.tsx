import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
const TopHeader = () => {
  return (
    <View style={styles.container}>
      <FontAwesome6 name="bars" size={24} color={APP_COLOR.BROWN} />
      <Pressable
        style={styles.locationContent}
        onPress={() => console.log("Địa chỉ nè")}
      >
        <Entypo name="location-pin" size={24} color="red" />
        <Text style={styles.locationText}>Ho Chi Minh City</Text>
        <Octicons name="chevron-down" size={20} color={APP_COLOR.BROWN} />
      </Pressable>
      <MaterialIcons name="settings" size={24} color={APP_COLOR.BROWN} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  locationContent: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  locationText: {
    fontFamily: APP_FONT.REGULAR,
    fontSize: 17,
    color: APP_COLOR.BROWN,
    position: "relative",
    top: 3,
  },
});
export default TopHeader;
