import CustomFlatList from "@/components/CustomFlatList/CustomFlatList";
import CollectionHome from "@/components/home/collection.home";
import HeaderHome from "@/components/home/header.home";
import SearchHome from "@/components/home/search.home";
import TopListHome from "@/components/home/top.list.home";
import { useCurrentApp } from "@/context/app.context";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Pressable, Text, View, ScrollView } from "react-native";
import { APP_COLOR } from "@/utils/constant";
import { currencyFormatter, getTypeProductAPI } from "@/utils/api";
import { calculateTotalPrice, calculateTotalQuantity } from "@/utils/cart";
import Animated, {
  FadeIn,
  SlideInDown,
  FadeOut,
} from "react-native-reanimated";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-root-toast";
import { FONTS } from "@/theme/typography";
import ItemQuantity from "@/components/order/item.quantity";

interface ITem {
  name: string;
  productTypeId: number;
}
const HomeTab = () => {
  const [mounted, setMounted] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showPriceUpdate, setShowPriceUpdate] = useState(false);
  const [priceUpdateAmount, setPriceUpdateAmount] = useState(0);
  const { restaurant, cart } = useCurrentApp();
  const [collectionData, setCollectionData] = useState([]);
  const { branchId, setBranchId } = useCurrentApp();
  const { access_token } = useLocalSearchParams();
  useEffect(() => {
    const storeAccessToken = async () => {
      try {
        if (access_token) {
          await AsyncStorage.setItem("access_token", access_token as string);
        }
      } catch (error) {
        console.error("Error saving access token:", error);
      }
    };
    storeAccessToken();
  }, [access_token]);
  const handleBranchSelect = (id: any) => {
    setBranchId(id);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTypeProductAPI();
        setCollectionData(res.data);
      } catch (error) {
        console.error("Error fetching type products data:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setTimeout(() => {
      router.push("/(auth)/popup.sale");
    }, 1000);
  }, [mounted]);

  const handleQuantityChange = (amount: number) => {
    setPriceUpdateAmount(amount);
    setShowPriceUpdate(true);
    setTimeout(() => {
      setShowPriceUpdate(false);
    }, 2000);
  };
  const totalPrice = calculateTotalPrice(cart, restaurant?._id);
  const totalQuantity = calculateTotalQuantity(cart, restaurant?._id);

  const cartItems = restaurant?._id
    ? Object.values(cart[restaurant._id]?.items || {})
    : [];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
      }}
    >
      <CustomFlatList
        data={collectionData}
        style={styles.list}
        renderItem={({ item }: { item: ITem }) => (
          <CollectionHome
            name={item.name}
            id={item.productTypeId}
            branchId={branchId}
          />
        )}
        HeaderComponent={<HeaderHome onBranchSelect={handleBranchSelect} />}
        StickyElementComponent={<SearchHome />}
        TopListElementComponent={<TopListHome />}
      />

      {restaurant &&
        restaurant.menu.length > 0 &&
        restaurant.menu[0].menuItem.length > 0 && (
          <ItemQuantity
            restaurant={restaurant}
            menuItem={restaurant.menu[0].menuItem[0]}
            isModal={false}
            onQuantityChange={handleQuantityChange}
          />
        )}

      {showPriceUpdate && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.priceUpdateContainer}
        >
          <Text style={styles.priceUpdateText}>
            {priceUpdateAmount > 0 ? "+" : ""}
            {currencyFormatter(priceUpdateAmount)}
          </Text>
        </Animated.View>
      )}

      {totalQuantity > 0 && (
        <Pressable
          style={styles.cartButton}
          onPress={() => {
            access_token
              ? setShowCart(true)
              : Toast.show("Vui lòng đăng nhập để xem giỏ hàng", {
                  duration: Toast.durations.LONG,
                  textColor: "white",
                  backgroundColor: APP_COLOR.CANCEL,
                  opacity: 1,
                  position: 30,
                });
          }}
        >
          <AntDesign
            name="shoppingcart"
            size={24}
            color="white"
            style={{ marginHorizontal: "auto" }}
          />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalQuantity}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderColor: "red",
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: "100%",
  },
  item: {
    borderColor: "green",
    borderWidth: 1,
    height: 250,
    marginBottom: 10,
    width: "100%",
  },
  list: {
    overflow: "hidden",
  },
  sticky: {
    backgroundColor: "#2555FF50",
    borderColor: "blue",
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: "100%",
  },
  cartButton: {
    position: "absolute",
    bottom: 5,
    right: 20,
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 50,
    padding: 15,
    width: 60,
    height: 60,
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
    top: -5,
    right: -5,
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
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    color: APP_COLOR.BROWN,
  },
  cartItemQuantity: {
    fontSize: 15,
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.regular,
  },
  cartItemPrice: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.regular,
    fontSize: 17,
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
    marginBottom: 5,
  },
  orderText: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.bold,
    marginVertical: "auto",
  },
  orderPrice: {
    fontSize: 25,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    textDecorationLine: "underline",
  },
  orderButton: {
    backgroundColor: APP_COLOR.BROWN,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
  priceUpdateContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 1001,
  },
  priceUpdateText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
export default HomeTab;
