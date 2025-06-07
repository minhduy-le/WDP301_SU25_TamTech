import ManageStoreCard from "@/components/cardStaff/manageStoreCard";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ManageStore = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        style={styles.gradientContainer}
        colors={[APP_COLOR.BACKGROUND_ORANGE, APP_COLOR.WHITE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <ScrollView>
          <StaffHeader />
          <View style={styles.componentsContent}>
            <ManageStoreCard title="Tổng sản phẩm" />
            <ManageStoreCard title="Còn hàng" />
          </View>
          <View style={styles.componentsContent}>
            <ManageStoreCard title="Sắp hết" />
            <ManageStoreCard title="Hết hàng" />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  componentsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
});
export default ManageStore;
