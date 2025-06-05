import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const dataSample = {
  staffName: "Lê Minh Duy",
  staffCounter: "TP.Hồ Chí Minh",
};
const OrderHistory = () => {
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
        <StaffHeader
          staffName={dataSample.staffName}
          staffCounter={dataSample.staffCounter}
        />
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
export default OrderHistory;
