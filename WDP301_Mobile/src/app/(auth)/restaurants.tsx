import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import { TextInput } from "react-native-gesture-handler";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import debounce from "debounce";
import demo from "@/assets/demo.jpg";
import { currencyFormatter } from "@/utils/api";
import { useCurrentApp } from "@/context/app.context";
import axios from "axios";
import { FONTS } from "@/theme/typography";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<IRestaurants[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { id } = useLocalSearchParams();
  const { cart, setCart, restaurant } = useCurrentApp();
  const [showCart, setShowCart] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/products?page=0&size=10&keyword=${searchTerm}&typeId=${id}`
        );
        setRestaurants(res.data.data.content);
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [searchTerm, id]);

  const handleSearch = debounce(async (text: string) => {
    setSearchTerm(text);
    if (!text) return;
    const res = await axios.get(
      `${BASE_URL}/products?page=0&size=10&keyword=${text}&typeId=0`
    );
    if (res.data.data.content) {
      setRestaurants(res.data.results);
    }
  }, 300);

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

  const totalPrice = restaurant?._id ? cart[restaurant._id]?.sum || 0 : 0;
  const totalQuantity = restaurant?._id
    ? cart[restaurant._id]?.quantity || 0
    : 0;
  const cartItems = restaurant?._id
    ? Object.values(cart[restaurant._id]?.items || {})
    : [];
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 5,
          alignItems: "center",
          padding: 10,
        }}
      >
        <MaterialIcons
          onPress={() => router.back()}
          name="arrow-back"
          size={24}
          color={APP_COLOR.ORANGE}
        />
        <TextInput
          placeholder="Tìm kiếm món ăn..."
          onChangeText={(text: string) => handleSearch(text)}
          style={{
            flex: 1,
            backgroundColor: "#eee",
            paddingVertical: 3,
            paddingHorizontal: 10,
            borderRadius: 3,
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.productId}
          renderItem={({ item }) => {
            const quantity = getItemQuantity(item.productId);
            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 10,
                  gap: 10,
                  borderBottomColor: "#eee",
                  borderBottomWidth: 1,
                }}
              >
                <Image source={demo} style={{ height: 100, width: 100 }} />
                <View style={{ flex: 1 }}>
                  <Text>{item.productName}</Text>
                  <Text
                    style={{
                      color: APP_COLOR.ORANGE,
                      fontFamily: FONTS.medium,
                      fontSize: 17,
                    }}
                  >
                    {currencyFormatter(item.productPrice)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
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
                      name="minussquareo"
                      size={24}
                      color={quantity > 0 ? APP_COLOR.ORANGE : APP_COLOR.GREY}
                    />
                  </Pressable>
                  <Text style={{ minWidth: 25, textAlign: "center" }}>
                    {quantity}
                  </Text>
                  <Pressable
                    onPress={() => handleQuantityChange(item, "PLUS")}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.5 : 1,
                    })}
                  >
                    <AntDesign
                      name="plussquare"
                      size={24}
                      color={APP_COLOR.ORANGE}
                    />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </View>
      {totalQuantity > 0 && (
        <Pressable style={styles.cartButton} onPress={() => setShowCart(true)}>
          <AntDesign name="shoppingcart" size={24} color="white" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalQuantity}</Text>
          </View>
          <View style={styles.cartButtonContent}>
            <Text style={styles.cartButtonText}>Giỏ hàng</Text>
            <Text style={styles.cartButtonPrice}>
              {currencyFormatter(totalPrice)}
            </Text>
          </View>
        </Pressable>
      )}
      {showCart && (
        <Animated.View entering={FadeIn} style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setShowCart(false)}
          />
          <Animated.View entering={SlideInDown} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Giỏ hàng</Text>
              <AntDesign
                name="close"
                size={24}
                color="grey"
                onPress={() => setShowCart(false)}
              />
            </View>
            <ScrollView style={styles.cartScroll}>
              {cartItems.map((item, index) => (
                <View key={index} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemTitle}>{item.data.title}</Text>
                    <Text style={styles.cartItemQuantity}>
                      Số lượng: {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.cartItemPrice}>
                    {currencyFormatter(item.data.basePrice * item.quantity)}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalFooter}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderText}>
                  Tổng cộng ({totalQuantity} món)
                </Text>
                <Text style={styles.orderPrice}>
                  {currencyFormatter(totalPrice)}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.orderButton,
                  pressed && styles.orderButtonPressed,
                ]}
                onPress={() => {
                  setShowCart(false);
                  router.push("/(user)/product/place.order");
                }}
              >
                <Text style={styles.orderButtonText}>
                  Đặt đơn - {currencyFormatter(totalPrice)}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cartButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: 20,
    backgroundColor: "red",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  cartButtonContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 15,
  },
  cartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cartButtonPrice: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cartScroll: {
    maxHeight: 400,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  cartItemQuantity: {
    fontSize: 12,
    color: APP_COLOR.GREY,
    marginTop: 4,
  },
  cartItemPrice: {
    color: APP_COLOR.ORANGE,
    fontWeight: "600",
  },
  modalFooter: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  orderText: {
    color: APP_COLOR.GREY,
  },
  orderPrice: {
    fontWeight: "600",
  },
  orderButton: {
    backgroundColor: APP_COLOR.ORANGE,
    padding: 15,
    borderRadius: 8,
  },
  orderButtonPressed: {
    opacity: 0.5,
  },
  orderButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RestaurantsPage;
