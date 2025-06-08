import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
const OrderCard = () => {
  const [details, setDetails] = useState(false);
  const handleViewDetails = () => {
    setDetails(!details);
  };
  return (
    <View>
      <Pressable
        onPress={handleViewDetails}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 10,
          borderWidth: 0.5,
          borderColor: APP_COLOR.BROWN,
          backgroundColor: APP_COLOR.WHITE,
          borderRadius: 10,
          marginHorizontal: 10,
          marginTop: 20,
        }}
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  color: APP_COLOR.BROWN,
                  fontFamily: APP_FONT.SEMIBOLD,
                  fontSize: 19,
                  marginBottom: 5,
                  width: "80%",
                }}
              >
                Đơn hàng: ORD001
              </Text>
              {details === true ? (
                <Pressable style={{ position: "relative", right: -60 }}>
                  <AntDesign
                    name="caretup"
                    size={24}
                    color={APP_COLOR.ORANGE}
                  />
                </Pressable>
              ) : (
                <Pressable style={{ position: "relative", right: -60 }}>
                  <AntDesign
                    name="caretdown"
                    size={24}
                    color={APP_COLOR.ORANGE}
                  />
                </Pressable>
              )}
            </View>
            <View style={{ flexDirection: "row" }}>
              <View>
                <Text
                  style={{
                    color: APP_COLOR.BROWN,
                    fontFamily: APP_FONT.MEDIUM,
                    fontSize: 15,
                  }}
                >
                  Tên khách hàng: Lê Minh Duy
                </Text>
                <Text style={styles.text}>Đặt hàng: 22:30 09/06/2025</Text>
              </View>
              <View
                style={{
                  height: 30,
                  paddingHorizontal: 5,
                  backgroundColor: "#DCFCE7",
                  borderRadius: 30,
                  borderWidth: 0.5,
                  borderColor: "#DCCCA3",
                  position: "relative",
                  right: -30,
                  bottom: -10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: APP_FONT.REGULAR,
                    fontSize: 10,
                    color: "#74AD89",
                  }}
                >
                  Còn hàng
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
      {details && (
        <View
          style={{
            paddingHorizontal: 10,
            backgroundColor: APP_COLOR.WHITE,
            marginHorizontal: 10,
          }}
        >
          <View
            style={{
              paddingBottom: 10,
              borderBottomColor: APP_COLOR.BROWN,
              borderBottomWidth: 0.5,
            }}
          >
            <View style={[styles.content, { gap: 5, marginTop: 10 }]}>
              <MaterialIcons
                name="account-circle"
                size={24}
                color={APP_COLOR.BROWN}
              />
              <Text style={styles.boldText}>Thông tin khách hàng</Text>
            </View>
            <View style={[styles.content, { justifyContent: "space-between" }]}>
              <Text style={styles.text}>Họ Tên: Lê Minh Duy</Text>
              <Text style={styles.text}>SĐT: 0927 133 233</Text>
            </View>
            <Text style={styles.text}>Địa chỉ:</Text>
            <Text style={styles.text}>
              123 Đường Nguyễn Văn Linh, Phường Tân Thuận Đông, Quận 7, TP.HCM
            </Text>
          </View>
          <View style={[styles.content, { gap: 5, marginTop: 10 }]}>
            <Entypo name="credit-card" size={24} color={APP_COLOR.BROWN} />
            <Text style={styles.boldText}>Thanh toán & giao hàng</Text>
          </View>
          <Text style={styles.text}>Phươnh thức: Chuyển khoản ngân hàng</Text>
          <Text style={styles.text}>Thời gian: 23:18 08/06/2025</Text>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  content: { flexDirection: "row" },
  boldText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.BOLD,
    fontSize: 17,
    marginBottom: 5,
  },
  text: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.REGULAR,
    fontSize: 13,
  },
});
export default OrderCard;
