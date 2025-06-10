import AddToCart from "@/components/btnComponent/addToCart";
import CollectionList from "@/components/headerComponent/collectionList";
import HomepageHeader from "@/components/headerComponent/homepageHeader";
import TopList from "@/components/headerComponent/topList";
import SearchComponent from "@/components/headerComponent/topSearch";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

interface IProduct {
  id: string;
  productImg: any;
  productName: string;
  productPrice: number;
  productDes: string;
  productQuantity: number;
}

const HomePage = () => {
  const [selectedProduct, setSelectedProduct] = useState<IProduct>();
  const [showDetail, setShowDetail] = useState(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: APP_COLOR.WHITE,
      }}
    >
      <HomepageHeader />
      <ScrollView>
        <SearchComponent />
        <TopList />
        <CollectionList
          onProductPress={(product) => {
            setSelectedProduct(product);
            setShowDetail(true);
          }}
        />
      </ScrollView>

      {showDetail && selectedProduct && (
        <View style={modalStyles.overlay}>
          <Animated.View style={modalStyles.modal}>
            <Pressable
              style={modalStyles.closeBtn}
              onPress={() => setShowDetail(false)}
            >
              <View
                style={{
                  height: 5,
                  width: 80,
                  backgroundColor: APP_COLOR.GREY,
                  borderRadius: 50,
                  zIndex: 1000,
                  position: "absolute",
                  top: 5,
                }}
              />
            </Pressable>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingBottom: 20,
                alignItems: "center",
              }}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={selectedProduct.productImg}
                style={modalStyles.img}
                resizeMode="cover"
              />
              <Text style={modalStyles.name}>
                {selectedProduct.productName}
              </Text>
              <Text style={modalStyles.description}>
                {selectedProduct.productDes}
              </Text>
              <Text style={modalStyles.price}>
                {currencyFormatter(selectedProduct.productPrice)} VND
              </Text>
              <View
                style={{
                  ...Platform.select({
                    android: {
                      marginBottom: 40,
                    },
                  }),
                }}
              >
                {dataSample.map((product) => (
                  <AddToCart
                    key={product.id}
                    product={{
                      productId: product.id,
                      productName: product.productName,
                      productPrice: product.productPrice,
                      productImg: product.productImg,
                      productQuantity: product.productQuantity,
                    }}
                  />
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.34)",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 100,
  },
  modal: {
    width: screenWidth,
    height: screenHeight * 0.7,
    backgroundColor: APP_COLOR.WHITE,
    borderRadius: 30,
    alignItems: "center",
  },
  closeBtn: { alignItems: "center", zIndex: 5 },
  img: {
    width: screenWidth,
    height: 350,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
    zIndex: -1,
  },
  name: {
    fontSize: 22,
    fontFamily: APP_FONT.BOLD,
    marginBottom: 10,
    marginTop: 5,
    color: APP_COLOR.BROWN,
  },
  description: {
    marginHorizontal: 15,
    fontFamily: APP_FONT.REGULAR,
    fontSize: 15,
    color: APP_COLOR.BROWN,
    textAlign: "center",
    marginBottom: 10,
  },
  price: { fontSize: 18, color: APP_COLOR.ORANGE, marginBottom: 20 },
});

export default HomePage;
