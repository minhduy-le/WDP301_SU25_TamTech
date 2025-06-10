import React, { useCallback, useState } from "react";
import axios from "axios";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
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
} from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import menu from "@/assets/Menu.png";
import { FONTS } from "@/theme/typography";
import { useCurrentApp } from "@/context/app.context";

interface IProduct {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
}

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const { cart, setCart, restaurant } = useCurrentApp();

  const fetchProducts = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setProducts([]);
        return;
      }
      try {
        const res = await axios.get(
          `${BASE_URL}/products?page=0&size=10&keyword=${text}`
        );
        if (res.data?.data?.content) {
          setProducts(res.data.data.content);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setProducts([]);
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

  const getItemQuantity = (itemId: string) => {
    if (!restaurant?._id) return 0;
    return cart[restaurant._id]?.items[itemId]?.quantity || 0;
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
                    source={{ uri: item.productImage }}
                    style={styles.productImage}
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={styles.productPrice}>
                      {item.productPrice.toLocaleString()}đ
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
