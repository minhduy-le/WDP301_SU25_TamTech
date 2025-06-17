import OrderCard from "@/components/cardStaff/orderConfirmCard";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

const ShippingOrder = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.gradientContainer}
        colors={[APP_COLOR.BACKGROUND_ORANGE, APP_COLOR.WHITE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <StaffHeader />
        <OrderCard isShipper={true} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
export default ShippingOrder;
