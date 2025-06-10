import { APP_COLOR, APP_FONT } from "@/constants/Colors";
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
        <Text style={styles.itemsText}>{props.productQuantity} Phần</Text>
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Thành tiền</Text>
          <Text style={styles.priceValue}>
            {currencyFormatter(props.productPrice)}
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
    paddingHorizontal: 10,
    marginHorizontal: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 5,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: "cover",
    backgroundColor: "#f5f5f5",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontFamily: APP_FONT.BOLD,
    color: APP_COLOR.BROWN,
  },
  itemsText: {
    fontSize: 13,
    color: APP_COLOR.ORANGE,
    fontFamily: APP_FONT.SEMIBOLD,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 13,
    color: APP_COLOR.GREY,
    fontFamily: APP_FONT.SEMIBOLD,
  },

  priceValue: {
    fontSize: 18,
    color: APP_COLOR.ORANGE,
    fontFamily: APP_FONT.MEDIUM,
  },
});

export default CartProductTag;
