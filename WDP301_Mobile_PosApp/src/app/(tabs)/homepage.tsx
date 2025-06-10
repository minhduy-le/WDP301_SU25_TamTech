import AddToCart from "@/components/btnComponent/addToCart";
import CollectionList from "@/components/headerComponent/collectionList";
import HomepageHeader from "@/components/headerComponent/homepageHeader";
import TopList from "@/components/headerComponent/topList";
import SearchComponent from "@/components/headerComponent/topSearch";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
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
              <AddToCart
                product={{
                  productId: selectedProduct.id,
                  productName: selectedProduct.productName,
                  productPrice: selectedProduct.productPrice,
                  productImg: selectedProduct.productImg,
                  productQuantity: selectedProduct.productQuantity,
                }}
              />
              <AddToCart
                product={{
                  productId: selectedProduct.id,
                  productName: selectedProduct.productName,
                  productPrice: selectedProduct.productPrice,
                  productImg: selectedProduct.productImg,
                  productQuantity: selectedProduct.productQuantity,
                }}
              />
              <AddToCart
                product={{
                  productId: selectedProduct.id,
                  productName: selectedProduct.productName,
                  productPrice: selectedProduct.productPrice,
                  productImg: selectedProduct.productImg,
                  productQuantity: selectedProduct.productQuantity,
                }}
              />
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...Platform.select({
      android: {
        marginBottom: 40,
      },
    }),
  },
  closeBtn: {
    alignItems: "center",
    width: "100%",
    zIndex: 1000,
  },
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
    marginBottom: 5,
    marginTop: 5,
    color: APP_COLOR.BROWN,
  },
  description: {
    marginHorizontal: 15,
    fontFamily: APP_FONT.REGULAR,
    fontSize: 15,
    color: APP_COLOR.BROWN,
    textAlign: "center",
  },
});

export default HomePage;
