import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import BannerHome from "./banner.home";
import { APP_COLOR } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
import { useRouter } from "expo-router";
const icon = [
  {
    key: 1,
    name: "Best Seller",
    source: require("@/assets/icons/com-tam.png"),
    targetScreen: "bestseller",
  },
  {
    key: 2,
    name: "Cửa hàng",
    source: require("@/assets/icons/cua-hang.png"),
    targetScreen: "store",
  },
  {
    key: 3,
    name: "Ưu Đãi",
    source: require("@/assets/icons/qua-tang.png"),
    targetScreen: "voucher",
  },
  {
    key: 4,
    name: "Đơn Hàng",
    source: require("@/assets/icons/don-hang.png"),
    targetScreen: "order",
  },
  {
    key: 5,
    name: "Thông tin",
    source: require("@/assets/icons/thong-tin.png"),
    targetScreen: "account",
  },
  {
    key: 6,
    name: "Thông báo",
    source: require("@/assets/icons/thong-bao.png"),
    targetScreen: "notification",
  },
];
const IconItem = ({ item }: any) => {
  const router = useRouter();
  const handlePress = () => {
    router.push(item.targetScreen);
  };
  return (
    <TouchableOpacity style={styles.iconWrapper} onPress={handlePress}>
      <TouchableOpacity style={styles.iconWrapper} onPress={handlePress}>
        <View style={styles.iconCircle}>
          <Image source={item.source} style={styles.iconImage} />
        </View>
        <Text style={styles.iconText} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const TopListHome = () => {
  const topRowData = icon.filter((_, index) => index % 2 === 0);
  const bottomRowData = icon.filter((_, index) => index % 2 !== 0);
  return (
    <View>
      <BannerHome />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View>
          <View style={styles.row}>
            {topRowData.map((item) => (
              <IconItem key={item.key} item={item} />
            ))}
          </View>
          <View style={[styles.row, styles.staggeredRow]}>
            {bottomRowData.map((item) => (
              <IconItem key={item.key} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingLeft: 5,
  },
  row: {
    flexDirection: "row",
  },
  staggeredRow: {
    marginTop: 10,
    marginLeft: 20,
  },
  iconWrapper: {
    marginHorizontal: 8,
    alignItems: "center",
    backgroundColor: APP_COLOR.YELLOW,
    borderRadius: 50,
    flexDirection: "row",
    alignSelf: "flex-start",
    height: 62,
  },
  iconCircle: {
    backgroundColor: APP_COLOR.DARK_YELLOW,
    height: 50,
    width: 50,
    borderRadius: 25,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    height: 50,
    width: 50,
    resizeMode: "contain",
  },
  iconText: {
    textAlign: "center",
    paddingRight: 15,
    paddingLeft: 5,
    fontFamily: FONTS.semiBold,
    color: APP_COLOR.BROWN,
    maxWidth: 100,
  },
});

export default TopListHome;
