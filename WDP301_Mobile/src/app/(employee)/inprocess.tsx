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

const InprocessOrder = () => {
  const [orderHistory, setOrderHistory] = useState<IOrderHistoryCus[]>([]);
  const [orderId, setOrderid] = useState();
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

  const fetchOrderHistoryWithToken = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        const decoded = jwtDecode(token);
        setDecodeToken(decoded.id);
        const res = await axios.get(
          `${BASE_URL}/orders/shipper/${decodeToken}?page=0&size=10&statusId=2`
        );

        if (res.data.data.content) {
          setOrderHistory(res.data.data.content);
        }
      } else {
        console.log("No access token found.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (decodeToken) {
      fetchOrderHistoryWithToken();
    }

    const intervalId = setInterval(() => {
      if (decodeToken) {
        fetchOrderHistoryWithToken();
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [decodeToken]);

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
              Đơn hàng chờ giao
            </Text>
            <Image
              source={logo}
              style={{ width: 100, height: 100, marginLeft: 100 }}
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
                    <Text style={styles.text}>Giao đến: {item.address}</Text>
                    <Text style={styles.text}>
                      {formatDateToDDMMYYYY(item.createdAt)}
                    </Text>
                    <Text style={styles.text}>
                      Tổng thu: {currencyFormatter(item.amount)}{" "}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.text}>
                        Trạng thái:{" "}
                        {(() => {
                          switch (item.orderStatus) {
                            case "Đang Chuẩn Bị":
                              return (
                                <Text style={{ color: APP_COLOR.ORANGE }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Đang giao":
                              return (
                                <Text style={{ color: "blue" }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Đã Giao":
                              return (
                                <Text style={{ color: "green" }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Đã Hủy":
                              return (
                                <Text style={{ color: "red" }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Đặt Hàng Thành Công":
                              return (
                                <Text style={{ color: "blue" }}>
                                  {item.orderStatus}
                                </Text>
                              );
                            case "Chờ Thanh Toán":
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
      </View>
    </SafeAreaView>
  );
};

export default InprocessOrder;
