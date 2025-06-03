import { ScrollView, StyleSheet } from "react-native";
import ProductTag from "../ProductTag";

const dataSample = [
  {
    id: "1",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm sườn",
    productDes:
      "Cơm tấm với miếng sườn nướng đậm đà, ăn kèm đồ chua và nước mắm.",
    productPrice: 100000,
  },
  {
    id: "2",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm chả",
    productDes: "Cơm tấm thơm dẻo ăn cùng chả trứng hấp mềm, béo ngậy.",
    productPrice: 90000,
  },
  {
    id: "3",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm ba rọi",
    productDes: "Cơm tấm nóng hổi với thịt ba rọi quay giòn rụm hoặc luộc mềm.",
    productPrice: 95000,
  },
  {
    id: "4",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm sườn bì chả",
    productDes:
      "Đĩa cơm tấm đầy đủ với sườn nướng, bì thái sợi và chả trứng hấp.",
    productPrice: 120000,
  },
  {
    id: "5",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm sườn chả",
    productDes:
      "Sự kết hợp tuyệt vời giữa sườn nướng thơm lừng và chả trứng béo ngậy.",
    productPrice: 110000,
  },
  {
    id: "6",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm bì chả",
    productDes: "Cơm tấm dẻo thơm cùng bì heo thái sợi và chả trứng hấp.",
    productPrice: 85000,
  },
  {
    id: "7",
    productImg: require("@/assets/data/comtam.jpg"),
    productName: "Cơm tấm đặc biệt (full topping)",
    productDes:
      "Thưởng thức trọn vẹn hương vị với sườn, bì, chả, trứng ốp la và đồ chua.",
    productPrice: 150000,
  },
];
const CollectionList = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {dataSample.map((item, index) => (
        <ProductTag
          key={index}
          productImg={item.productImg}
          productName={item.productName}
          productPrice={item.productPrice}
          productDes={item.productDes}
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
