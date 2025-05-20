import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
import { currencyFormatter } from "@/utils/api";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Entypo";
const OrderDetailsPage = () => {
  const { id } = useLocalSearchParams();
  const orderDetailsData = {
    id: "#2701270005",
    customerName: "Lê Minh Duy",
    subTotal: 180000,
    promotionCode: null,
    discountValue: 0,
    discountPercent: 0,
    amount: 230000,
    shipping_fee: 12000,
    isPickUp: false,
    delivery_at: "Mang đi",
    orderStatus: "Đã hủy",
    note: "Nhiều dưa chua",
    payment_code: null,
    payment_methods: "Chuyển khoản",
    address: "Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh",
    phone: "0889679555",
    pointUsed: 0,
    pointEarned: 180,
    createdAt: "2025-03-16T18:12:59.145+07:00",
    orderItems: [
      {
        productImg:
          "https://firebasestorage.googleapis.com/v0/b/four-gems.appspot.com/o/product%20image%2Fco%CC%9Bm%20ta%CC%82%CC%81m%20ga%CC%80%20nu%CC%9Bo%CC%9B%CC%81ng.jpg?alt=media&token=d1335d15-cf38-43eb-9dda-3d875b8e103e",
        productId: 4,
        productName: "Cơm tấm gà nướng",
        orderId: 12,
        quantity: 1,
        price: 65000,
        note: "",
        feedback: null,
        feedbackPoint: 0,
        expiredFeedbackTime: null,
        feedBackYet: false,
      },
    ],
  };
  const [orderDetails, setOrderDetails] =
    useState<IOrderDetails>(orderDetailsData);
  function formatDateToDDMMYYYY(isoDate: string): string {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}${" "}${day}/${month}/${year}`;
  }
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/orders/${id}`);
        setOrderDetails(res.data.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };
    fetchOrderDetails();
  }, [id]);

  const statusList = [
    "Đặt hàng thành công",
    "Đang chuẩn bị",
    "Đang vận chuyển",
    "Hoàn thành",
    "Đã hủy",
  ];
  const getCurrentStatusIndex = (status: string) => {
    switch (status) {
      case "Đặt hàng thành công":
        return 0;
      case "Đang chuẩn bị":
        return 1;
      case "Đang vận chuyển":
        return 2;
      case "Hoàn thành":
        return 3;
      case "Đã hủy":
        return 4;
      default:
        return 5;
    }
  };
  const currentStatusIndex = getCurrentStatusIndex(orderDetails.orderStatus);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Giao hàng {id}</Text>
          </View>
          <View style={styles.contentItems}>
            <View>
              <Text style={styles.label}>Thời gian đặt hàng</Text>
              <Text style={styles.value}>
                {formatDateToDDMMYYYY(orderDetails.createdAt)}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Hóa đơn</Text>
              <Text style={styles.value}>{orderDetails.id}</Text>
            </View>
          </View>
          <View style={styles.contentItems}>
            <View>
              <Text style={styles.label}>Hình thức</Text>
              <Text style={styles.value}>{orderDetails.delivery_at}</Text>
            </View>
            <View>
              <Text style={styles.label}>Địa chỉ</Text>
              <Text style={styles.value}>{orderDetails.address}</Text>
            </View>
          </View>
          <View style={styles.orderDetailsStatus}>
            <Text style={styles.statusLabel}>Trạng thái đơn hàng</Text>
            <View style={styles.statusLayout}>
              <Text>
                {(() => {
                  switch (orderDetails.orderStatus) {
                    case "Đang chuẩn bị":
                      return (
                        <View
                          style={[
                            styles.statusLayout,
                            {
                              backgroundColor: APP_COLOR.BROWN,
                              borderRadius: 50,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: APP_COLOR.WHITE },
                            ]}
                          >
                            {orderDetails.orderStatus}
                          </Text>
                        </View>
                      );
                    case "Đang vận chuyển":
                      return (
                        <View
                          style={[
                            styles.statusLayout,
                            {
                              backgroundColor: APP_COLOR.DELIVERY,
                              borderRadius: 50,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: APP_COLOR.WHITE },
                            ]}
                          >
                            {orderDetails.orderStatus}
                          </Text>
                        </View>
                      );
                    case "Hoàn thành":
                      return (
                        <View
                          style={[
                            styles.statusLayout,
                            {
                              backgroundColor: APP_COLOR.DONE,
                              borderRadius: 50,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: APP_COLOR.WHITE },
                            ]}
                          >
                            {orderDetails.orderStatus}
                          </Text>
                        </View>
                      );
                    case "Đã hủy":
                      return (
                        <View
                          style={[
                            styles.statusLayout,
                            {
                              backgroundColor: APP_COLOR.CANCEL,
                              borderRadius: 50,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: APP_COLOR.WHITE },
                            ]}
                          >
                            {orderDetails.orderStatus}
                          </Text>
                        </View>
                      );
                    case "Đặt hàng thành công":
                      return (
                        <View
                          style={[
                            styles.statusLayout,
                            {
                              backgroundColor: APP_COLOR.PENDING,
                              borderRadius: 50,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: APP_COLOR.WHITE },
                            ]}
                          >
                            {orderDetails.orderStatus}
                          </Text>
                        </View>
                      );
                    default:
                      return null;
                  }
                })()}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginVertical: 10,
              marginBottom: 5,
              borderBottomColor: APP_COLOR.BROWN,
              borderBottomWidth: 0.5,
            }}
          >
            <View style={{ alignItems: "center", marginRight: 8 }}>
              {statusList.map((status, idx) => (
                <View key={status} style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor:
                        idx <= currentStatusIndex
                          ? APP_COLOR.BROWN
                          : APP_COLOR.BACKGROUND_ORANGE,
                      borderWidth: 2,
                      borderColor: APP_COLOR.BROWN,
                      zIndex: 2,
                    }}
                  />
                  {idx < statusList.length - 1 && (
                    <View
                      style={{
                        width: 3,
                        height: 24,
                        backgroundColor: APP_COLOR.BROWN,
                        zIndex: 1,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
            <View>
              {statusList.map((status, idx) => (
                <Text
                  key={status}
                  style={{
                    color:
                      idx === currentStatusIndex
                        ? APP_COLOR.ORANGE
                        : APP_COLOR.BROWN,
                    fontFamily:
                      idx === currentStatusIndex ? FONTS.bold : FONTS.regular,
                    marginBottom: Platform.OS === "android" ? 18 : 22,
                  }}
                >
                  {status}
                </Text>
              ))}
            </View>
          </View>
          <View
            style={{
              borderBottomColor: APP_COLOR.BROWN,
              borderBottomWidth: 0.5,
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >
            <Text style={styles.labelIcon}>Thông tin nhận hàng</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.customerValue}>
                {orderDetailsData.customerName}
              </Text>
              <Text
                style={[styles.customerValue, { color: APP_COLOR.ORANGE }]}
              >{`(${orderDetailsData.phone})`}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Entypo
                name="location-pin"
                size={20}
                color={APP_COLOR.ORANGE}
                style={{
                  marginBottom: 5,
                }}
              />
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  fontSize: 14,
                  width: 350,
                  color: APP_COLOR.BROWN,
                }}
              >
                {orderDetailsData.address}
              </Text>
            </View>
          </View>
          <View
            style={{
              borderBottomColor: APP_COLOR.BROWN,
              borderBottomWidth: 0.5,
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >
            <Text style={styles.labelIcon}>Chi tiết đơn hàng</Text>
            {orderDetails.orderItems.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 140,
                    }}
                  >
                    <Text
                      style={[styles.itemValue, { fontFamily: FONTS.bold }]}
                    >
                      {item.productName}
                    </Text>
                    <Text style={[styles.itemValue]}>
                      {currencyFormatter(item.price)}
                    </Text>
                  </View>
                  <Text style={styles.itemValue}>
                    Số lượng: {item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <View
            style={{
              borderBottomColor: APP_COLOR.BROWN,
              borderBottomWidth: 0.5,
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >
            <Text style={[styles.label, { fontSize: 19 }]}>Tổng tiền</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalValue}>Thành tiền</Text>
              <Text style={styles.totalValue}>
                {currencyFormatter(orderDetailsData.amount)}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalValue}>Phí giao hàng</Text>
              <Text style={styles.totalValue}>
                {currencyFormatter(orderDetailsData.shipping_fee)}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalValue}>Giảm giá</Text>
              <Text style={styles.totalValue}>
                {currencyFormatter(orderDetailsData.discountValue)}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalLabel}>Số tiền thanh toán</Text>
              <Text style={styles.totalLabel}>
                {currencyFormatter(
                  orderDetailsData.amount +
                    orderDetailsData.shipping_fee -
                    orderDetailsData.discountValue
                )}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalLabel}>Điểm tích lũy</Text>
              <Text style={styles.totalLabel}>
                {(orderDetailsData.amount +
                  orderDetailsData.shipping_fee -
                  orderDetailsData.discountValue) /
                  1000}{" "}
                điểm
              </Text>
            </View>
          </View>
          <Text style={[styles.label, { width: "100%" }]}>
            Phương thức thanh toán
          </Text>
          <Text style={styles.value}>{orderDetailsData.payment_methods}</Text>
          <Text style={styles.label}>Ghi chú</Text>
          <Text style={styles.value}>{orderDetailsData.note}</Text>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buttonFooter}
                onPress={() => console.log("Hủy")}
              >
                <Text style={styles.buttonText}>Hủy đơn</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonFooter}
                onPress={() => router.navigate("/(tabs)")}
              >
                <Text style={styles.buttonText}>Về trang chủ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  headerTitle: {
    marginBottom: 10,
  },
  img: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 25,
    marginVertical: "auto",
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
  },
  headersContainer: {
    marginTop: 8,
  },
  detailsContainer: { flexDirection: "row", justifyContent: "space-between" },
  label: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    width: 170,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
  },
  statusLabel: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    width: 200,
    marginVertical: "auto",
  },
  value: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
    width: 180,
  },
  totalValue: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
  },
  customerValue: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
    marginHorizontal: 2,
  },
  itemContainer: {
    marginVertical: 8,
    justifyContent: "space-between",
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    flexDirection: "row",
  },
  contentItems: {
    flexDirection: "row",
  },
  itemLabel: {
    fontSize: 20,
    fontFamily: FONTS.medium,
  },
  itemValue: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
  },
  statusLayout: {
    width: 130,
    height: 30,
  },
  orderDetailsStatus: {
    flexDirection: "row",
    marginTop: 7,
  },
  statusText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginHorizontal: "auto",
    marginVertical: "auto",
  },
  containerIcon: {
    padding: 16,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    borderRadius: 10,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    position: "relative",
  },
  left: {
    alignItems: "center",
    width: 24,
    marginRight: 8,
  },
  verticalLine: {
    position: "absolute",
    top: 12,
    bottom: -12,
    width: 2,
    backgroundColor: "#A0522D",
    zIndex: -1,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#A0522D",
    backgroundColor: "#FFEBDD",
  },
  circleDone: {
    backgroundColor: "#A0522D",
  },
  labelIcon: {
    color: APP_COLOR.BROWN,
    fontSize: 14,
    fontFamily: FONTS.bold,
    alignSelf: "center",
  },
  labelDone: {
    fontWeight: "bold",
    color: "#E85A1A",
  },
  buttonContainer: {
    marginHorizontal: "auto",
    flexDirection: "row",
    gap: 10,
  },
  buttonFooter: {
    backgroundColor: APP_COLOR.WHITE,
    borderWidth: 1,
    borderColor: APP_COLOR.BROWN,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: 180,
    marginTop: 10,
    height: 42,
  },
  buttonText: {
    color: APP_COLOR.BROWN,
    fontSize: 17,
    fontFamily: FONTS.regular,
    marginHorizontal: "auto",
  },
});

export default OrderDetailsPage;
