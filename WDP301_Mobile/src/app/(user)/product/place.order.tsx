import { useCurrentApp } from "@/context/app.context";
import { FONTS } from "@/theme/typography";
import { jwtDecode } from "jwt-decode";
import { currencyFormatter } from "@/utils/api";
import { calculateTotalPrice } from "@/utils/cart";
import { APP_COLOR, API_URL } from "@/utils/constant";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Modal,
  Platform,
  TextInput,
  FlatList,
  WebView,
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
  price: number;
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
  const [shippingFee, setShippingFee] = useState<number>(0);
  const dropdownItems = [
    { id: "1", title: "COD" },
    { id: "4", title: "PAYOS" },
  ];
  const [addresses, setAddresses] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [orderDetails, setOrderDetails] = useState<
    { productId: number; quantity: number }[]
  >([]);
  const [couponStatus, setCouponStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const handleCreateOrder = async (
    orderItems: any,
    order_discount_value: number,
    promotion_code: string,
    order_shipping_fee: number,
    payment_method_id: number,
    order_address: string,
    note: string,
    isDatHo: boolean,
    tenNguoiDatHo: string,
    soDienThoaiNguoiDatHo: string,
    customerId: number | string,
    platform: string = "app"
  ) => {
    try {
      if (!customerId) {
        Toast.show("Vui lòng đăng nhập để đặt hàng!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: "red",
          opacity: 1,
        });
        return;
      }
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.post(
        `${API_URL}/api/orders/`,
        {
          orderItems,
          order_discount_value,
          promotion_code,
          order_shipping_fee,
          payment_method_id,
          order_address,
          platform,
          note,
          isDatHo,
          tenNguoiDatHo,
          soDienThoaiNguoiDatHo,
          customerId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data) {
        if (response.data.checkoutUrl) {
          router.push({
            pathname: "/(user)/product/checkout.webview",
            params: { url: response.data.checkoutUrl },
          });
          return;
        }
        if (payment_method_id === 2 && response.data.data?.payment_url) {
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
          router.navigate("/(auth)/order.success");
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

  let timeout: any;
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    waitFor: number
  ) => {
    return (...args: Parameters<T>): Promise<ReturnType<T>> =>
      new Promise((resolve) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  const handleSearch = useCallback(
    debounce(async (text: string) => {
      setSearchTerm(text);
      if (!text) return;
      try {
        const res = await axios.get(
          `https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=${text}&language=vi&key=AIzaSyAwSwTDdF00hbh21k7LsX-4Htuwqm9MlPg`
        );
        if (res.data) {
          setAddressSuggestions(res.data.predictions);
        }
      } catch (e) {
        console.log("Google API error:", e);
      }
    }, 500),
    []
  );

  const handleSelectAddressAuto = async (address: string) => {
    const cleanedAddress = address.replace(/,\s*Việt Nam$/, "");
    setSearchTerm(cleanedAddress);
    setAddressSuggestions([]);
    setSelectedAddress(cleanedAddress);
    setShowSuggestions(false);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.post(
        "https://wdp301-su25.space/api/orders/shipping/calculate",
        {
          deliver_address: cleanedAddress,
          weight: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data && res.data.fee) {
        setShippingFee(res.data.fee);
      }
    } catch (e) {
      setShippingFee(0);
    }
    Toast.show(`Đã chọn địa chỉ: ${cleanedAddress}`, {
      duration: Toast.durations.LONG,
      textColor: "white",
      backgroundColor: APP_COLOR.ORANGE,
      opacity: 1,
    });
  };

  const handleSelectAddress = async (address: string) => {
    const cleanedAddress = address.replace(/,\s*Việt Nam$/, "");
    setSelectedAddress(cleanedAddress);
    setModalVisible(false);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.post(
        "https://wdp301-su25.space/api/orders/shipping/calculate",
        {
          deliver_address: cleanedAddress,
          weight: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data && res.data.fee) {
        setShippingFee(res.data.fee);
      }
    } catch (e) {
      setShippingFee(0);
    }
    Toast.show(`Đã chọn địa chỉ: ${cleanedAddress}`, {
      duration: Toast.durations.LONG,
      textColor: "white",
      backgroundColor: APP_COLOR.ORANGE,
      opacity: 1,
    });
  };

  const handlePaymentMethodChange = (
    value: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setSelectedOption(value);
    setFieldValue("paymentMethodId", Number(value));
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
    const fetchAddresses = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) return;
        const res = await axios.get(
          "https://wdp301-su25.space/api/location/addresses/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "application/json",
            },
          }
        );
        if (res.data && res.data.data) {
          setAddresses(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, []);
  useEffect(() => {
    if (cart && restaurant && restaurant._id) {
      const result = [];
      const details: IDetails[] = [];
      for (const [menuItemId, currentItems] of Object.entries(
        cart[restaurant._id].items
      )) {
        if (currentItems.extra) {
          for (const [key, value] of Object.entries(currentItems.extra)) {
            result.push({
              image: currentItems.data.image,
              title: currentItems.data.name,
              option: key,
              price: currentItems.data.price,
              quantity: value,
              productId: Number(currentItems.data.productId),
            });
          }
        } else {
          result.push({
            image: currentItems.data.image,
            title: currentItems.data.name,
            option: "",
            price: currentItems.data.price,
            quantity: currentItems.quantity,
            productId: Number(currentItems.data.productId),
          });
        }

        details.push({
          productId: Number(currentItems.data.productId),
          quantity: currentItems.quantity,
          price: currentItems.data.price,
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
        </View>
        <View
          style={{
            position: "relative",
            minWidth: 200,
            flex: 1,
          }}
        >
          <TextInput
            placeholder="Nhập địa chỉ của bạn"
            value={searchTerm}
            onFocus={() => setShowSuggestions(true)}
            onChangeText={(text) => {
              setSearchTerm(text);
              handleSearch(text);
              setShowSuggestions(true);
            }}
            style={{
              borderWidth: 1,
              borderColor: APP_COLOR.BROWN,
              borderRadius: 10,
              paddingVertical: 10,
              color: APP_COLOR.BROWN,
              backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
              marginVertical: 10,
              minWidth: 200,
            }}
            placeholderTextColor={APP_COLOR.BROWN}
          />
          {showSuggestions && addressSuggestions.length > 0 && (
            <View
              style={{
                position: "absolute",
                top: 50,
                left: 0,
                right: 0,
                backgroundColor: APP_COLOR.WHITE,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                zIndex: 100,
                maxHeight: 200,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <FlatList
                data={addressSuggestions}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelectAddressAuto(item.description)}
                  >
                    <View style={{ padding: 10 }}>
                      <Text>{item.description}</Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}
          <Text
            style={{
              fontFamily: FONTS.regular,
              fontSize: 17,
              color: APP_COLOR.BROWN,
            }}
          >
            Chi phí giao hàng:{" "}
            <Text style={styles.textInputText}>
              {currencyFormatter(shippingFee)}
            </Text>
          </Text>
        </View>

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
            proxyName: "",
            proxyPhone: "",
          }}
          onSubmit={(values) => {
            handleCreateOrder(
              values.orderItems,
              discountAmount,
              values.promotionCode,
              shippingFee,
              values.paymentMethodId,
              selectedAddress,
              values.note,
              values.pickUp,
              values.proxyName,
              values.proxyPhone,
              decodeToken,
              "app"
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
            useEffect(() => {
              const fetchPromotion = async () => {
                if (values.promotionCode) {
                  try {
                    const token = await AsyncStorage.getItem("access_token");
                    const res = await axios.get(
                      `https://wdp301-su25.space/api/promotions/code/${values.promotionCode}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          accept: "*/*",
                        },
                      }
                    );
                    if (res.data && res.data.discountAmount) {
                      setDiscountAmount(res.data.discountAmount);
                    } else {
                      setDiscountAmount(0);
                    }
                  } catch (e) {
                    setDiscountAmount(0);
                  }
                } else {
                  setDiscountAmount(0);
                }
              };
              fetchPromotion();
            }, [values.promotionCode]);
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
                        {currencyFormatter(
                          calculateTotalPrice(cart, restaurant?._id) || 0
                        )}
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
                        {currencyFormatter(shippingFee)}
                      </Text>
                    </View>
                    <View style={styles.textInputView}>
                      <Text
                        style={[
                          styles.textInputText,
                          { fontFamily: FONTS.regular, fontSize: 17 },
                        ]}
                      >
                        Mã Giảm giá
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.regular,
                          fontSize: 17,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {currencyFormatter(discountAmount)}
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
                        {currencyFormatter(
                          calculateTotalPrice(cart, restaurant?._id) +
                            shippingFee -
                            discountAmount || 0
                        )}
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
                  title="Đặt hàng hộ"
                  value={values.pickUp}
                  setValue={(v) => setFieldValue("pickUp", v)}
                  isBoolean={true}
                />
                {values.pickUp && (
                  <View style={{ marginBottom: 10 }}>
                    <CustomerInforInput
                      title="Tên người nhận hộ"
                      onChangeText={handleChange("proxyName")}
                      onBlur={handleBlur("proxyName ")}
                      value={values.proxyName}
                      error={errors.proxyName}
                      touched={touched.proxyName}
                      placeholder="Nhập tên người nhận hộ"
                    />
                    <CustomerInforInput
                      title="Số điện thoại người nhận hộ"
                      onChangeText={handleChange("proxyPhone")}
                      onBlur={handleBlur("proxyPhone")}
                      value={values.proxyPhone}
                      error={errors.proxyPhone}
                      touched={touched.proxyPhone}
                      placeholder="Nhập số điện thoại người nhận hộ"
                      keyboardType="phone-pad"
                    />
                  </View>
                )}
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
                    handleCreateOrder(
                      values.orderItems,
                      discountAmount,
                      values.promotionCode,
                      shippingFee,
                      values.paymentMethodId,
                      selectedAddress,
                      values.note,
                      values.pickUp,
                      values.proxyName,
                      values.proxyPhone,
                      decodeToken,
                      "app"
                    );
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
              Địa chỉ giao hàng
            </Text>
            <ScrollView>
              {addresses.map((address: string, index: number) => (
                <Pressable
                  key={`${address}-${index}`}
                  onPress={() => handleSelectAddress(address)}
                  style={styles.addressItem}
                >
                  <View>
                    <Text style={styles.textNameInfor}>{address}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
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
