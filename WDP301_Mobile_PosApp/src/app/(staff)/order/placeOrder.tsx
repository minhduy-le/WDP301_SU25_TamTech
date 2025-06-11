import confirmOrder from "@/assets/data/confirm-order.png";
import ShareButton from "@/components/btnComponent/shareBtn";
import ShareUnderlineInput from "@/components/btnComponent/shareUnderlineSearch";

import CustomerInforInput from "@/components/orderComponent/cusInforInput";
import StaffOrderCard from "@/components/orderComponent/orderCard";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import { useCurrentApp } from "@/context/app.context";
import { ChangePasswordSchema } from "@/utils/validate.schema";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

interface IOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
const dataSample = [
  { id: "1", name: "Cơm sườn chả", price: 65000, quantity: 1 },
  { id: "2", name: "Phở bò tái nạm", price: 70000, quantity: 2 },
  { id: "3", name: "Bún riêu cua", price: 55000, quantity: 1 },
  { id: "4", name: "Mì Quảng đặc biệt", price: 75000, quantity: 1 },
  { id: "5", name: "Bánh mì thịt nướng", price: 40000, quantity: 3 },
];
const PlaceOrderPage = () => {
  const { cart, setCart } = useCurrentApp();
  const [orderItems, setOrderItems] = useState<IOrderItem[]>(dataSample);
  const [decodeToken, setDecodeToken] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [cusAddress, setCusAddress] = useState();
  const [cusPhone, setCusPhone] = useState();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const dropdownItems = [
    { id: "1", title: "COD" },
    { id: "2", title: "Chuyển khoản" },
  ];
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

      //       const response = await axios.post(`${BASE_URL}/orders/`, {
      //         customerId: decodeToken,
      //         promotionCode,
      //         note,
      //         address,
      //         phoneNumber,
      //         branchId: Number(branchId),
      //         pointUsed: numericPointUsed,
      //         pointEarned,
      //         paymentMethodId,
      //         orderItems,
      //         pickUp,
      //       });

      //       if (response.data) {
      //         if (paymentMethodId === 2) {
      //           const link = response.data.data.payment_url;
      //           try {
      //             await WebBrowser.openBrowserAsync(link);
      //           } catch (error) {
      //             console.error("Error opening payment URL:", error);
      //             Toast.show("Không thể mở trang thanh toán!", {
      //               duration: Toast.durations.LONG,
      //               textColor: "white",
      //               backgroundColor: "red",
      //               opacity: 1,
      //             });
      //           }
      //         } else {
      //           Toast.show("Đặt hàng thành công!", {
      //             duration: Toast.durations.LONG,
      //             textColor: "white",
      //             backgroundColor: APP_COLOR.ORANGE,
      //             opacity: 1,
      //           });
      //           setCart(0);
      //         //   router.replace("/(tabs)");
      //         }
      //       }
      //     } catch (error: any) {
      //       console.error("Error creating order:", error);

      //       if (axios.isAxiosError(error) && error.response) {
      //         const errorMessage =
      //           error.response.data.message || "Có lỗi xảy ra khi đặt hàng!";
      //         Toast.show(errorMessage, {
      //           duration: Toast.durations.LONG,
      //           textColor: "white",
      //           backgroundColor: "red",
      //           opacity: 1,
      //         });
      //       } else {
      //         Toast.show("Có lỗi xảy ra khi đặt hàng!", {
      //           duration: Toast.durations.LONG,
      //           textColor: "white",
      //           backgroundColor: "red",
      //           opacity: 1,
      //         });
      //       }
      //     }
    } catch (error: any) {
      console.error("Error creating order:", error);
    }
  };

  //   useEffect(() => {
  //     const getAccessToken = async () => {
  //       try {
  //         const token = await AsyncStorage.getItem("access_token");
  //         if (token) {
  //           const decoded = jwt_decode(token);
  //           setDecodeToken(decoded.id);
  //         } else {
  //           console.log("No access token found.");
  //         }
  //       } catch (error) {
  //         console.error("Error retrieving access token:", error);
  //       }
  //     };
  //     getAccessToken();
  //   }, []);
  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const resDefault = await axios.get(
  //           `${BASE_URL}/information/default?customerId=${decodeToken}`
  //         );
  //         setSelectedAddress(resDefault.data.data);
  //         setCusAddress(resDefault.data.data.address);
  //         setCusPhone(resDefault.data.data.phone);
  //         const resAddresses = await axios.get(
  //           `${BASE_URL}/information/${decodeToken}`
  //         );
  //         if (resAddresses.data.data) {
  //           setAddresses(resAddresses.data.data);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     };

  //     if (decodeToken) {
  //       fetchData();
  //     }
  //   }, [decodeToken]);
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    },
    gradientContainer: {
      flex: 1,
      borderRadius: 13,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
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
      fontFamily: APP_FONT.REGULAR,
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
      fontFamily: APP_FONT.REGULAR,
      fontSize: 17,
    },
    textNameInfor: {
      fontFamily: APP_FONT.REGULAR,
      fontSize: 17,
    },
    textInputView: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    textInputText: {
      color: APP_COLOR.BROWN,
      fontFamily: APP_FONT.BOLD,
      fontSize: 17,
      marginVertical: "auto",
    },
    dropdownContainer: {
      marginBottom: 15,
    },
    dropdownLabel: {
      fontFamily: APP_FONT.REGULAR,
      fontSize: 15,
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
      fontFamily: APP_FONT.REGULAR,
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

  //   useEffect(() => {
  //     if (cart && restaurant && restaurant._id) {
  //       const result = [];
  //       const details: IDetails[] = [];
  //       for (const [menuItemId, currentItems] of Object.entries(
  //         cart[restaurant._id].items
  //       )) {
  //         if (currentItems.extra) {
  //           for (const [key, value] of Object.entries(currentItems.extra)) {
  //             const option = currentItems.data.options?.find(
  //               (item : any) => `${item.title}-${item.description}` === key
  //             );
  //             const addPrice = option?.additionalPrice ?? 0;
  //             result.push({
  //               image: currentItems.data.productImage,
  //               title: currentItems.data.title,
  //               option: key,
  //               price: currentItems.data.basePrice + addPrice,
  //               quantity: value,
  //               productId: currentItems.data.productId,
  //             });
  //           }
  //         } else {
  //           result.push({
  //             image: currentItems.data.productImage,
  //             title: currentItems.data.title,
  //             option: "",
  //             price: currentItems.data.basePrice,
  //             quantity: currentItems.quantity,
  //             productId: currentItems.data.productId,
  //           });
  //         }

  //         details.push({
  //           productId: currentItems.data.productId,
  //           quantity: currentItems.quantity,
  //         });
  //       }
  //       setOrderItems(result);
  //       setOrderDetails(details);
  //     }
  //   }, [restaurant]);
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
        // router.replace("/(tabs)");
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
        // router.replace("/(tabs)");
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  const handleCreateNewAddress = () => {
    // router.navigate("/(user)/account/customer.info");
  };

  const handlePaymentMethodChange = (
    value: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setSelectedOption(value);
    setFieldValue("paymentMethodId", Number(value));
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        style={styles.gradientContainer}
        colors={[APP_COLOR.BACKGROUND_ORANGE, APP_COLOR.WHITE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, paddingHorizontal: 10 }}
        >
          <Text
            style={{
              fontFamily: APP_FONT.BOLD,
              fontSize: 20,
              color: APP_COLOR.BROWN,
              position: "relative",
              top: 5,
            }}
          >
            Tạo đơn hàng
          </Text>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              source={confirmOrder}
              style={{
                height: 160,
                width: 160,
                marginBottom: 10,
              }}
            />
            <Text
              style={{
                color: APP_COLOR.BROWN,
                fontFamily: APP_FONT.REGULAR,
                fontSize: 15,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Điền đầy đủ thông tin bên dưới để tạo đơn hàng.
            </Text>
          </View>
          <View
            style={{
              borderWidth: 0.5,
              padding: 10,
              borderColor: APP_COLOR.BROWN,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                borderBottomColor: APP_COLOR.BROWN,
                borderBottomWidth: 0.5,
                paddingBottom: 15,
              }}
            >
              <Text
                style={{
                  fontFamily: APP_FONT.BOLD,
                  fontSize: 19,
                  color: APP_COLOR.BROWN,
                  position: "relative",
                  top: 5,
                }}
              >
                Thông tin đơn hàng
              </Text>
            </View>
            <View
              style={{
                borderBottomColor: APP_COLOR.BROWN,
                borderBottomWidth: 0.5,
                paddingBottom: 13,
                marginBottom: 10,
              }}
            >
              <ShareUnderlineInput />
              <View style={{ flexDirection: "row", gap: 5, marginTop: 10 }}>
                <Text
                  style={{
                    color: APP_COLOR.BROWN,
                    fontSize: 15,
                    fontFamily: APP_FONT.MEDIUM,
                  }}
                >
                  Họ và tên:
                </Text>
                <Text
                  style={{
                    color: APP_COLOR.ORANGE,
                    fontSize: 16,
                    fontFamily: APP_FONT.REGULAR,
                  }}
                >
                  Lê Minh Duy
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 5, marginTop: 5 }}>
                <Text
                  style={{
                    color: APP_COLOR.BROWN,
                    fontSize: 15,
                    fontFamily: APP_FONT.MEDIUM,
                  }}
                >
                  Địa chỉ:
                </Text>
                <Text
                  style={{
                    color: APP_COLOR.ORANGE,
                    fontSize: 16,
                    fontFamily: APP_FONT.REGULAR,
                  }}
                >
                  TP Thủ Đức, TP Hồ Chí Minh
                </Text>
              </View>
            </View>
            <Text style={styles.textInputText}>Chi tiết đơn hàng</Text>
            {orderItems.map((item: any, index: any) => {
              return (
                <View
                  key={`${item.id}-${index}`}
                  style={{
                    gap: 10,
                    flexDirection: "row",
                    paddingBottom: 5,
                  }}
                >
                  <StaffOrderCard
                    name={item.name}
                    price={item.price}
                    quantity={item.quantity}
                  />
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
                }, [cusAddress, cusPhone, orderDetails, cart]);
                return (
                  <View style={styles.container}>
                    {orderItems?.length > 0 && (
                      <View
                        style={{
                          marginTop: 15,
                          borderTopWidth: 0.5,
                          borderTopColor: APP_COLOR.BROWN,
                          paddingTop: 10,
                        }}
                      >
                        <View style={styles.textInputView}>
                          <Text style={styles.textInputText}>Tổng tiền</Text>
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
                                fontFamily: APP_FONT.REGULAR,
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
                              { fontFamily: APP_FONT.REGULAR, fontSize: 15 },
                            ]}
                          >
                            Thành tiền
                          </Text>
                          <Text
                            style={{
                              fontFamily: APP_FONT.REGULAR,
                              fontSize: 17,
                              color: APP_COLOR.BROWN,
                            }}
                          >
                            {currencyFormatter(cart.default.sum)}
                          </Text>
                        </View>
                        <View style={styles.textInputView}>
                          <Text
                            style={[
                              styles.textInputText,
                              { fontFamily: APP_FONT.REGULAR, fontSize: 15 },
                            ]}
                          >
                            Thuế (8%)
                          </Text>
                          <Text
                            style={{
                              fontFamily: APP_FONT.REGULAR,
                              fontSize: 17,
                              color: APP_COLOR.BROWN,
                            }}
                          >
                            {currencyFormatter(cart.default.sum * 0.08)}
                          </Text>
                        </View>
                        <View style={styles.textInputView}>
                          <Text
                            style={[
                              styles.textInputText,
                              { fontFamily: APP_FONT.REGULAR, fontSize: 15 },
                            ]}
                          >
                            Giảm giá
                          </Text>
                          <Text
                            style={{
                              fontFamily: APP_FONT.REGULAR,
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
                              { fontFamily: APP_FONT.BOLD, fontSize: 15 },
                            ]}
                          >
                            Số tiền thanh toán
                          </Text>
                          <Text
                            style={{
                              fontFamily: APP_FONT.BOLD,
                              fontSize: 17,
                              color: APP_COLOR.ORANGE,
                            }}
                          >
                            {currencyFormatter(
                              cart.default.sum - cart.default.sum * 0.08
                            )}
                          </Text>
                        </View>
                      </View>
                    )}
                    {couponStatus && (
                      <CustomerInforInput
                        title="Mã khuyến mãi: "
                        onChangeText={handleChange("promotionCode")}
                        onBlur={handleBlur("promotionCode")}
                        value={values.promotionCode}
                        error={errors.promotionCode}
                        touched={touched.promotionCode}
                        placeholder="Nhập mã khuyến mãi"
                      />
                    )}
                    <CustomerInforInput
                      title="Sử dụng điểm: "
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
                    <CustomerInforInput
                      title="Ghi chú:"
                      onChangeText={handleChange("note")}
                      onBlur={handleBlur("note")}
                      value={values.note}
                      error={errors.note}
                      touched={touched.note}
                      placeholder="Nhập ghi chú..."
                    />
                    <CustomerInforInput
                      title="Mang đi"
                      value={values.pickUp}
                      setValue={(v: any) => setFieldValue("pickUp", v)}
                      isBoolean={true}
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

                    <ShareButton
                      loading={loading}
                      title="Tạo đơn hàng"
                      onPress={() => {
                        // handleCreateOrder(
                        //   values.promotionCode,
                        //   values.note,
                        //   values.address,
                        //   values.phoneNumber,
                        //   values.branchId,
                        //   values.pointUsed,
                        //   values.pointEarned,
                        //   values.paymentMethodId,
                        //   values.orderItems,
                        //   values.pickUp
                        // );
                        // router.navigate("/(auth)/order.success");
                      }}
                      textStyle={{
                        textTransform: "uppercase",
                        color: "#fff",
                        paddingVertical: 5,
                        fontFamily: APP_FONT.REGULAR,
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
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};
export default PlaceOrderPage;
