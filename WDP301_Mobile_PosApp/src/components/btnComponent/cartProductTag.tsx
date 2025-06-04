import { APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import { Image, StyleSheet, Text, View } from "react-native";

interface IProductCart {
  productImg: any;
  productName: string;
  productQuantity: number;
  productPrice: number;
  productDes?: string;
}

const CartProductTag = (props: IProductCart) => {
  return (
    <View style={styles.container}>
      <Image source={props.productImg} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{props.productName}</Text>
        <Text style={styles.itemsText}>
          {props.productQuantity} Item{props.productQuantity > 1 ? "s" : ""}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.price}>
            <Text style={styles.priceValue}>
              {currencyFormatter(props.productPrice)}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 8,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: "contain",
    backgroundColor: "#f5f5f5",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  productDes: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  itemsText: {
    fontSize: 13,
    color: "#F8A91F",
    fontWeight: "500",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 13,
    color: "#222",
    fontWeight: "500",
  },
  price: {
    fontSize: 18,
    color: "#F8A91F",
    fontWeight: "bold",
  },
  priceValue: {
    fontSize: 18,
    color: "#F8A91F",
    fontFamily: APP_FONT.SEMIBOLD,
  },
});

export default CartProductTag;
