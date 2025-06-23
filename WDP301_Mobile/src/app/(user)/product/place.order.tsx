import { useCurrentApp } from "@/context/app.context";
import { FONTS } from "@/theme/typography";
import { jwtDecode } from "jwt-decode";
import { currencyFormatter } from "@/utils/api";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import Toast from "react-native-root-toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Formik } from "formik";
import { ChangePasswordSchema } from "@/utils/validate.schema";
import CustomerInforInput from "@/components/input/customerInfo.input";
import ShareButton from "@/components/button/share.button";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import logo from "@/assets/logo.png";

interface IOrderItem {
  image: string;
  title: string;
  option: string;
  price: number;
  quantity: number;
  productId: number;
}
interface ICusInfor {
  address: string;
  phone: string;
  fullName: string;
  userId: number;
}
interface IDetails {
  productId: number;
  quantity: number;
}
const PlaceOrderPage = () => {
  const { restaurant, cart, setCart, locationReal } = useCurrentApp();
  const [orderItems, setOrderItems] = useState<IOrderItem[]>([]);
  const [decodeToken, setDecodeToken] = useState<any>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [cusAddress, setCusAddress] = useState();
  const [cusPhone, setCusPhone] = useState();
  const { branchId } = useCurrentApp();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const dropdownItems = [
    { id: "1", title: "COD" },
    { id: "2", title: "PAYOS" },
  ];
  const [addresses, setAddresses] = useState<ICusInfor[]>([
    {
      userId: 1,
      fullName: "Home",
      address: "Hồ Chí Minh, Việt Nam",
      phone: "0889679561",
    },
    {
      userId: 2,
      fullName: "Office",
      address: "Hà Nội, Việt Nam",
      phone: "0889679561",
    },
    {
      userId: 3,
      fullName: "Friend's Place",
      address: "Đà Nẵng, Việt Nam",
      phone: "0889679561",
    },
  ]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<
    { productId: number; quantity: number }[]
  >([]);
  const [couponStatus, setCouponStatus] = useState(false);
  const handleCreateOrder = async (
    promotionCode: string,
    note: string,
    address: string,
    phoneNumber: string,
    branchId: number,
    pointUsed: number,
    pointEarned: number,
    paymentMethodId: number,
    orderItems: any,
    pickUp: boolean
  ) => {
    try {
      if (!decodeToken) {
        Toast.show("Vui lòng đăng nhập để đặt hàng!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: "red",
          opacity: 1,
        });
        return;
      }
      const numericPointUsed = Number(pointUsed) || 0;
      console.log(
        promotionCode,
        note,
        address,
        phoneNumber,
        branchId,
        pointUsed,
        pointEarned,
        paymentMethodId,
        orderItems,
        pickUp
      );

      const response = await axios.post(`${BASE_URL}/orders/`, {
        customerId: decodeToken,
        promotionCode,
        note,
        address,
        phoneNumber,
        branchId: Number(branchId),
        pointUsed: numericPointUsed,
        pointEarned,
        paymentMethodId,
        orderItems,
        pickUp,
      });

      if (response.data) {
        if (paymentMethodId === 2) {
          const link = response.data.data.payment_url;
          try {
            await WebBrowser.openBrowserAsync(link);
          } catch (error) {
            console.error("Error opening payment URL:", error);
            Toast.show("Không thể mở trang thanh toán!", {
              duration: Toast.durations.LONG,
              textColor: "white",
              backgroundColor: "red",
              opacity: 1,
            });
          }
        } else {
          Toast.show("Đặt hàng thành công!", {
            duration: Toast.durations.LONG,
            textColor: "white",
            backgroundColor: APP_COLOR.ORANGE,
            opacity: 1,
          });
          setCart(0);
          router.replace("/(tabs)");
        }
      }
    } catch (error) {
      console.error("Error creating order:", error);

      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.message || "Có lỗi xảy ra khi đặt hàng!";
        Toast.show(errorMessage, {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: "red",
          opacity: 1,
        });
      } else {
        Toast.show("Có lỗi xảy ra khi đặt hàng!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: "red",
          opacity: 1,
        });
      }
    }
  };

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setDecodeToken(decoded.id);
        } else {
          console.log("No access token found.");
        }
      } catch (error) {
        console.error("Error retrieving access token:", error);
      }
    };
    getAccessToken();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resDefault = await axios.get(
          `${BASE_URL}/information/default?customerId=${decodeToken}`
        );
        setSelectedAddress(resDefault.data.data);
        setCusAddress(resDefault.data.data.address);
        setCusPhone(resDefault.data.data.phone);
        const resAddresses = await axios.get(
          `${BASE_URL}/information/${decodeToken}`
        );
        if (resAddresses.data.data) {
          setAddresses(resAddresses.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (decodeToken) {
      fetchData();
    }
  }, [decodeToken]);

  useEffect(() => {
    if (cart && restaurant && restaurant._id) {
      const result = [];
      const details: IDetails[] = [];
      for (const [menuItemId, currentItems] of Object.entries(
        cart[restaurant._id].items
      )) {
        if (currentItems.extra) {
          for (const [key, value] of Object.entries(currentItems.extra)) {
            const option = currentItems.data.options?.find(
              (item) => `${item.title}-${item.description}` === key
            );
            const addPrice = option?.additionalPrice ?? 0;
            result.push({
              image: currentItems.data.image,
              title: currentItems.data.name,
              option: key,
              price: currentItems.data.price + addPrice,
              quantity: value,
              productId: currentItems.data.productId,
            });
          }
        } else {
          result.push({
            image: currentItems.data.image,
            title: currentItems.data.name,
            option: "",
            price: currentItems.data.price,
            quantity: currentItems.quantity,
            productId: currentItems.data.productId,
          });
        }

        details.push({
          productId: currentItems.data.productId,
          quantity: currentItems.quantity,
        });
      }
      setOrderItems(result);
      setOrderDetails(details);
    }
  }, [restaurant]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.includes("order-success")) {
        Toast.show("Thanh toán thành công!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
        setCart(0);
        router.replace("/(tabs)");
      }
    };
    const subscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("order-success")) {
        Toast.show("Thanh toán thành công!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
        setCart(0);
        router.replace("/(tabs)");
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
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
  const handleSelectAddress = (address: any, locationReal: any) => {
    if (locationReal) {
      address.address = locationReal;
    }
    setSelectedAddress(address);
    setModalVisible(false);
    Toast.show(`Selected Address: ${address.fullName}`, {
      duration: Toast.durations.LONG,
      textColor: "white",
      backgroundColor: APP_COLOR.ORANGE,
      opacity: 1,
    });
  };

  const handleCreateNewAddress = () => {
    router.navigate("/(user)/account/customer.info");
  };

  const handlePaymentMethodChange = (
    value: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setSelectedOption(value);
    setFieldValue("paymentMethodId", Number(value));
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
      }}
    >
      <ScrollView style={{ flex: 1, paddingHorizontal: 10 }}>
        <Image
          source={logo}
          style={{
            width: 150,
            height: 100,
            alignSelf: "center",
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            position: "relative",
            top: -5,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.bold,
              fontSize: 20,
              color: APP_COLOR.BROWN,
              position: "relative",
              top: 5,
            }}
          >
            Giao hàng
          </Text>
          <Pressable onPress={() => setModalVisible(true)}>
            <View
              style={{
                backgroundColor: APP_COLOR.BROWN,
                padding: 7,
                borderRadius: 50,
              }}
            >
              <Feather name="edit-2" size={20} color={APP_COLOR.WHITE} />
            </View>
          </Pressable>
        </View>
        <Pressable style={{ paddingBottom: 10 }}>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <View style={styles.headerContainer}>
              <View
                style={[
                  styles.customersInfo,
                  { justifyContent: "space-between", width: "98%" },
                ]}
              >
                <Text style={styles.cusInfo}>
                  {selectedAddress
                    ? selectedAddress.fullName
                    : "FPT University"}
                </Text>
                <Text style={styles.cusInfo}>
                  {selectedAddress ? selectedAddress.phone : "0889679561"}
                </Text>
              </View>
              <View style={styles.customersInfo}>
                <Text
                  style={styles.cusInfo}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {selectedAddress
                    ? selectedAddress.address
                    : "Hồ Chí Minh, Việt Nam"}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>

        <Text
          style={{
            fontFamily: FONTS.bold,
            fontSize: 20,
            color: APP_COLOR.BROWN,
            marginBottom: 5,
          }}
        >
          Chi tiết đơn hàng
        </Text>
        {orderItems?.map((item, index) => {
          return (
            <View
              key={`${item.productId}-${index}`}
              style={{
                gap: 10,
                flexDirection: "row",
                paddingBottom: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.regular,
                    fontSize: 17,
                    color: APP_COLOR.BROWN,
                  }}
                >
                  {item.title} x {item.quantity}
                </Text>

                <Text
                  style={{
                    fontFamily: FONTS.regular,
                    fontSize: 17,
                    color: APP_COLOR.BROWN,
                  }}
                >
                  {currencyFormatter(item.price)}
                </Text>
              </View>
            </View>
          );
        })}

        <Formik
          validationSchema={ChangePasswordSchema}
          initialValues={{
            promotionCode: "",
            note: "",
            address: "",
            phoneNumber: "",
            branchId: 0,
            pointUsed: 0,
            pointEarned: 0,
            paymentMethodId: 0,
            orderItems: [
              {
                productId: 0,
                quantity: 0,
              },
            ],
            pickUp: false,
          }}
          onSubmit={(values) => {
            const numericPointUsed = Number(values.pointUsed) || 0;
            if (numericPointUsed < 0) {
              Toast.show("Điểm sử dụng không thể là số âm!", {
                duration: Toast.durations.LONG,
                textColor: "white",
                backgroundColor: "red",
                opacity: 1,
              });
              return;
            }

            handleCreateOrder(
              values.promotionCode,
              values.note,
              values.address,
              values.phoneNumber,
              values.branchId,
              numericPointUsed,
              values.pointEarned,
              values.paymentMethodId,
              values.orderItems,
              values.pickUp
            );
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => {
            useEffect(() => {
              if (cusAddress || cusPhone) {
                setFieldValue("address", cusAddress);
                setFieldValue("phoneNumber", cusPhone);
              }
              if (orderDetails) {
                setFieldValue("orderItems", orderDetails);
              }
              if (branchId) {
                setFieldValue("branchId", branchId);
              }
              if (restaurant && cart?.[restaurant._id]) {
                const totalAmount = cart[restaurant._id].sum;
                const earnedPoints = Math.floor(totalAmount / 1000);
                setFieldValue("pointEarned", earnedPoints);
                const currentPointUsed = Number(values.pointUsed) || 0;
                setFieldValue("pointUsed", currentPointUsed);
              }
            }, [
              cusAddress,
              cusPhone,
              orderDetails,
              restaurant,
              cart,
              branchId,
            ]);
            return (
              <View style={styles.container}>
                {orderItems?.length > 0 && (
                  <View
                    style={{
                      marginVertical: 15,
                      borderTopWidth: 0.5,
                      borderTopColor: APP_COLOR.BROWN,
                      paddingTop: 10,
                    }}
                  >
                    <View style={styles.textInputView}>
                      <Text style={styles.textInputText}>
                        Tổng tiền (
                        {restaurant &&
                          cart?.[restaurant._id] &&
                          cart?.[restaurant._id].quantity}{" "}
                        món)
                      </Text>
                      <Pressable
                        onPress={() => {
                          couponStatus === true
                            ? setCouponStatus(false)
                            : setCouponStatus(true);
                        }}
                      >
                        <Text
                          style={{
                            color: APP_COLOR.ORANGE,
                            fontFamily: FONTS.regular,
                            textDecorationLine: "underline",
                            marginVertical: "auto",
                          }}
                        >
                          {values.promotionCode ? (
                            <Text
                              style={{
                                textDecorationLine: "none",
                                fontSize: 18,
                              }}
                            >
                              {values.promotionCode}
                            </Text>
                          ) : (
                            "Áp dụng mã khuyến mãi"
                          )}
                        </Text>
                      </Pressable>
                    </View>

                    <View style={styles.textInputView}>
                      <Text
                        style={[
                          styles.textInputText,
                          { fontFamily: FONTS.regular, fontSize: 17 },
                        ]}
                      >
                        Thành tiền
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.regular,
                          fontSize: 17,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {currencyFormatter(calculateTotalPrice() || 0)}
                      </Text>
                    </View>
                    <View style={styles.textInputView}>
                      <Text
                        style={[
                          styles.textInputText,
                          { fontFamily: FONTS.regular, fontSize: 17 },
                        ]}
                      >
                        Phí giao hàng
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.regular,
                          fontSize: 17,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {currencyFormatter(20000)}
                      </Text>
                    </View>
                    <View style={styles.textInputView}>
                      <Text
                        style={[
                          styles.textInputText,
                          { fontFamily: FONTS.regular, fontSize: 17 },
                        ]}
                      >
                        Giảm giá
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.regular,
                          fontSize: 17,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {currencyFormatter(0)}
                      </Text>
                    </View>
                    <View style={styles.textInputView}>
                      <Text
                        style={[
                          styles.textInputText,
                          { fontFamily: FONTS.bold, fontSize: 20 },
                        ]}
                      >
                        Số tiền thanh toán
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.bold,
                          fontSize: 20,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {currencyFormatter(calculateTotalPrice() + 20000 || 0)}
                      </Text>
                    </View>
                  </View>
                )}
                {couponStatus && (
                  <CustomerInforInput
                    onChangeText={handleChange("promotionCode")}
                    onBlur={handleBlur("promotionCode")}
                    value={values.promotionCode}
                    error={errors.promotionCode}
                    touched={touched.promotionCode}
                    placeholder="Nhập mã khuyến mãi"
                  />
                )}
                <CustomerInforInput
                  title="Sử dụng điểm"
                  onChangeText={(text: any) => {
                    const numericValue = Number(text) || 0;
                    if (numericValue >= 0) {
                      setFieldValue("pointUsed", numericValue);
                    }
                  }}
                  onBlur={handleBlur("pointUsed")}
                  value={String(values.pointUsed)}
                  error={errors.pointUsed}
                  touched={touched.pointUsed}
                  keyboardType="numeric"
                />
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>
                    Phương thức thanh toán
                  </Text>
                  <View style={styles.dropdown}>
                    {dropdownItems.map((item, index) => (
                      <Pressable
                        key={`${item.id}-${index}`}
                        style={[
                          styles.dropdownItem,
                          selectedOption === item.id &&
                            styles.selectedDropdownItem,
                        ]}
                        onPress={() =>
                          handlePaymentMethodChange(item.id, setFieldValue)
                        }
                      >
                        <Text
                          style={[
                            styles.dropdownText,
                            selectedOption === item.id &&
                              styles.selectedDropdownText,
                          ]}
                        >
                          {item.title}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {errors.paymentMethodId && touched.paymentMethodId && (
                    <Text style={styles.errorText}>
                      {errors.paymentMethodId}
                    </Text>
                  )}
                </View>
                <CustomerInforInput
                  title="Mang đi"
                  value={values.pickUp}
                  setValue={(v) => setFieldValue("pickUp", v)}
                  isBoolean={true}
                />
                <CustomerInforInput
                  onChangeText={handleChange("note")}
                  onBlur={handleBlur("note")}
                  value={values.note}
                  error={errors.note}
                  touched={touched.note}
                  placeholder="Ghi chú"
                />
                <ShareButton
                  loading={loading}
                  title="Tạo đơn hàng"
                  onPress={() => {
                    // handleCreateOrder(
                    //   values.promotionCode,
                    //   values.note,
                    //   values.address,
                    //   values.phoneNumber,
                    //   values.branchId,
                    //   values.pointUsed,
                    //   values.pointEarned,
                    //   values.paymentMethodId,
                    //   values.orderItems,
                    //   values.pickUp
                    // );
                    router.navigate("/(auth)/order.success");
                  }}
                  textStyle={{
                    textTransform: "uppercase",
                    color: "#fff",
                    paddingVertical: 5,
                    fontFamily: FONTS.regular,
                    fontSize: 20,
                  }}
                  btnStyle={{
                    justifyContent: "center",
                    borderRadius: 10,
                    paddingVertical: 10,
                    backgroundColor: APP_COLOR.BROWN,
                    width: "100%",
                  }}
                  pressStyle={{ alignSelf: "stretch" }}
                />
              </View>
            );
          }}
        </Formik>
      </ScrollView>
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={{
                fontFamily: FONTS.regular,
                fontSize: 20,
                marginBottom: 10,
              }}
            >
              Chọn địa chỉ giao hàng
            </Text>
            <ScrollView>
              {addresses.map((address: any, index: number) => (
                <Pressable
                  key={`${address.userId}-${index}`}
                  onPress={() => handleSelectAddress(address, locationReal)}
                  style={styles.addressItem}
                >
                  <View>
                    <Text style={styles.textNameInfor}>{address.fullName}</Text>
                    {locationReal ? (
                      <Text style={styles.textInfor}>{locationReal}</Text>
                    ) : (
                      <Text style={styles.textNameInfor}>
                        {address.address}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.textInfor}>{address.phone}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row" }}>
              <Pressable
                onPress={handleCreateNewAddress}
                style={styles.modalButton}
              >
                <Text style={{ color: "white", fontFamily: FONTS.regular }}>
                  Tạo địa chỉ mới
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={{ color: "white", fontFamily: FONTS.regular }}>
                  Đóng
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    gap: 3,
  },
  headerContainer: {
    paddingTop: 5,
    gap: 3,
    borderBottomColor: APP_COLOR.BROWN,
    borderBottomWidth: 0.5,
    paddingBottom: 5,
  },
  customersInfo: {
    flexDirection: "row",
  },
  cusInfo: {
    fontFamily: FONTS.regular,
    fontSize: 17,
    color: APP_COLOR.BROWN,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: APP_COLOR.ORANGE,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: 120,
    marginHorizontal: 3,
  },
  addressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  textInfor: {
    color: APP_COLOR.GREY,
    fontFamily: FONTS.regular,
    fontSize: 17,
  },
  textNameInfor: {
    fontFamily: FONTS.regular,
    fontSize: 17,
  },
  textInputView: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textInputText: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginVertical: "auto",
  },
  dropdownContainer: {
    marginBottom: 15,
    marginHorizontal: 5,
  },
  dropdownLabel: {
    fontFamily: FONTS.regular,
    fontSize: 17,
    marginBottom: 8,
    color: APP_COLOR.BROWN,
  },
  dropdown: {
    flexDirection: "row",
    gap: 9,
  },
  dropdownItem: {
    flex: 1,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLOR.BROWN,
    alignItems: "center",
  },
  selectedDropdownItem: {
    backgroundColor: APP_COLOR.BROWN,
  },
  dropdownText: {
    fontFamily: FONTS.regular,
    fontSize: 17,
    color: APP_COLOR.BROWN,
  },
  selectedDropdownText: {
    color: APP_COLOR.WHITE,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
export default PlaceOrderPage;
