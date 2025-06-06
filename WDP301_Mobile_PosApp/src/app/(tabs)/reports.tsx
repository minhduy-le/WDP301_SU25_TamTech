import StaffReports from "@/components/cardStaff/staffReports";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const currentTime = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString().padStart(2, "0");
  return `${day}/${month}/${year}`;
};
const Reports = () => {
  const curentTime = currentTime();
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
        <View
          style={{
            backgroundColor: APP_COLOR.WHITE,
            borderRadius: 10,
            paddingVertical: 10,
            paddingLeft: 10,
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: APP_COLOR.BROWN,
              fontFamily: APP_FONT.SEMIBOLD,
              fontSize: 17,
            }}
          >
            Doanh thu ngày {curentTime}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <StaffReports
            title="Doanh số bán hàng"
            number={1000000}
            percent={12.5}
          />
          <StaffReports title="Số đơn hàng" number={101} percent={-5.5} />
        </View>
        <View style={{ flexDirection: "row" }}>
          <StaffReports title="Trung bình mỗi đơn" number={23645} percent={0} />
          <StaffReports title="Số khách ghé quán" number={32} percent={13.5} />
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
});
export default Reports;
