import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;
interface ITitle {
  title?: string;
}
const ManageStoreCard = (props: ITitle) => {
  return (() => {
    switch (props.title) {
      case "Tổng sản phẩm":
        return (
          <View style={styles.container}>
            <View style={styles.labelView}>
              <Text style={styles.labelTitle}>Tổng sản phẩm</Text>
              <View
                style={[styles.labelContent, { backgroundColor: "#3B82F6" }]}
              >
                <Feather name="box" size={21} color={APP_COLOR.WHITE} />
              </View>
            </View>
            <View>
              <Text style={styles.numberText}>55</Text>
              <Text style={styles.text}>Sản phẩm tại cửa hàng</Text>
            </View>
          </View>
        );
      case "Còn hàng":
        return (
          <View style={styles.container}>
            <View style={styles.labelView}>
              <Text style={styles.labelTitle}>Còn hàng</Text>
              <View
                style={[styles.labelContent, { backgroundColor: "#22C55E" }]}
              >
                <AntDesign
                  name="checkcircleo"
                  size={21}
                  color={APP_COLOR.WHITE}
                />
              </View>
            </View>
            <View>
              <Text style={styles.numberText}>50</Text>
              <Text style={styles.text}>Sản phẩm đủ tồn kho</Text>
            </View>
          </View>
        );
      case "Sắp hết":
        return (
          <View style={styles.container}>
            <View style={styles.labelView}>
              <Text style={styles.labelTitle}>Sắp hết</Text>
              <View
                style={[styles.labelContent, { backgroundColor: "#EAB308" }]}
              >
                <AntDesign name="warning" size={21} color={APP_COLOR.WHITE} />
              </View>
            </View>
            <View>
              <Text style={styles.numberText}>3</Text>
              <Text style={styles.text}>Cần nhập thêm hàng</Text>
            </View>
          </View>
        );
      case "Hết hàng":
        return (
          <View style={styles.container}>
            <View style={styles.labelView}>
              <Text style={styles.labelTitle}>Hết hàng</Text>
              <View
                style={[
                  styles.labelContent,
                  { backgroundColor: APP_COLOR.CANCEL },
                ]}
              >
                <Entypo name="dropbox" size={21} color={APP_COLOR.WHITE} />
              </View>
            </View>
            <View>
              <Text style={styles.numberText}>2</Text>
              <Text style={styles.text}>Cần nhập hàng ngay</Text>
            </View>
          </View>
        );
      default:
        return <></>;
    }
  })();
};
const styles = StyleSheet.create({
  container: {
    width: screenWidth * 0.45,
    backgroundColor: APP_COLOR.WHITE,
    height: screenHeight * 0.13,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  labelView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  labelContent: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  labelTitle: {
    fontFamily: APP_FONT.BOLD,
    fontSize: 13,
    color: APP_COLOR.BROWN,
  },
  numberText: {
    color: APP_COLOR.ORANGE,
    fontFamily: APP_FONT.SEMIBOLD,
    fontSize: 20,
  },
  text: {
    color: APP_COLOR.BROWN,
    fontSize: 13,
    fontFamily: APP_FONT.REGULAR,
  },
});
export default ManageStoreCard;
