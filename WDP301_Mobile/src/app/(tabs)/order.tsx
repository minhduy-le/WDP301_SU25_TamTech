import { currencyFormatter } from "@/utils/api";
import { jwtDecode } from "jwt-decode";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "@/assets/logo.png";
import { FONTS } from "@/theme/typography";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const OrderPage = () => {
  const [orderHistory, setOrderHistory] = useState<IOrderHistoryCus[]>([]);
  const [orderId, setOrderid] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const styles = StyleSheet.create({
    deliveryText: {
      fontFamily: FONTS.bold,
      fontSize: 17,
    },
    dateText: {
      fontFamily: FONTS.regular,
      fontSize: 17,
      color: APP_COLOR.BROWN,
      position: "absolute",
      left: 180,
    },
    text: {
      fontFamily: FONTS.bold,
      fontSize: 17,
      color: APP_COLOR.BROWN,
      marginLeft: 5,
      marginBottom: 5,
      marginTop: 5,
    },
    earnPoint: {
      fontFamily: FONTS.regular,
      fontSize: 17,
      color: APP_COLOR.BROWN,
    },
    statusLayout: {
      width: 120,
      height: 35,
    },
    statusText: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      marginHorizontal: "auto",
      marginVertical: "auto",
    },
    container: {
      marginHorizontal: "auto",
      flexDirection: "row",
      gap: 10,
    },
    button: {
      backgroundColor: APP_COLOR.WHITE,
      borderWidth: 1,
      borderColor: APP_COLOR.BROWN,
      paddingVertical: 9,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: 150,
      height: 42,
    },
    buttonText: {
      color: APP_COLOR.BROWN,
      fontSize: 17,
      fontFamily: FONTS.regular,
      marginHorizontal: "auto",
    },
    paginationContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 10,
    },
    paginationButton: {
      backgroundColor: APP_COLOR.ORANGE,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginHorizontal: 10,
    },
    orderText: {
      fontFamily: FONTS.regular,
      color: APP_COLOR.BROWN,
      fontSize: 17,
      marginVertical: 5,
    },
  });

  function formatDateToDDMMYYYY(isoDate: string): string {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}${" "}${day}/${month}/${year}`;
  }
  const sampleData = [
    {
      id: 1,
      orderId: "#2701270005",
      address: "Hồ Chí Minh City",
      orderStatus: "Đang chuẩn bị",
      pointEarned: 7,
      amount: 100000,
      createdAt: "2025-05-19T23:57:09.213+07:00",
      deliveryStatus: "Mang đi",
    },
    {
      id: 2,
      orderId: "#2701270005",
      address: "Hà Nội",
      orderStatus: "Đang giao",
      pointEarned: 10,
      amount: 15000,
      createdAt: "2025-05-18T14:25:00.000+07:00",
      deliveryStatus: "Mang đi",
    },
    {
      id: 3,
      orderId: "#2701270005",
      address: "Đà Nẵng",
      orderStatus: "Đặt hàng thành công",
      pointEarned: 5,
      amount: 80000,
      createdAt: "2025-05-17T11:03:45.000+07:00",
      deliveryStatus: "Dùng tại quán",
    },
    {
      id: 4,
      orderId: "#2701270005",
      address: "Cần Thơ",
      orderStatus: "Đã hủy",
      pointEarned: 0,
      amount: 120000,
      createdAt: "2025-05-16T09:12:30.000+07:00",
      deliveryStatus: "Giao hàng",
    },
    {
      id: 5,
      orderId: "#2701270005",
      address: "Hải Phòng",
      orderStatus: "Đang chuẩn bị",
      pointEarned: 6,
      amount: 140000,
      createdAt: "2025-05-15T16:20:10.000+07:00",
      deliveryStatus: "Mang đi",
    },
    {
      id: 6,
      orderId: "#2701270005",
      address: "Biên Hòa",
      orderStatus: "Chờ thanh toán",
      pointEarned: 9,
      amount: 180000,
      createdAt: "2025-05-14T18:45:00.000+07:00",
      deliveryStatus: "Dùng tại quán",
    },
    {
      id: 7,
      orderId: "#2701270005",
      address: "Nha Trang",
      orderStatus: "Đã giao",
      pointEarned: 4,
      amount: 70000,
      createdAt: "2025-05-13T21:10:20.000+07:00",
      deliveryStatus: "Mang đi",
    },
    {
      id: 8,
      orderId: "#2701270005",
      address: "Huế",
      orderStatus: "Đã hủy",
      pointEarned: 0,
      amount: 60000,
      createdAt: "2025-05-12T13:33:40.000+07:00",
      deliveryStatus: "Dùng tại quán",
    },
    {
      id: 9,
      orderId: "#2701270005",
      address: "Vũng Tàu",
      orderStatus: "Đang chuẩn bị",
      pointEarned: 8,
      amount: 200000,
      createdAt: "2025-05-11T10:05:00.000+07:00",
      deliveryStatus: "Dùng tại quán",
    },
    {
      id: 10,
      orderId: "#2701270005",
      address: "Bình Dương",
      orderStatus: "Đang giao",
      pointEarned: 11,
      amount: 220000,
      createdAt: "2025-05-10T07:30:00.000+07:00",
      deliveryStatus: "Mang đi",
    },
    {
      id: 11,
      orderId: "#2701270005",
      address: "Quảng Ninh",
      orderStatus: "Đã giao",
      pointEarned: 6,
      amount: 130000,
      createdAt: "2025-05-09T15:50:00.000+07:00",
      deliveryStatus: "Dùng tại quán",
    },
  ];

  const handleViewDetails = (id: number) => {
    router.navigate({
      pathname: "/(user)/order/[id]",
      params: { id: id },
    });
  };

  const [decodeToken, setDecodeToken] = useState<any>("");

  useEffect(() => {
    const fetchOrderHistoryWithToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setDecodeToken(decoded.id);

          const res = await axios.get(
            `${BASE_URL}/orders/customer/${decoded.id}?page=${currentPage}&size=10`
          );

          if (res.data.data.content) {
            setOrderHistory(res.data.data.content);
            setTotalPages(res.data.data.totalPages);
          }
        } else {
          console.log("No access token found.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchOrderHistoryWithToken();
  }, [currentPage]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            borderBottomColor: "#eee",
            borderBottomWidth: 1,
            paddingHorizontal: 10,
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                color: APP_COLOR.BROWN,
                marginVertical: "auto",
                fontFamily: FONTS.bold,
                fontSize: 20,
              }}
            >
              Lịch sử mua hàng
            </Text>
            <Image
              source={logo}
              style={{ width: 150, height: 100, marginLeft: 35 }}
            />
          </View>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {sampleData.map((item, index) => {
            return (
              <View key={index}>
                <View
                  style={{
                    padding: 10,
                    flexDirection: "row",
                    gap: 10,
                    backgroundColor: APP_COLOR.DARK_YELLOW,
                    borderRadius: 10,
                    width: "90%",
                    marginHorizontal: "auto",
                  }}
                >
                  <View style={{ gap: 10, width: 320 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingVertical: "auto",
                        borderBottomWidth: 0.5,
                        borderColor: APP_COLOR.BROWN,
                        marginHorizontal: 5,
                        paddingBottom: 5,
                      }}
                    >
                      <Text style={styles.deliveryText}>
                        <Text style={{ color: APP_COLOR.BROWN }}>
                          {item.deliveryStatus}
                        </Text>
                      </Text>
                      <Text style={styles.dateText}>
                        {formatDateToDDMMYYYY(item.createdAt)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <View>
                        <Text style={styles.text}>{item.address}</Text>
                        <Text style={styles.text}>
                          {currencyFormatter(item.amount)} {" | "}
                          <Text style={styles.earnPoint}>
                            (+ {item.pointEarned} điểm)
                          </Text>
                        </Text>
                      </View>
                      <View style={{ marginLeft: 15 }}>
                        <Text style={styles.orderText}>{item.orderId}</Text>
                        <View style={styles.statusLayout}>
                          <Text>
                            {(() => {
                              switch (item.orderStatus) {
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
                                        {item.orderStatus}
                                      </Text>
                                    </View>
                                  );
                                case "Đang giao":
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
                                        {item.orderStatus}
                                      </Text>
                                    </View>
                                  );
                                case "Đã giao":
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
                                        {item.orderStatus}
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
                                        {item.orderStatus}
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
                                        {item.orderStatus}
                                      </Text>
                                    </View>
                                  );
                                case "Chờ thanh toán":
                                  return (
                                    <View
                                      style={[
                                        styles.statusLayout,
                                        {
                                          backgroundColor: "orange",
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
                                        {item.orderStatus}
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
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <View style={styles.container}>
                        <TouchableOpacity
                          style={styles.button}
                          onPress={() => handleViewDetails(item.id)}
                        >
                          <Text style={styles.buttonText}>Xem chi tiết</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.button}
                          onPress={() => handleViewDetails(item.id)}
                        >
                          <Text style={styles.buttonText}>Đánh giá</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{ height: 10 }}></View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default OrderPage;
