import { FlatList, Image, Text, View } from "react-native";
import BannerHome from "./banner.home";
import { APP_COLOR } from "@/utils/constant";
import { FONTS } from "@/theme/typography";

const data1 = [
  {
    key: 1,
    name: "Hot Deal",
    source: require("@/assets/icons/flash-deals.png"),
  },
  {
    key: 2,
    name: "Quán Ngon",
    source: require("@/assets/icons/nice-shop.png"),
  },
  { key: 3, name: "Tích Điểm", source: require("@/assets/icons/points.png") },
  { key: 4, name: "Ngọt Xỉu", source: require("@/assets/icons/rice.png") },
  {
    key: 5,
    name: "Quán Tiền Bối",
    source: require("@/assets/icons/noodles.png"),
  },
  {
    key: 6,
    name: "Bún, Mì, Phở",
    source: require("@/assets/icons/bun-pho.png"),
  },
  { key: 7, name: "BBQ", source: require("@/assets/icons/bbq.png") },
  { key: 8, name: "Fast Food", source: require("@/assets/icons/fastfood.png") },
  { key: 9, name: "Pizza", source: require("@/assets/icons/pizza.png") },
  { key: 10, name: "Burger", source: require("@/assets/icons/burger.png") },
  {
    key: 11,
    name: "Sống Khỏe",
    source: require("@/assets/icons/egg-cucmber.png"),
  },
  { key: 12, name: "Giảm 50k", source: require("@/assets/icons/moi-moi.png") },
  {
    key: 13,
    name: "99k Off",
    source: require("@/assets/icons/fried-chicken.png"),
  },
  {
    key: 14,
    name: "No Bụng",
    source: require("@/assets/icons/korean-food.png"),
  },
  { key: 15, name: "Freeship", source: require("@/assets/icons/steak.png") },
  { key: 16, name: "Deal 0Đ", source: require("@/assets/icons/tomato.png") },
  { key: 17, name: "Món 1Đ", source: require("@/assets/icons/elipse.png") },
  { key: 18, name: "Ăn chiều", source: require("@/assets/icons/chowmein.png") },
  { key: 19, name: "Combo 199k", source: require("@/assets/icons/notif.png") },
  { key: 20, name: "Milk Tea", source: require("@/assets/icons/salad.png") },
];

const groupDataIntoRows = (data: any, itemsPerRow: number) => {
  const rows = [];
  for (let i = 0; i < data.length; i += itemsPerRow) {
    rows.push(data.slice(i, i + itemsPerRow));
  }
  return rows;
};

const TopListHome = () => {
  const rows = groupDataIntoRows(data1, 2);
  return (
    <View>
      <BannerHome />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={rows}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginHorizontal: 5 }}>
            {item.map((child: any, idx: number) => (
              <View
                key={idx}
                style={{
                  marginTop: 10,
                  paddingHorizontal: 3,
                  borderRadius: 50,
                  alignItems: "center",
                  backgroundColor: APP_COLOR.YELLOW,
                  flexDirection: "row",
                  alignSelf: "flex-start",
                }}
              >
                <View
                  style={{
                    backgroundColor: APP_COLOR.DARK_YELLOW,
                    height: 50,
                    width: 50,
                    borderRadius: 50,
                    margin: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={child.source}
                    style={{
                      height: 40,
                      width: 40,
                    }}
                  />
                </View>
                <Text
                  style={{
                    textAlign: "center",
                    padding: 7,
                    fontFamily: FONTS.semiBold,
                    color: APP_COLOR.BROWN,
                  }}
                >
                  {child.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default TopListHome;
