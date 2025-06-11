import ordersuccess from "@/assets/order_success.png";
import ShareButton from "@/components/btnComponent/shareBtn";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { useCurrentApp } from "@/context/app.context";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderSuccess = () => {
  const { setCart } = useCurrentApp();
  return (
    <>
      <SafeAreaView style={styles.containers}>
        <Text style={styles.topHeader}>Thanh toán thành công</Text>
        <Image source={ordersuccess} style={{ height: 300, width: 300 }} />
        <Text
          style={{
            fontFamily: APP_FONT.SEMIBOLD,
            color: APP_COLOR.BROWN,
            fontSize: 20,
            marginBottom: 10,
          }}
        >
          Tấm Tắc xin chân thành cảm ơn bạn
        </Text>
        <Text style={styles.text}>
          Đơn hàng được khởi tạo lúc 13:46 27/01/2025
        </Text>
        <Text style={styles.text}>Mã đơn hàng: #1524267123</Text>
        <Text style={styles.text}>
          Hãy chú ý điện thoại trong quá trình giao hàng nhé!!!
        </Text>
        <View style={styles.btnView}>
          <ShareButton
            title="Về Trang Chủ"
            onPress={() => {
              setCart(0), router.replace("/(tabs)/homepage");
            }}
            btnStyle={{ backgroundColor: APP_COLOR.BROWN }}
            textStyle={styles.btnText}
          />
          <ShareButton
            title="Theo Dõi Đơn"
            onPress={() => router.navigate("/(tabs)/order.history")}
            btnStyle={{ backgroundColor: APP_COLOR.BROWN }}
            textStyle={styles.btnText}
          />
        </View>
      </SafeAreaView>
    </>
  );
};
const styles = StyleSheet.create({
  containers: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  topHeader: {
    fontSize: 25,
    fontFamily: APP_FONT.BOLD,
    color: APP_COLOR.BROWN,
  },
  text: {
    fontFamily: APP_FONT.REGULAR,
    color: APP_COLOR.BROWN,
    fontSize: 16,
    width: "95%",
    textAlign: "center",
    marginVertical: 1,
  },
  btnView: {
    flexDirection: "row",
    gap: 10,
  },
  btnText: {
    color: APP_COLOR.WHITE,
    fontFamily: APP_FONT.REGULAR,
    fontSize: 17,
  },
});
export default OrderSuccess;
