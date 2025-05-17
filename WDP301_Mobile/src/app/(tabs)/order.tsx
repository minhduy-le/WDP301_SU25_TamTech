import {
  currencyFormatter,
  getOrderHistoryAPI,
  getURLBaseBackend,
} from "@/utils/api";
import { jwtDecode } from "jwt-decode";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import { useEffect, useState } from "react";
import {
  Button,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "@/assets/logo.png";
import { FONTS } from "@/theme/typography";
import demo from "@/assets/demo.jpg";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const OrderPage = () => {
  const [orderHistory, setOrderHistory] = useState<IOrderHistoryCus[]>([]);
  const [orderId, setOrderid] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const styles = StyleSheet.create({
    text: {
      fontFamily: FONTS.regular,
      fontSize: 17,
      color: APP_COLOR.ORANGE,
    },
    earnPoint: {
      fontFamily: FONTS.regular,
      fontSize: 17,
      color: "green",
    },
    container: {
      flex: 1,
      position: "absolute",
      bottom: 25,
      left: 200,
    },
    button: {
      backgroundColor: APP_COLOR.WHITE,
      borderWidth: 1,
      borderColor: APP_COLOR.ORANGE,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: 120,
      height: 42,
    },
    buttonText: {
      color: APP_COLOR.ORANGE,
      fontSize: 15,
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
    paginationText: {
      color: APP_COLOR.WHITE,
      fontSize: 16,
      fontFamily: FONTS.regular,
    },
    paginationText1: {
      color: APP_COLOR.ORANGE,
      fontSize: 16,
      fontFamily: FONTS.regular,
    },
  });

  function formatDateToDDMMYYYY(isoDate: string): string {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

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
    <SafeAreaView style={{ flex: 1 }}>
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
                color: APP_COLOR.ORANGE,
                marginVertical: "auto",
                fontFamily: FONTS.bold,
                fontSize: 20,
              }}
            >
              Lịch sử đơn hàng
            </Text>
            <Image
              source={logo}
              style={{ width: 100, height: 100, marginLeft: 110 }}
            />
          </View>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {orderHistory.map((item, index) => {
            return (
              <View key={index}>
                <View
                  style={{
                    padding: 10,
                    flexDirection: "row",
                    gap: 10,
                    backgroundColor: "rgba(249, 179, 50, 0.26)",
                    borderRadius: 10,
                    width: "95%",
                    marginHorizontal: "auto",
                  }}
                >
                  <View style={{ gap: 10 }}>
                    <Text style={styles.text}>{item.address}</Text>
                    <Text style={styles.text}>
                      {formatDateToDDMMYYYY(item.createdAt)}
                    </Text>
                    <Text style={styles.text}>
                      {currencyFormatter(item.amount)}{" "}
                      <Text style={styles.earnPoint}>
                        (+ {item.pointEarned} điểm)
                      </Text>
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.text}>
                        Trạng thái:{" "}
                        {(() => {
                          switch (item.orderStatus) {
                            case "Đang chuẩn bị":
                              return (
                                <Text style={{ color: APP_COLOR.ORANGE }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Đang giao":
                              return (
                                <Text style={{ color: APP_COLOR.YELLOW }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Đã giao":
                              return (
                                <Text style={{ color: "green" }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Đã hủy":
                              return (
                                <Text style={{ color: "red" }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Đặt hàng thành công":
                              return (
                                <Text style={{ color: "blue" }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Chờ thanh toán":
                              return (
                                <Text style={{ color: "orange" }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            default:
                              return null;
                          }
                        })()}
                      </Text>
                      <View style={styles.container}>
                        <TouchableOpacity
                          style={styles.button}
                          onPress={() => handleViewDetails(item.id)}
                        >
                          <Text style={styles.buttonText}>Xem chi tiết</Text>
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

        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            <Text style={styles.paginationText}>Trước</Text>
          </TouchableOpacity>

          <Text style={styles.paginationText1}>
            Trang {currentPage + 1} / {totalPages}
          </Text>

          <TouchableOpacity
            style={styles.paginationButton}
            onPress={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            <Text style={styles.paginationText}>Tiếp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderPage;
