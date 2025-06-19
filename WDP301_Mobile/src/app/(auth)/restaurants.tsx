import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { API_URL, APP_COLOR } from "@/utils/constant";
import { TextInput } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import debounce from "debounce";
import { currencyFormatter } from "@/utils/api";
import { useCurrentApp } from "@/context/app.context";
import axios from "axios";
import { FONTS } from "@/theme/typography";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import Toast from "react-native-root-toast";
const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<IRestaurants[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { id } = useLocalSearchParams();
  const { cart, setCart, restaurant, appState } = useCurrentApp();
  const { branchId, setBranchId } = useCurrentApp();
  const [showCart, setShowCart] = useState(false);
  const fetchProducts = useCallback(
    debounce(async (id: string) => {
      try {
        const res = await axios.get(`${API_URL}/api/products/type/${id}`);
        if (res.data?.products) {
          setRestaurants(res.data.products);
        } else {
          setRestaurants([]);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        setRestaurants([]);
      }
    }, 500),
    []
  );
  const handleSearch = debounce(async (text: string) => {
    setSearchTerm(text);
    if (!text.trim()) {
      fetchProducts(id as string);
      return;
    }
    try {
      const res = await axios.get(
        `${API_URL}/api/products/search-by-name-and-type?name=${text}&productTypeId=${id}`
      );
      if (res.data?.products) {
        setRestaurants(res.data.products);
      } else {
        setRestaurants([]);
      }
    } catch (error: any) {
      console.error("Error searching data:", error.message);
      setRestaurants([]);
    }
  }, 300);
  const handleChangeText = (text: string) => {
    setSearchTerm(text);
    handleSearch(text);
  };
  useEffect(() => {
    if (id) {
      fetchProducts(id as string);
    }
  }, [id, fetchProducts]);
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

  const calculateTotalPrice = () => {
    try {
      if (!restaurant?._id) {
        return 0;
      }

      const restaurantCart = cart[restaurant._id];
      if (!restaurantCart || !restaurantCart.items) {
        return 0;
      }

      const items = restaurantCart.items;
      let total = 0;

      Object.values(items).forEach((item: any) => {
        const price = Number(
          item?.data?.price ||
            item?.data?.basePrice ||
            item?.data?.productPrice ||
            0
        );
        const quantity = Number(item?.quantity || 0);
        total += price * quantity;
      });

      return total;
    } catch (error) {
      console.error("Lỗi tính tổng giá:", error);
      return 0;
    }
  };
  const calculateTotalQuantity = () => {
    try {
      if (!restaurant?._id) return 0;

      const restaurantCart = cart[restaurant._id];
      if (!restaurantCart || !restaurantCart.items) return 0;

      const items = restaurantCart.items;
      let total = 0;

      Object.values(items).forEach((item: any) => {
        const quantity = Number(item?.quantity || 0);
        total += quantity;
      });
      return total;
    } catch (error) {
      console.error("Lỗi tính tổng số lượng:", error);
      return 0;
    }
  };

  const totalPrice = calculateTotalPrice();
  const totalQuantity = calculateTotalQuantity();
  const cartItems = restaurant?._id
    ? Object.values(cart[restaurant._id]?.items || {})
    : [];
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 5,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextInput
          placeholder={`Bạn muốn dùng gì nào?`}
          onChangeText={handleChangeText}
          value={searchTerm}
          placeholderTextColor={APP_COLOR.BROWN}
          style={{
            backgroundColor: APP_COLOR.WHITE,
            gap: 10,
            flexDirection: "row",
            marginVertical: 5,
            borderRadius: 30,
            width: "75%",
            height: 45,
            borderWidth: 1,
            borderColor: APP_COLOR.BROWN,
            marginLeft: 12,
            marginTop: Platform.OS === "android" ? 25 : 0,
            paddingLeft: 5,
          }}
        />
        {appState?.token ? (
          <Pressable
            style={styles.cartButton}
            onPress={() => setShowCart(true)}
          >
            <AntDesign name="shoppingcart" size={30} color={APP_COLOR.BROWN} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {calculateTotalQuantity()}
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            style={styles.cartButton}
            onPress={() => {
              Toast.show("Vui lòng đăng nhập để xem giỏ hàng", {
                duration: Toast.durations.LONG,
                textColor: "white",
                backgroundColor: APP_COLOR.CANCEL,
                opacity: 1,
                position: 30,
              });
            }}
          >
            <AntDesign name="shoppingcart" size={30} color={APP_COLOR.BROWN} />
          </Pressable>
        )}
      </View>
      {restaurants[0]?.productType && (
        <Text
          style={{
            fontFamily: FONTS.bold,
            color: APP_COLOR.BROWN,
            fontSize: 20,
            marginTop: 10,
            marginLeft: 10,
          }}
        >
          {restaurants[0].productType}
        </Text>
      )}
      <View style={{ flex: 1, marginTop: 10 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={restaurants}
          keyExtractor={(item) => item.productId}
          renderItem={({ item }) => {
            const quantity = getItemQuantity(item.productId);
            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: APP_COLOR.WHITE,
                  marginBottom: 15,
                  width: "85%",
                  marginHorizontal: "auto",
                  borderRadius: 10,
                }}
              >
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Image
                    src={item.image}
                    style={{
                      height: 100,
                      width: 100,
                      borderTopLeftRadius: 10,
                      borderBottomLeftRadius: 10,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: FONTS.regular,
                        color: APP_COLOR.BROWN,
                        fontSize: 17,
                        marginTop: 5,
                      }}
                    >
                      {item.description}
                    </Text>
                    <Text
                      style={{
                        color: APP_COLOR.BROWN,
                        fontFamily: FONTS.bold,
                        fontSize: 17,
                      }}
                    >
                      {currencyFormatter(item.price)}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    position: "absolute",
                    bottom: 5,
                    right: 10,
                    borderWidth: 0.5,
                    borderColor: APP_COLOR.BROWN,
                    paddingHorizontal: 5,
                    paddingVertical: 3,
                    borderRadius: 50,
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
                        quantity > 0 ? APP_COLOR.BUTTON_YELLOW : APP_COLOR.BROWN
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
                      color={APP_COLOR.BUTTON_YELLOW}
                    />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </View>
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
                color={APP_COLOR.BROWN}
                onPress={() => setShowCart(false)}
              />
            </View>
            <ScrollView style={styles.cartScroll}>
              {cartItems.map((item, index) => (
                <View key={index} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemTitle}>
                      {item.data?.description}
                    </Text>
                    <Text style={styles.cartItemQuantity}>
                      Số lượng: {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.cartItemPrice}>
                    {currencyFormatter(item.data.price * item.quantity)}
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
                  if (!branchId) {
                    Toast.show("Vui lòng chọn chi nhánh trước khi đặt hàng", {
                      duration: Toast.durations.LONG,
                      textColor: "white",
                      backgroundColor: APP_COLOR.ORANGE,
                      opacity: 1,
                    });
                    return;
                  }
                  router.push({
                    pathname: "/(user)/product/place.order",
                    params: { id: branchId },
                  });
                }}
              >
                <Text style={styles.orderButtonText}>Đặt đơn</Text>
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
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    borderRadius: 50,
    padding: 15,
    width: 60,
    height: 60,
    position: "relative",
    top: Platform.OS === "android" ? 10 : 0,
    left: -5,
  },
  cartBadge: {
    position: "absolute",
    top: 1,
    right: -3,
    backgroundColor: APP_COLOR.BROWN,
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
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
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
    fontFamily: FONTS.semiBold,
    color: APP_COLOR.BROWN,
  },
  cartItemQuantity: {
    fontSize: 12,
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  cartItemPrice: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.bold,
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
    marginVertical: 15,
  },
  orderText: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.semiBold,
    marginVertical: "auto",
  },
  orderPrice: {
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    fontSize: 18,
    textDecorationLine: "underline",
  },
  orderButton: {
    backgroundColor: APP_COLOR.BROWN,
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
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
