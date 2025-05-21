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
import Entypo from "@expo/vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Formik } from "formik";
import { ChangePasswordSchema } from "@/utils/validate.schema";
import CustomerInforInput from "@/components/input/customerInfo.input";
import ShareButton from "@/components/button/share.button";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";

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
    { id: "1", title: "Tiền mặt" },
    { id: "2", title: "VNPay" },
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
  const styles = StyleSheet.create({
    container: {
      paddingTop: 5,
      gap: 3,
      marginBottom: 30,
    },
    headerContainer: {
      paddingTop: 5,
      gap: 3,
      height: 50,
    },
    locationText: { color: APP_COLOR.BROWN, fontFamily: FONTS.medium },
    customersInfo: {
      flexDirection: "row",
      marginLeft: 10,
    },
    cusInfo: {
      fontFamily: FONTS.medium,
      fontSize: 17,
      color: APP_COLOR.BROWN,
      position: "relative",
      bottom: 2,
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
    dropdownContainer: {
      marginBottom: 15,
    },
    dropdownLabel: {
      fontFamily: FONTS.regular,
      fontSize: 17,
      marginBottom: 8,
      color: APP_COLOR.BROWN,
    },
    dropdown: {
      flexDirection: "row",
      gap: 10,
    },
    dropdownItem: {
      flex: 1,
      padding: 10,
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
      fontSize: 16,
      color: APP_COLOR.BROWN,
    },
    selectedDropdownText: {
      color: "white",
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginTop: 4,
    },
  });

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
              image: currentItems.data.productImage,
              title: currentItems.data.title,
              option: key,
              price: currentItems.data.basePrice + addPrice,
              quantity: value,
              productId: currentItems.data.productId,
            });
          }
        } else {
          result.push({
            image: currentItems.data.productImage,
            title: currentItems.data.title,
            option: "",
            price: currentItems.data.basePrice,
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
        router.replace("/(tabs)/");
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
    <View
      style={{
        flex: 1,
        backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
        paddingTop: 30,
      }}
    >
      <Pressable style={{ height: 100 }} onPress={() => setModalVisible(true)}>
        <View
          style={{
            flexDirection: "row",
            marginTop: Platform.OS === "ios" ? 20 : 0,
          }}
        >
          <View style={styles.headerContainer}>
            <View style={styles.customersInfo}>
              <Text style={styles.locationText}>Tên khách hàng: </Text>
              <Text style={styles.cusInfo}>
                {selectedAddress ? selectedAddress.fullName : "FPT University"}
              </Text>
            </View>
            <View style={styles.customersInfo}>
              <Text style={styles.locationText}>Số điện thoại: </Text>
              <Text style={styles.cusInfo}>
                {selectedAddress ? selectedAddress.phone : "0889679561"}
              </Text>
            </View>
            <View style={styles.customersInfo}>
              <Text style={styles.locationText}>Địa chỉ giao hàng: </Text>
              <Text
                style={styles.cusInfo}
                numberOfLines={1}
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
      <ScrollView style={{ flex: 1, padding: 10 }}>
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
              <Image
                style={{ height: 70, width: 70, borderRadius: 10 }}
                source={{
                  uri: item.image,
                }}
              />
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    fontFamily: FONTS.regular,
                    fontSize: 20,
                    color: APP_COLOR.BROWN,
                  }}
                >
                  {item.title} x{" "}
                </Text>
                <View>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontFamily: FONTS.regular,
                      fontSize: 20,
                      color: APP_COLOR.BROWN,
                    }}
                  >
                    {item.quantity}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    fontSize: 20,
                    color: APP_COLOR.BROWN,
                    position: "absolute",
                    top: 35,
                    left: 190,
                  }}
                >
                  {currencyFormatter(item.price)}
                </Text>
              </View>
            </View>
          );
        })}
        {orderItems?.length > 0 && (
          <View style={{ marginVertical: 15 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderTopWidth: 1,
                borderTopColor: APP_COLOR.BROWN,
              }}
            >
              <Text
                style={{
                  color: APP_COLOR.BROWN,
                  fontFamily: FONTS.bold,
                  fontSize: 20,
                  marginVertical: "auto",
                }}
              >
                Tổng cộng (
                {restaurant &&
                  cart?.[restaurant._id] &&
                  cart?.[restaurant._id].quantity}{" "}
                món)
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: 25,
                  color: APP_COLOR.BROWN,
                  textDecorationLine: "underline",
                }}
              >
                {currencyFormatter(
                  restaurant &&
                    cart?.[restaurant._id] &&
                    cart?.[restaurant._id].sum
                )}
              </Text>
            </View>
          </View>
        )}
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
              <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                  <CustomerInforInput
                    title="Mã khuyến mãi"
                    onChangeText={handleChange("promotionCode")}
                    onBlur={handleBlur("promotionCode")}
                    value={values.promotionCode}
                    error={errors.promotionCode}
                    touched={touched.promotionCode}
                  />
                  <CustomerInforInput
                    title="Ghi chú"
                    onChangeText={handleChange("note")}
                    onBlur={handleBlur("note")}
                    value={values.note}
                    error={errors.note}
                    touched={touched.note}
                  />
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
                  <ShareButton
                    loading={loading}
                    title="Tạo đơn hàng"
                    onPress={() => {
                      handleCreateOrder(
                        values.promotionCode,
                        values.note,
                        values.address,
                        values.phoneNumber,
                        values.branchId,
                        values.pointUsed,
                        values.pointEarned,
                        values.paymentMethodId,
                        values.orderItems,
                        values.pickUp
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
              </SafeAreaView>
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
    </View>
  );
};

export default PlaceOrderPage;
