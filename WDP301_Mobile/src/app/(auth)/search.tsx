import React, { useCallback, useState } from "react";
import axios from "axios";
import { API_URL, APP_COLOR } from "@/utils/constant";
import debounce from "debounce";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  View,
  TextInput,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import menu from "@/assets/Menu.png";
import { FONTS } from "@/theme/typography";
import { useCurrentApp } from "@/context/app.context";
import { currencyFormatter } from "@/utils/api";
import { getItemQuantity as getItemQuantityUtil } from "@/utils/cart";
import Toast from "react-native-root-toast";

interface IProduct {
  productId: string;
  description: string;
  price: number;
  image: string;
  name: string;
  ProductType: {
    name: string;
    productTypeId: number;
  };
}

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const { cart, setCart, restaurant } = useCurrentApp();
  const [productTypeList, setProductTypeList] = useState<number[]>([]);
  const fetchProducts = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setProducts([]);
        setProductTypeList([]);
        return;
      }
      try {
        const res = await axios.get(
          `${API_URL}/api/products/search?name=${text}`
        );
        if (res.data?.products) {
          const sortedProducts = res.data.products.sort(
            (a: IProduct, b: IProduct) =>
              a.ProductType.name.localeCompare(b.ProductType.name)
          );
          const products: IProduct[] = sortedProducts;
          const productType: number[] = [
            ...new Set(
              products.map(
                (product: IProduct) => product.ProductType.productTypeId
              )
            ),
          ];
          setProductTypeList(productType);
          setProducts(sortedProducts);
        } else {
          setProducts([]);
          setProductTypeList([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setProducts([]);
        setProductTypeList([]);
      }
    }, 500),
    []
  );
  const handleChangeText = (text: string) => {
    setSearchTerm(text);
    fetchProducts(text);
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
  const getItemQuantity = (itemId: string) =>
    getItemQuantityUtil(cart, restaurant?._id, itemId);
  const handleFilterByProductName = async (typeId: number) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/products/search-by-name-and-type?name=${searchTerm}&productTypeId=${typeId}`
      );
      setProducts(res.data.products);
    } catch (error) {
      Toast.show("Lỗi khi lọc sản phẩm");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: APP_COLOR.BROWN }}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} color={APP_COLOR.BROWN} />
          <TextInput
            placeholder="Hôm nay bạn muốn ăn gì nào?"
            style={styles.input}
            onChangeText={handleChangeText}
            value={searchTerm}
          />
        </View>
        {productTypeList && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ padding: 10 }}
          >
            {productTypeList.map((item, index) => (
              <Pressable
                key={`${item}-${index}`}
                style={{
                  backgroundColor: APP_COLOR.YELLOW,
                  width: 120,
                  padding: 10,
                  marginRight: 10,
                  borderRadius: 30,
                  alignItems: "center",
                }}
                onPress={() => {
                  handleFilterByProductName(item);
                }}
              >
                {(() => {
                  switch (item) {
                    case 1:
                      return (
                        <Text
                          style={{
                            color: APP_COLOR.BROWN,
                            fontFamily: FONTS.medium,
                            fontSize: 15,
                          }}
                        >
                          Đồ ăn
                        </Text>
                      );
                    case 2:
                      return (
                        <Text
                          style={{
                            color: APP_COLOR.BROWN,
                            fontFamily: FONTS.medium,
                            fontSize: 15,
                          }}
                        >
                          Thức uống
                        </Text>
                      );
                    case 3:
                      return (
                        <Text
                          style={{
                            color: APP_COLOR.BROWN,
                            fontFamily: FONTS.medium,
                            fontSize: 15,
                          }}
                        >
                          Món ăn kèm
                        </Text>
                      );
                    default:
                      return (
                        <Text
                          style={{
                            color: APP_COLOR.BROWN,
                            fontFamily: FONTS.medium,
                            fontSize: 15,
                          }}
                        >
                          Món canh
                        </Text>
                      );
                  }
                })()}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.productId}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const quantity = getItemQuantity(item.productId);
            return (
              <Pressable onPress={() => {}}>
                <View style={styles.itemContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.description}</Text>
                    <Text style={styles.productPrice}>
                      {currencyFormatter(item.price)}
                    </Text>
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
                          quantity > 0
                            ? APP_COLOR.BUTTON_YELLOW
                            : APP_COLOR.BROWN
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
              </Pressable>
            );
          }}
        />
      ) : (
        <View style={styles.imageWrapper}>
          <Image style={styles.fallbackImage} source={menu} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BROWN,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: 15,
    backgroundColor: APP_COLOR.WHITE,
    borderRadius: 30,
    width: "90%",
    height: 50,
    alignSelf: "center",
    marginBottom: 10,
  },
  input: {
    marginLeft: 10,
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginBottom: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
  },
  productImage: {
    height: 100,
    width: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  productDetails: {
    flex: 1,
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
  },
  productPrice: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    marginTop: 5,
  },
  imageWrapper: {
    flex: 1,
    alignItems: "flex-start",
  },
  fallbackImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
});

export default SearchPage;
