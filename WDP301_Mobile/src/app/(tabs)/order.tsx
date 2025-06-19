import { currencyFormatter } from "@/utils/api";
import { jwtDecode } from "jwt-decode";
import { API_URL, APP_COLOR } from "@/utils/constant";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
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
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
interface IOrderHistoryCus {
  orderId: number;
  order_create_at: string;
  payment_method: string;
  status: string;
  order_address: string;
  order_point_earn: number;
  order_amount: number;
}
interface StatusInfo {
  text: string;
  color: string;
}
const OrderPage = () => {
  const [orderHistory, setOrderHistory] = useState<IOrderHistoryCus[]>([]);
  const [decodeToken, setDecodeToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const STATUS_COLORS = {
    PENDING: "rgba(52, 55, 252, 0.75)",
    APPROVED: "rgba(0, 154, 5, 0.68)",
    PREPARING: "rgba(255, 251, 0, 0.75)",
    COOKED: APP_COLOR.ORANGE,
    DELIVERING: "rgba(3, 169, 244, 0.72)",
    DELIVERED: "rgba(76, 175, 80, 0.70)",
    CANCELED: "rgba(244, 67, 54, 0.70)",
    DEFAULT: "rgba(158, 158, 158, 0.70)",
  };
  const statusMap: Record<string, StatusInfo> = {
    Pending: { text: "Chờ thanh toán", color: STATUS_COLORS.PENDING },
    Paid: { text: "Đã thanh toán", color: STATUS_COLORS.APPROVED },
    Approved: { text: "Đã xác nhận", color: STATUS_COLORS.APPROVED },
    Preparing: { text: "Đang chuẩn bị", color: STATUS_COLORS.PREPARING },
    Cooked: { text: "Đã nấu xong", color: STATUS_COLORS.COOKED },
    Delivering: { text: "Đang giao", color: STATUS_COLORS.DELIVERING },
    Delivered: { text: "Đã giao", color: STATUS_COLORS.DELIVERED },
    Canceled: { text: "Đã hủy", color: STATUS_COLORS.CANCELED },
  };
  const fetchOrderHistoryWithToken = useCallback(async () => {
    setToken(null);
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        setToken(token);
        const decoded: any = jwtDecode(token);
        setDecodeToken(decoded.id);
        const res = await axios.get(`${API_URL}/api/orders/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res?.data) {
          setOrderHistory(res.data);
        }
      }
    } catch (error) {
      setError("Không thể tải lịch sử đơn hàng");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrderHistoryWithToken();
    }, [fetchOrderHistoryWithToken])
  );
  const StatusBadge = ({ status }: { status: string }) => {
    const statusInfo = statusMap[status] || {
      text: status,
      color: STATUS_COLORS.DEFAULT,
    };
    return (
      <View
        style={[styles.statusLayout, { backgroundColor: statusInfo.color }]}
      >
        <Text style={styles.statusText}>{statusInfo.text}</Text>
      </View>
    );
  };

  function formatDateToDDMMYYYY(isoDate: string): string {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }

  const handleViewDetails = (id: number) => {
    router.navigate({
      pathname: "/(user)/order/[id]",
      params: { id: id },
    });
  };

  const handleCancelOrder = (id: number) => {
    Alert.alert("Bạn muốn hủy?", "Hoạt động này không thể hoàn tác", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("access_token");
            await axios.put(
              `${API_URL}/api/orders/${id}/cancel`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setOrderHistory((prev) =>
              prev.map((order) =>
                order.orderId === id ? { ...order, status: "Canceled" } : order
              )
            );
            Alert.alert("Thành công", "Đơn hàng đã được hủy");
          } catch (error) {
            Alert.alert("Lỗi", "Không thể hủy đơn hàng");
            console.error("Cancel error:", error);
          }
        },
      },
    ]);
  };
  const handleFeedback = (id: number) => {
    router.navigate({
      pathname: "/(user)/like/[id]",
      params: { id: id },
    });
  };
  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Đang tải...</Text>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      {token ? (
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginBottom: Platform.OS === "ios" ? -30 : -45 }}
          >
            {orderHistory.length === 0 ? (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                Không có đơn hàng nào
              </Text>
            ) : (
              orderHistory.map((item, index) => (
                <View key={item.orderId}>
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
                    <View
                      style={{ gap: 10, width: 320, marginHorizontal: "auto" }}
                    >
                      <View
                        style={{
                          paddingVertical: "auto",
                          borderBottomWidth: 0.5,
                          borderColor: APP_COLOR.BROWN,
                          marginHorizontal: 5,
                          paddingBottom: 5,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text style={styles.orderText}>#{item.orderId}</Text>
                          <Text
                            style={{
                              color: APP_COLOR.BROWN,
                              fontSize: 15,
                              fontFamily: FONTS.medium,
                            }}
                          >
                            {item.payment_method}
                          </Text>
                        </View>
                        <Text style={styles.dateText}>
                          {formatDateToDDMMYYYY(item.order_create_at)}
                        </Text>
                      </View>
                      <View>
                        <StatusBadge status={item.status} />
                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              marginTop: 5,
                            }}
                          >
                            <Text style={[styles.text, { width: 230 }]}>
                              {item.order_address}
                            </Text>
                            <Text
                              style={[styles.text, { color: APP_COLOR.ORANGE }]}
                            >
                              +{item.order_point_earn} điểm
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={styles.text}>X1 Sản phẩm</Text>
                            <Text
                              style={[
                                styles.text,
                                {
                                  fontSize: 20,
                                  fontFamily: FONTS.bold,
                                  alignSelf: "flex-end",
                                },
                              ]}
                            >
                              {currencyFormatter(item.order_amount)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <View style={styles.container}>
                          {item.status === "Đã giao" ? (
                            <>
                              <TouchableOpacity
                                style={styles.button}
                                onPress={() => handleViewDetails(item.orderId)}
                              >
                                <Text style={styles.buttonText}>
                                  Xem chi tiết
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.button,
                                  { backgroundColor: APP_COLOR.ORANGE },
                                ]}
                                onPress={() => handleFeedback(item.orderId)}
                              >
                                <Text
                                  style={[
                                    styles.buttonText,
                                    { color: APP_COLOR.WHITE },
                                  ]}
                                >
                                  Đánh giá
                                </Text>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              <TouchableOpacity
                                style={styles.button}
                                onPress={() => handleViewDetails(item.orderId)}
                              >
                                <Text style={styles.buttonText}>
                                  Xem chi tiết
                                </Text>
                              </TouchableOpacity>
                              {item.status !== "Đã hủy" && (
                                <TouchableOpacity
                                  style={[
                                    styles.button,
                                    { backgroundColor: APP_COLOR.ORANGE },
                                  ]}
                                  onPress={() =>
                                    handleCancelOrder(item.orderId)
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.buttonText,
                                      { color: APP_COLOR.WHITE },
                                    ]}
                                  >
                                    Hủy
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={{ height: 10 }} />
                </View>
              ))
            )}
          </ScrollView>
          <Pressable onPress={() => router.navigate("/(auth)/qrcode")}>
            <View
              style={{
                position: "absolute",
                bottom: -25,
                right: 20,
                backgroundColor: APP_COLOR.BROWN,
                borderRadius: 50,
                padding: 15,
                width: 60,
                height: 60,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={30}
                color={APP_COLOR.WHITE}
                style={{
                  marginHorizontal: "auto",
                  marginVertical: "auto",
                }}
              />
            </View>
          </Pressable>
        </View>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: APP_COLOR.BROWN, fontFamily: FONTS.regular }}>
            Vui lòng đăng nhập để xem lịch sử đơn hàng.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dateText: {
    fontFamily: FONTS.regular,
    fontSize: 17,
    color: APP_COLOR.BROWN,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: APP_COLOR.BROWN,
    marginLeft: 5,
  },
  statusLayout: {
    width: 120,
    height: 25,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: APP_COLOR.WHITE,
  },
  container: {
    marginHorizontal: "auto",
    flexDirection: "row",
    gap: 10,
  },
  button: {
    backgroundColor: APP_COLOR.WHITE,
    borderWidth: 0.5,
    borderColor: APP_COLOR.BROWN,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: 150,
    height: 42,
    justifyContent: "center",
  },
  buttonText: {
    color: APP_COLOR.BROWN,
    fontSize: 17,
    fontFamily: FONTS.bold,
    textAlign: "center",
  },
  orderText: {
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
    fontSize: 17,
    marginVertical: 5,
  },
});

export default OrderPage;
