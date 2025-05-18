import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Platform,
  Pressable,
  Dimensions,
} from "react-native";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import ContentLoader, { Rect } from "react-content-loader/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useCurrentApp } from "@/context/app.context";
import { currencyFormatter } from "@/utils/api";
import React from "react";
import Popup from "./popup.home";
import { FONTS } from "@/theme/typography";
import axios from "axios";

const { height: sHeight, width: sWidth } = Dimensions.get("window");
interface IProps {
  name: string;
  id: number;
  branchId: number | null;
}
interface IPropsProduct {
  productId: string;
  productImage: string;
  productName: string;
  productPrice: number;
}
const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: APP_COLOR.YELLOW,
  },
  sale: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: APP_COLOR.ORANGE,
    padding: 3,
    borderRadius: 3,
    alignSelf: "flex-start",
  },
});
const CollectionHome = (props: IProps) => {
  const { name, id, branchId } = props;
  const { cart, setCart, restaurant, setRestaurant } = useCurrentApp();
  const mockRestaurant = {
    _id: "mock_restaurant_1",
    name: "Số món đã đặt",
    menu: [],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/products/branch/${branchId}?page=0&size=10&typeId=${id}&quantityStart=0&quantityEnd=9999999`
        );
        setRestaurants(res.data.data.content);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id, branchId]);

  useEffect(() => {
    if (!restaurant) {
      setRestaurant(mockRestaurant);
    }
  }, []);

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handlePressItem = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleQuantityChange = (item: any, action: "MINUS" | "PLUS") => {
    if (!restaurant?._id) return;

    const total = action === "MINUS" ? -1 : 1;
    const priceChange = total * item.productPrice;

    const newCart = { ...cart };
    if (!newCart[restaurant._id]) {
      newCart[restaurant._id] = {
        sum: 0,
        quantity: 0,
        items: {},
      };
    }

    newCart[restaurant._id].sum =
      (newCart[restaurant._id].sum || 0) + priceChange;
    newCart[restaurant._id].quantity =
      (newCart[restaurant._id].quantity || 0) + total;

    if (!newCart[restaurant._id].items[item.productId]) {
      newCart[restaurant._id].items[item.productId] = {
        data: {
          ...item,
          basePrice: item.productPrice,
          title: item.productName,
        },
        quantity: 0,
      };
    }

    const currentQuantity =
      (newCart[restaurant._id].items[item.productId].quantity || 0) + total;

    if (currentQuantity <= 0) {
      delete newCart[restaurant._id].items[item.productId];
      if (Object.keys(newCart[restaurant._id].items).length === 0) {
        delete newCart[restaurant._id];
      }
    } else {
      newCart[restaurant._id].items[item.productId] = {
        data: {
          ...item,
          basePrice: item.productPrice,
          title: item.productName,
        },
        quantity: currentQuantity,
      };
    }

    setCart(newCart);
  };

  const getItemQuantity = (itemId: string) => {
    if (!restaurant?._id) return 0;
    return cart[restaurant._id]?.items[itemId]?.quantity || 0;
  };

  const backend =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  return (
    <>
      <View
        style={{ height: 10, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
      ></View>
      {loading === false ? (
        <View style={styles.container}>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: APP_COLOR.ORANGE,
                fontWeight: "600",
                fontFamily: FONTS.medium,
                fontSize: 17,
              }}
            >
              {name}
            </Text>
            <Pressable
              onPress={() =>
                router.navigate({
                  pathname: "/(auth)/restaurants",
                  params: { id },
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: APP_COLOR.BROWN,
                  fontFamily: FONTS.medium,
                  fontSize: 17,
                }}
              >
                Xem tất cả
              </Text>
              <MaterialIcons
                name="navigate-next"
                size={20}
                color={APP_COLOR.BROWN}
              />
            </Pressable>
          </View>
          <FlatList
            data={restaurants}
            horizontal
            contentContainerStyle={{
              gap: 7,
              paddingRight: 10,
              marginBottom: 10,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={({
              item,
              index,
            }: {
              item: IPropsProduct;
              index: number;
            }) => {
              const quantity = getItemQuantity(item.productId);
              const isLastItem = index === restaurants.length - 1;
              return (
                <Pressable onPress={() => handlePressItem(item)}>
                  <View
                    style={{
                      backgroundColor: APP_COLOR.YELLOW,
                      borderRadius: 10,
                      marginTop: 10,
                      borderWidth: 1,
                      borderColor: APP_COLOR.BROWN,
                      gap: 5,
                      marginHorizontal: 5,
                      marginRight: isLastItem ? 10 : 5,
                    }}
                  >
                    <Image
                      style={{ height: 130, width: 140, borderRadius: 10 }}
                      source={{ uri: item.productImage }}
                    />
                    <View style={{ padding: 5 }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          fontWeight: "600",
                          maxWidth: 130,
                          fontFamily: FONTS.medium,
                          fontSize: 17,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {item.productName}
                      </Text>
                      <Text
                        style={{
                          color: APP_COLOR.BROWN,
                          fontFamily: FONTS.bold,
                          fontSize: 17,
                          position: "relative",
                          left: 50,
                        }}
                      >
                        {currencyFormatter(item.productPrice)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingBottom: 5,
                      }}
                    >
                      <Pressable
                        onPress={() => handleQuantityChange(item, "MINUS")}
                        style={({ pressed }) => ({
                          opacity: quantity > 0 ? (pressed ? 0.5 : 1) : 0.3,
                        })}
                        disabled={quantity === 0}
                      >
                        <AntDesign
                          name="minuscircle"
                          size={24}
                          color={
                            quantity > 0 ? APP_COLOR.ORANGE : APP_COLOR.BROWN
                          }
                        />
                      </Pressable>

                      <Text
                        style={{
                          minWidth: 25,
                          textAlign: "center",
                          fontFamily: FONTS.medium,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {quantity}
                      </Text>

                      <Pressable
                        onPress={() => handleQuantityChange(item, "PLUS")}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.5 : 1,
                        })}
                      >
                        <AntDesign
                          name="pluscircle"
                          size={24}
                          color={APP_COLOR.ORANGE}
                        />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
          <Popup
            visible={modalVisible}
            onClose={closeModal}
            item={selectedItem}
          />
        </View>
      ) : (
        <ContentLoader
          speed={2}
          width={sWidth}
          height={230}
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
          style={{ width: "100%" }}
        >
          <Rect x="10" y="10" rx="5" ry="5" width={150} height="200" />
          <Rect x="170" y="10" rx="5" ry="5" width={150} height="200" />
          <Rect x="330" y="10" rx="5" ry="5" width={150} height="200" />
        </ContentLoader>
      )}
    </>
  );
};

export default CollectionHome;
