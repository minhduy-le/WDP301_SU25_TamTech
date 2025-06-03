import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import {
  Dimensions,
  Image,
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
}
const screenWidth = Dimensions.get("window").width;
const ProductTag = (props: IProductsProps) => {
  return (
    <Pressable>
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
          <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
            <Text
              style={{
                fontFamily: APP_FONT.SEMIBOLD,
                fontSize: 20,
                color: APP_COLOR.ORANGE,
              }}
            >
              {currencyFormatter(props.productPrice)}
            </Text>
            <Text
              style={{
                fontFamily: APP_FONT.REGULAR,
                color: APP_COLOR.BROWN,
                fontSize: 10,
              }}
            >
              {" "}
              VND
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  container: {
    width: screenWidth / 2.3,
    borderWidth: 0.3,
    borderColor: APP_COLOR.BROWN,
    elevation: 1,
    shadowColor: "#000",
    borderRadius: 30,
  },
  img: {
    height: 140,
    width: screenWidth / 2.3,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  textContain: {
    height: 110,
    marginTop: 10,
    alignItems: "center",
  },
  textHeader: {
    fontFamily: APP_FONT.SEMIBOLD,
    color: APP_COLOR.BROWN,
    fontSize: 17,
    marginBottom: 5,
  },
  desText: {
    width: "90%",
    fontFamily: APP_FONT.REGULAR,
    color: APP_COLOR.GREY,
    fontSize: 15,
    marginBottom: 10,
  },
});
export default ProductTag;
