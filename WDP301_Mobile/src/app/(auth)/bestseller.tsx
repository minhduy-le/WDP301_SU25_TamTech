import { APP_COLOR } from "@/utils/constant";
import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { FONTS } from "@/theme/typography";
import { currencyFormatter, getBestSellerAPI } from "@/utils/api";
import { useCurrentApp } from "@/context/app.context";
import AntDesign from "@expo/vector-icons/AntDesign";
import logo from "@/assets/logo.png";
import ShareButton from "@/components/button/share.button";
import { router } from "expo-router";
interface IProduct {
  productId: string;
  name: string;
  price: number;
  image: string;
}

const BestSellerPage = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const { cart, setCart, restaurant } = useCurrentApp();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await getBestSellerAPI();
        if (res.data?.products) {
          setProducts(res.data.products);
        }
      } catch (error) {
        console.error("Error fetching best sellers:", error);
      }
    };

    fetchBestSellers();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Món Ăn Bán Chạy</Text>
        <Image style={styles.img} source={logo} />
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const quantity = getItemQuantity(item.productId);
          return (
            <View style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <View>
                  <View style={styles.productHeader}>
                    <Text numberOfLines={1} style={styles.productName}>
                      {item.name}
                    </Text>
                    <View style={styles.soldBadge}>
                      <Text style={styles.soldText}>Đã bán: 689</Text>
                    </View>
                  </View>
                  <Text style={styles.productPrice}>
                    {currencyFormatter(item.price)}
                  </Text>
                </View>
                <View style={styles.productFooter}>
                  <View style={styles.ratingContainer}>
                    <AntDesign name="star" size={24} color={APP_COLOR.ORANGE} />
                    <Text style={styles.ratingText}>4.6 (52)</Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <Pressable
                      onPress={() => handleQuantityChange(item, "MINUS")}
                      style={({ pressed }) => [
                        styles.quantityButton,
                        {
                          opacity: quantity > 0 ? (pressed ? 0.5 : 1) : 0.3,
                        },
                      ]}
                      disabled={quantity === 0}
                    >
                      <AntDesign
                        name="minuscircle"
                        size={24}
                        color={
                          quantity > 0
                            ? APP_COLOR.BUTTON_YELLOW
                            : APP_COLOR.BROWN
                        }
                      />
                    </Pressable>
                    <Text style={styles.quantity}>{quantity}</Text>
                    <Pressable
                      onPress={() => handleQuantityChange(item, "PLUS")}
                      style={({ pressed }) => [
                        styles.quantityButton,
                        { opacity: pressed ? 0.5 : 1 },
                      ]}
                    >
                      <AntDesign
                        name="pluscircle"
                        size={24}
                        color={APP_COLOR.BUTTON_YELLOW}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.btnContainer}>
        <ShareButton
          title="Trang chủ"
          onPress={() => router.navigate("/(tabs)")}
          textStyle={styles.btnText}
          btnStyle={styles.btnView}
        />
        <ShareButton
          title="Đặt hàng"
          onPress={() => router.navigate("/(user)/product/place.order")}
          textStyle={styles.btnText}
          btnStyle={styles.btnView}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  headerContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-around",
  },
  header: {
    fontSize: 19,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    textAlign: "center",
    marginVertical: 20,
  },
  img: { height: 100, width: 150 },
  listContainer: {
    padding: 10,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: APP_COLOR.WHITE,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    padding: 10,
    alignItems: "center",
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: APP_COLOR.BROWN,
    width: 150,
  },
  soldBadge: {
    padding: 5,
    backgroundColor: APP_COLOR.GREY + "60",
    borderRadius: 30,
  },
  soldText: {
    fontFamily: FONTS.medium,
    color: APP_COLOR.ORANGE,
    fontSize: 12,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  ratingText: {
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: APP_COLOR.BROWN,
    alignSelf: "flex-end",
  },
  quantity: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
    minWidth: 30,
    textAlign: "center",
  },
  quantityButton: {
    alignItems: "center",
  },
  btnText: {
    textTransform: "uppercase",
    color: "#fff",
    paddingVertical: 5,
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  btnView: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 10,
    backgroundColor: APP_COLOR.ORANGE,
    width: 175,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    marginHorizontal: 10,
  },
});

export default BestSellerPage;
