import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Setting = () => {
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
        <View>
          <Pressable
            onPress={() => console.log("hihi")}
            style={{
              paddingVertical: 15,
              paddingHorizontal: 10,
              borderBottomColor: "#eee",
              borderBottomWidth: 1,
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
              }}
            >
              <Feather name="user-check" size={30} color={APP_COLOR.BROWN} />
              <Text style={styles.btnText}>Cập nhật thông tin</Text>
            </View>

            <MaterialIcons
              name="navigate-next"
              size={24}
              color={APP_COLOR.BROWN}
            />
          </Pressable>
        </View>
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
  btnText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.SEMIBOLD,
    fontSize: 17,
  },
});
export default Setting;
