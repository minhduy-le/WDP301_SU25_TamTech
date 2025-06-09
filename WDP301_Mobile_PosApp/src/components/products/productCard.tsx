import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import { StyleSheet, Text, View } from "react-native";
interface IProduct {
  productId?: string;
  productName?: string;
  productPrice?: number;
}
const ProductCard = (props: IProduct) => {
  return (
    <View
      style={[
        styles.container,
        {
          marginHorizontal: 10,
        },
      ]}
    >
      <Text
        style={[styles.text, { fontFamily: APP_FONT.SEMIBOLD, fontSize: 17 }]}
      >
        {props.productName ? props.productName : "Cơm tấm ba rọi"}
      </Text>
      <View style={styles.container}>
        <Text
          style={{
            fontFamily: APP_FONT.BOLD,
            fontSize: 20,
            color: APP_COLOR.ORANGE,
          }}
        >
          {props.productPrice ? props.productPrice : currencyFormatter(100000)}
          {"  "}
        </Text>
        <Text style={[styles.text, { fontFamily: APP_FONT.MEDIUM }]}>
          {props.productId ? props.productId : "X1"}
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: APP_COLOR.BROWN,
  },
});
export default ProductCard;
