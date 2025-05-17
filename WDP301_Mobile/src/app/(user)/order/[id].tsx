import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import logo from "@/assets/logo.png";
import { FONTS } from "@/theme/typography";
import { currencyFormatter } from "@/utils/api";
import axios from "axios";
const OrderDetailsPage = () => {
  const { id } = useLocalSearchParams();
  const orderDetailsData = {
    id: 12,
    subTotal: 180000,
    promotionCode: null,
    discountValue: 0,
    discountPercent: 0,
    amount: 230000,
    shipping_fee: null,
    isPickUp: false,
    delivery_at: null,
    orderStatus: "Chờ Thanh Toán",
    note: "",
    payment_code: null,
    address: "Linh Trung",
    phone: "9999",
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
    return `${day}-${month}-${year}`;
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

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Hóa đơn hàng số {id}</Text>
          <Image source={logo} style={styles.img} />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Hóa đơn</Text>
          <Text style={styles.value}>{orderDetails.id}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Tổng giá món</Text>
          <Text style={styles.value}>
            {currencyFormatter(orderDetails.subTotal)}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Giảm giá</Text>
          <Text style={styles.value}>
            {currencyFormatter(orderDetails.discountValue)}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Tổng giá</Text>
          <Text style={styles.value}>
            {currencyFormatter(orderDetails.amount)}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Trạng thái</Text>
          <Text style={styles.value}>
            {(() => {
              switch (orderDetails.orderStatus) {
                case "Đang Chuẩn Bị":
                  return (
                    <Text style={{ color: APP_COLOR.ORANGE }}>
                      {orderDetails.orderStatus}
                    </Text>
                  );
                case "Đang Giao":
                  return (
                    <Text style={{ color: APP_COLOR.YELLOW }}>
                      {orderDetails.orderStatus}
                    </Text>
                  );
                case "Đã Giao":
                  return (
                    <Text style={{ color: "green" }}>
                      {orderDetails.orderStatus}
                    </Text>
                  );
                case "Đã Hủy":
                  return (
                    <Text style={{ color: "red" }}>
                      {orderDetails.orderStatus}
                    </Text>
                  );
                case "Đặt Hàng Thành Công":
                  return (
                    <Text style={{ color: "blue" }}>
                      {orderDetails.orderStatus}
                    </Text>
                  );
                case "Chờ Thanh Toán":
                  return (
                    <Text style={{ color: "orange" }}>
                      {orderDetails.orderStatus}
                    </Text>
                  );
                default:
                  return null;
              }
            })()}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Địa chỉ</Text>
          <Text style={styles.value}>{orderDetails.address}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Số điện thoại</Text>
          <Text style={styles.value}>{orderDetails.phone}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Tích điểm</Text>
          <Text style={styles.value}>+ ({orderDetails.pointEarned} điểm)</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Thời gian</Text>
          <Text style={styles.value}>
            {formatDateToDDMMYYYY(orderDetails.createdAt)}
          </Text>
        </View>
        <Text style={styles.title}>Món đã đặt</Text>
        {orderDetails.orderItems.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Image
              source={{ uri: item.productImg }}
              style={{ height: 70, width: 70, borderRadius: 10 }}
            />
            <View style={{ marginLeft: 20, marginVertical: "auto" }}>
              <Text style={styles.itemValue}>{item.productName}</Text>
              <Text style={styles.itemValue}>
                {item.quantity} x {currencyFormatter(item.price)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(249, 179, 50, 0.26)",
  },
  img: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 25,
    marginVertical: "auto",
    fontFamily: FONTS.medium,
    color: APP_COLOR.ORANGE,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 23,
    fontFamily: FONTS.regular,
  },
  value: {
    fontSize: 23,
    fontFamily: FONTS.regular,
  },
  itemContainer: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    flexDirection: "row",
  },
  itemLabel: {
    fontSize: 20,
    fontFamily: FONTS.medium,
  },
  itemValue: {
    fontSize: 20,
    fontFamily: FONTS.medium,
    marginBottom: 5,
  },
});

export default OrderDetailsPage;
