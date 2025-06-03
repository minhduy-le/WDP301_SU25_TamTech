import { ScrollView, StyleSheet } from "react-native";
import FilterIcon from "../btnComponent/filterIcon";

const dataSample = [
  {
    id: "1",
    collectionImg: require("@/assets/data/fastfood.png"),
    collectionName: "Tất cả",
  },
  {
    id: "2",
    collectionImg: require("@/assets/data/bun-pho.png"),
    collectionName: "Món chính",
  },
  {
    id: "3",
    collectionImg: require("@/assets/data/korean-food.png"),
    collectionName: "Thức uống",
  },
  {
    id: "4",
    collectionImg: require("@/assets/data/rice.png"),
    collectionName: "Ăn kèm",
  },
  {
    id: "5",
    collectionImg: require("@/assets/data/sub-sandiwch.png"),
    collectionName: "Canh",
  },
];

const TopList = () => {
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}
    >
      {dataSample.map((item, index) => (
        <FilterIcon
          key={index}
          collectionImg={item.collectionImg}
          collectionName={item.collectionName}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default TopList;
