import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
interface IProductsProps {
  productImg: any;
  productName: string;
  productPrice: number;
  productDes: string;
  productQuantity: number;
  onPress?: () => void;
}
const screenWidth = Dimensions.get("window").width;
const ProductTag = (props: IProductsProps) => {
  return (
    <Pressable onPress={props.onPress}>
      <View style={styles.container}>
        <Image source={props.productImg} style={styles.img} />
        <View style={styles.textContain}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.textHeader}
          >
            {props.productName}
          </Text>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.desText}>
            {props.productDes}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {currencyFormatter(props.productPrice)}
            </Text>
            <Text style={styles.currencyText}> VND</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth / 2.3,
    backgroundColor: APP_COLOR.WHITE,
    borderRadius: 30,
    borderWidth: Platform.OS === "android" ? 0.3 : 0,
    borderColor: APP_COLOR.BROWN,

    ...Platform.select({
      ios: {
        shadowColor: APP_COLOR.BLACK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  img: {
    height: 140,
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  textContain: {
    minHeight: 110,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
    flex: 1,
  },
  textHeader: {
    fontFamily: APP_FONT.SEMIBOLD,
    color: APP_COLOR.BROWN,
    fontSize: 19,
    marginBottom: 5,
    width: "100%",
  },
  desText: {
    fontFamily: APP_FONT.REGULAR,
    color: APP_COLOR.GREY,
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    width: "100%",
  },
  priceText: {
    fontFamily: APP_FONT.SEMIBOLD,
    fontSize: 17,
    color: APP_COLOR.ORANGE,
  },
  currencyText: {
    fontFamily: APP_FONT.REGULAR,
    color: APP_COLOR.BROWN,
    fontSize: 10,
    marginLeft: 2,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 700,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: APP_FONT.BOLD,
    color: APP_COLOR.BROWN,
  },
});

export default ProductTag;
