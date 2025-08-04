import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import { API_URL, APP_COLOR, BASE_URL } from "@/utils/constant";
import { useEffect, useState, createContext, useContext } from "react";
import { router } from "expo-router";
import ContentLoader, { Rect } from "react-content-loader/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useCurrentApp } from "@/context/app.context";
import { currencyFormatter } from "@/utils/api";
import { getItemQuantity as getItemQuantityUtil } from "@/utils/cart";
import React from "react";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { FONTS } from "@/theme/typography";
import axios from "axios";

const { width: sWidth } = Dimensions.get("window");

interface IProps {
  name: string;
  id: number;
  branchId: number | null;
}

interface IPropsProduct {
  ProductType: {
    name: string;
    productTypeId: number;
  };
  name: string;
  productId: string;
  image: string;
  description: string;
  price: number;
  averageRating: number;
}

interface ModalContextType {
  showProductModal: (item: IPropsProduct) => void;
  hideProductModal: () => void;
  handleQuantityChange: (item: IPropsProduct, action: "MINUS" | "PLUS") => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IPropsProduct | null>(null);
  const [typeProducts, setTypeProducts] = useState([]);
  const { cart, setCart, restaurant, setRestaurant } = useCurrentApp();

  const mockRestaurant = {
    _id: "mock_restaurant_1",
    name: "Số món đã đặt",
    menu: [],
  };

  useEffect(() => {
    if (!restaurant) {
      setRestaurant(mockRestaurant);
    }
  }, [restaurant, setRestaurant]);

  const showProductModal = (item: IPropsProduct) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const hideProductModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleQuantityChange = (
    item: IPropsProduct,
    action: "MINUS" | "PLUS"
  ) => {
    if (action === "PLUS" && item.ProductType.productTypeId === 1) {
      showProductModal(item);
    }

    if (!restaurant?._id) return;

    const total = action === "MINUS" ? -1 : 1;
    const priceChange = total * item.price;

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
          basePrice: item.price,
          title: item.name,
        } as ICartItem,
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
          basePrice: item.price,
          title: item.name,
        } as ICartItem,
        quantity: currentQuantity,
      };
    }

    setCart(newCart);
  };

  const getItemQuantity = (itemId: string) =>
    getItemQuantityUtil(cart, restaurant?._id, itemId);

  useEffect(() => {
    const fetchTypeProducts = async () => {
      try {
        const typePro = await axios.get(`${API_URL}/api/products/type/3`);
        setTypeProducts(typePro.data.products);
      } catch (error) {
        console.error("Error fetching product types:", error);
      }
    };
    fetchTypeProducts();
  }, []);

  return (
    <ModalContext.Provider
      value={{ showProductModal, hideProductModal, handleQuantityChange }}
    >
      {children}
      {modalVisible && selectedItem && (
        <Animated.View entering={FadeIn} style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={hideProductModal}
          />
          <Animated.View entering={SlideInDown} style={styles.modalContent}>
            <ScrollView
              style={{ flexGrow: 0 }}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
              showsVerticalScrollIndicator={false}
            >
              <AntDesign
                name="close"
                size={24}
                color={APP_COLOR.WHITE}
                onPress={hideProductModal}
                style={styles.modalCloseIcon}
              />
              <Image
                source={{ uri: selectedItem?.image }}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  paddingBottom: 1,
                }}
              >
                <Text style={styles.modalProductName}>
                  {selectedItem?.description}{" "}
                  <Text style={styles.modalProductPrice}>
                    {" "}
                    {currencyFormatter(selectedItem?.price || 0)}
                  </Text>
                </Text>

                <View
                  style={[
                    styles.quantityContainer,
                    { marginHorizontal: 10, marginVertical: 10 },
                  ]}
                >
                  <Pressable
                    onPress={() => handleQuantityChange(selectedItem!, "MINUS")}
                    style={({ pressed }) => ({
                      opacity:
                        getItemQuantity(selectedItem!.productId) > 0
                          ? pressed
                            ? 0.5
                            : 1
                          : 0.3,
                    })}
                    disabled={getItemQuantity(selectedItem!.productId) === 0}
                  >
                    <AntDesign
                      name="minuscircle"
                      size={24}
                      color={
                        getItemQuantity(selectedItem!.productId) > 0
                          ? APP_COLOR.BUTTON_YELLOW
                          : APP_COLOR.BROWN
                      }
                    />
                  </Pressable>
                  <Text style={styles.quantityText}>
                    {getItemQuantity(selectedItem!.productId)}
                  </Text>
                  <Pressable
                    onPress={() => handleQuantityChange(selectedItem!, "PLUS")}
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
              {typeProducts.map((item: IPropsProduct, index) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: 10,
                    justifyContent: "space-between",
                    paddingBottom: 1,
                    marginBottom: 10,
                    borderBottomColor: APP_COLOR.GREY,
                    borderBottomWidth: 0.2,
                  }}
                  key={item.productId}
                >
                  <Text style={[styles.itemName]}>
                    {item.name}{" "}
                    <Text style={{ color: APP_COLOR.GREY, fontSize: 12 }}>
                      +{currencyFormatter(item.price)}
                    </Text>
                  </Text>
                  <View
                    style={[styles.quantityContainer, { marginHorizontal: 0 }]}
                  >
                    <Pressable
                      onPress={() => handleQuantityChange(item, "MINUS")}
                      style={({ pressed }) => ({
                        opacity:
                          getItemQuantity(item.productId) > 0
                            ? pressed
                              ? 0.5
                              : 1
                            : 0.3,
                      })}
                      disabled={getItemQuantity(item.productId) === 0}
                    >
                      <AntDesign
                        name="minuscircle"
                        size={24}
                        color={
                          getItemQuantity(item.productId) > 0
                            ? APP_COLOR.BUTTON_YELLOW
                            : APP_COLOR.BROWN
                        }
                      />
                    </Pressable>
                    <Text style={styles.quantityText}>
                      {getItemQuantity(item.productId)}
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
              ))}
              <View>
                <Text style={[styles.headerText, { alignSelf: "center" }]}>
                  Tổng giá tiền:{" "}
                  <Text style={{ fontFamily: FONTS.bold }}>
                    {currencyFormatter(cart?.mock_restaurant_1?.sum) || 0}
                  </Text>
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      )}
    </ModalContext.Provider>
  );
};

const CollectionHome = (props: IProps) => {
  const { name, id, branchId } = props;
  const { cart, restaurant, setRestaurant } = useCurrentApp();
  const { showProductModal, handleQuantityChange } = useModal();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const mockRestaurant = {
    _id: "mock_restaurant_1",
    name: "Số món đã đặt",
    menu: [],
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/products/type/${props.id}`);
        console.log(res);

        setRestaurants(res.data.products);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, branchId]);

  useEffect(() => {
    if (!restaurant) {
      setRestaurant(mockRestaurant);
    }
  }, [restaurant, setRestaurant]);

  const getItemQuantity = (itemId: string) =>
    getItemQuantityUtil(cart, restaurant?._id, itemId);

  return (
    <>
      <View style={styles.spacer} />
      {loading ? (
        <ContentLoader
          speed={2}
          width={sWidth}
          height={230}
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
          style={styles.loader}
        >
          <Rect x="10" y="10" rx="5" ry="5" width={150} height="200" />
          <Rect x="170" y="10" rx="5" ry="5" width={150} height="200" />
          <Rect x="330" y="10" rx="5" ry="5" width={150} height="200" />
        </ContentLoader>
      ) : (
        <View style={styles.container}>
          <Pressable
            onPress={() =>
              router.navigate({
                pathname: "/(auth)/restaurants",
                params: { id },
              })
            }
            style={styles.headerContainer}
          >
            <Text style={styles.headerText}>{name}</Text>
            <View style={styles.viewAllContainer}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <MaterialIcons
                name="navigate-next"
                size={20}
                color={APP_COLOR.BROWN}
                style={styles.navigateIcon}
              />
            </View>
          </Pressable>

          <FlatList
            data={restaurants}
            horizontal
            contentContainerStyle={styles.flatListContent}
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
                <Pressable>
                  <View
                    style={[
                      styles.itemContainer,
                      { marginRight: isLastItem ? 10 : 5 },
                    ]}
                  >
                    <Image
                      style={styles.itemImage}
                      source={{ uri: item.image }}
                    />
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>
                        {item.averageRating}
                      </Text>
                      <AntDesign
                        name="star"
                        size={15}
                        color={APP_COLOR.ORANGE}
                      />
                    </View>
                    <View style={styles.itemTextContainer}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.itemName, { maxWidth: 130 }]}
                      >
                        {item.description}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {currencyFormatter(item.price)}
                      </Text>
                    </View>
                    {item.ProductType?.name === "Đồ ăn" && (
                      <View style={styles.quantityContainer}>
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
                        <Text style={styles.quantityText}>{quantity}</Text>
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
                    )}
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: APP_COLOR.YELLOW,
  },
  spacer: {
    height: 10,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: APP_COLOR.ORANGE,
    fontWeight: "600",
    fontFamily: FONTS.medium,
    fontSize: 17,
  },
  viewAllContainer: {
    position: "absolute",
    flexDirection: "row",
    right: 3,
  },
  viewAllText: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.medium,
    fontSize: 17,
  },
  navigateIcon: {
    marginTop: 2,
  },
  flatListContent: {
    gap: 7,
    paddingRight: 10,
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: APP_COLOR.DARK_YELLOW,
    borderRadius: 10,
    marginTop: 10,
    gap: 5,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  itemImage: {
    height: 130,
    width: 140,
    borderRadius: 10,
    opacity: 0.85,
  },
  ratingContainer: {
    position: "absolute",
    top: -10,
    right: -10,
    flexDirection: "row",
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    opacity: 0.8,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  ratingText: {
    color: APP_COLOR.ORANGE,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  itemTextContainer: {
    padding: 5,
  },
  itemName: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: APP_COLOR.BROWN,
    marginBottom: 5,
  },
  itemPrice: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.bold,
    fontSize: 15,
    position: "relative",
    left: 50,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 50,
    marginBottom: 7,
    borderWidth: 0.5,
    borderColor: APP_COLOR.BROWN,
    marginHorizontal: "auto",
  },
  quantityText: {
    minWidth: 25,
    textAlign: "center",
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 700,
    overflow: "hidden",
  },
  modalCloseIcon: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 1000,
  },
  modalImage: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
  },
  modalProductName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    marginTop: 5,
    marginHorizontal: 10,
  },
  modalProductPrice: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: APP_COLOR.ORANGE,
    textAlign: "center",
  },
  loader: {
    width: "100%",
  },
});

export default CollectionHome;
