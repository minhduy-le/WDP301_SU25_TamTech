import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { Image, StyleSheet, Text, View } from "react-native";

interface FilterIconProps {
  collectionImg: any;
  collectionName: string;
}

const FilterIcon = (props: FilterIconProps) => {
  return (
    <View style={styles.container}>
      <Image style={styles.img} source={props.collectionImg} />
      <Text style={styles.text}>{props.collectionName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 10,
    justifyContent: "center",
  },
  img: {
    borderRadius: 200,
    height: 70,
    width: 70,
    marginBottom: 5,
    elevation: 1,
    shadowColor: "#000",
    backgroundColor: APP_COLOR.WHITE,
  },
  text: {
    fontSize: 15,
    fontFamily: APP_FONT.MEDIUM,
    color: APP_COLOR.BROWN,
    textAlign: "center",
  },
});

export default FilterIcon;
