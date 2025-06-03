import CollectionList from "@/components/headerComponent/collectionList";
import TopHeader from "@/components/headerComponent/topHeader";
import TopList from "@/components/headerComponent/topList";
import SearchComponent from "@/components/headerComponent/topSearch";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
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
}
const HomePage = () => {
  const [selectedProduct, setSelectedProduct] = useState<IProduct>();
  const [showDetail, setShowDetail] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-screenWidth)).current;

  const toggleSidebar = () => {
    const toValue = showSidebar ? -screenWidth : 0;
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowSidebar(!showSidebar);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLOR.WHITE }}>
      <ScrollView>
        <TopHeader onMenuPress={toggleSidebar} />
        <SearchComponent />
        <TopList />
        <CollectionList
          onProductPress={(product) => {
            setSelectedProduct(product);
            setShowDetail(true);
          }}
        />
      </ScrollView>

      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnimation }],
          },
        ]}
      >
        <View style={styles.sidebarContent}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <Pressable onPress={toggleSidebar}>
            <FontAwesome6 name="bars" size={29} color={APP_COLOR.BROWN} />
          </Pressable>
        </View>
      </Animated.View>

      {showDetail && selectedProduct && (
        <View style={modalStyles.overlay}>
          <Animated.View style={modalStyles.modal}>
            <Pressable
              style={modalStyles.closeBtn}
              onPress={() => setShowDetail(false)}
            >
              <Image
                source={selectedProduct.productImg}
                style={modalStyles.img}
                resizeMode="cover"
              />
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
              ></View>
            </Pressable>

            <Text style={modalStyles.name}>{selectedProduct.productName}</Text>
            <Text style={modalStyles.description}>
              {selectedProduct.productDes}
            </Text>
            <Text style={modalStyles.price}>
              {currencyFormatter(selectedProduct.productPrice)} VND
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: screenWidth * 0.5,
    height: screenHeight,
    backgroundColor: APP_COLOR.WHITE,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sidebarContent: {
    padding: 20,
    paddingTop: 60,
    flexDirection: "row",
    gap: 30,
  },
  sidebarTitle: {
    fontSize: 24,
    fontFamily: APP_FONT.BOLD,
    color: APP_COLOR.BROWN,
    marginBottom: 20,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
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
  closeBtn: { alignItems: "center" },
  img: {
    width: screenWidth,
    height: 300,
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
