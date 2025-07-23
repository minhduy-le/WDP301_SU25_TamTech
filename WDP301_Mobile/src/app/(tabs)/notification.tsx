import BlinkingBadge from "@/components/notification/blinkingNoti";
import StaffNotification from "@/components/notification/staffNotification";
import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
const Notification = () => {
  return (
    <View style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}>
      <LinearGradient
        style={styles.gradientContainer}
        colors={[APP_COLOR.BACKGROUND_ORANGE, APP_COLOR.WHITE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                marginRight: 5,
                borderRadius: 10,
                backgroundColor: APP_COLOR.BROWN,
                padding: 5,
              }}
            >
              <Ionicons
                name="notifications"
                size={30}
                color={APP_COLOR.WHITE}
              />
              <View style={{ position: "absolute", top: -5, right: 0 }}>
                <BlinkingBadge count={3} />
              </View>
            </View>
            <View>
              <Text
                style={{
                  color: APP_COLOR.BROWN,
                  fontSize: 20,
                  fontFamily: FONTS.bold,
                }}
              >
                Thông báo
              </Text>
              <Text
                style={{
                  color: APP_COLOR.BROWN,
                  fontSize: 15,
                  fontFamily: FONTS.regular,
                }}
              >
                Bạn có 3 thông báo mới
              </Text>
            </View>
          </View>
          <StaffNotification />
        </View>
      </LinearGradient>
    </View>
  );
};
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
export default Notification;
