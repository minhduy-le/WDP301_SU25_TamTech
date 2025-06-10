import { ScrollView, StyleSheet } from "react-native";
import ProductTag from "../ProductTag";

const dataSample = [
  {
    id: "1",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm sườn",
    productDes:
      "Cơm tấm với miếng sườn nướng đậm đà, ăn kèm đồ chua và nước mắm.",
    productQuantity: 10,
    productPrice: 100000,
  },
  {
    id: "2",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm chả",
    productDes: "Cơm tấm thơm dẻo ăn cùng chả trứng hấp mềm, béo ngậy.",
    productQuantity: 10,
    productPrice: 90000,
  },
  {
    id: "3",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm ba rọi",
    productDes: "Cơm tấm nóng hổi với thịt ba rọi quay giòn rụm hoặc luộc mềm.",
    productQuantity: 10,
    productPrice: 95000,
  },
  {
    id: "4",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm sườn bì chả",
    productDes:
      "Đĩa cơm tấm đầy đủ với sườn nướng, bì thái sợi và chả trứng hấp.",
    productQuantity: 10,
    productPrice: 120000,
  },
  {
    id: "5",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm sườn chả",
    productDes:
      "Sự kết hợp tuyệt vời giữa sườn nướng thơm lừng và chả trứng béo ngậy.",
    productQuantity: 10,
    productPrice: 110000,
  },
  {
    id: "6",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm bì chả",
    productDes: "Cơm tấm dẻo thơm cùng bì heo thái sợi và chả trứng hấp.",
    productQuantity: 10,
    productPrice: 85000,
  },
  {
    id: "7",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm đặc biệt",
    productDes:
      "Thưởng thức trọn vẹn hương vị với sườn, bì, chả, trứng ốp la và đồ chua.",
    productQuantity: 10,
    productPrice: 150000,
  },
];
const CollectionList = ({
  onProductPress,
}: {
  onProductPress: (product: any) => void;
}) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {dataSample.map((item, index) => (
        <ProductTag
          key={index}
          productImg={item.productImg}
          productName={item.productName}
          productPrice={item.productPrice}
          productDes={item.productDes}
          productQuantity={item.productQuantity}
          onPress={() => onProductPress(item)}
        />
      ))}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  scrollViewContent: {
    gap: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
export default CollectionList;
