import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import { StyleSheet, Text, View } from "react-native";
interface IOrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}
const StaffOrderCard = (props: IOrderItem) => {
  return (
    <View style={styles.container}>
      <Text style={styles.itemName}>{props.name}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={styles.itemPrice}>{currencyFormatter(props.price)}</Text>
        <Text style={styles.itemQuantity}>X {props.quantity}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  itemName: {
    color: APP_COLOR.BROWN,
    fontSize: 15,
    fontFamily: APP_FONT.MEDIUM,
  },
  itemPrice: {
    color: APP_COLOR.ORANGE,
    fontSize: 17,
    fontFamily: APP_FONT.MEDIUM,
  },
  itemQuantity: {
    color: APP_COLOR.GREY,
    opacity: 0.8,
    fontSize: 13,
    marginLeft: 5,
  },
});
export default StaffOrderCard;
