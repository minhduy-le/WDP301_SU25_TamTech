import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import ProductCard from "../products/productCard";
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const OrderCard = () => {
  const [details, setDetails] = useState(false);
  const handleViewDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setDetails(!details);
  };
  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(spinValue, {
      toValue: details ? 1 : 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [details]);
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const toggleDetails = () => {
    setDetails(!details);
  };
  return (
    <View style={styles.cardShadow}>
      <Pressable onPress={handleViewDetails} style={styles.pressableContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.orderIdText}>Đơn hàng: ORD001</Text>
          <View style={styles.iconContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <AntDesign name="caretdown" size={24} color={APP_COLOR.ORANGE} />
            </Animated.View>
          </View>
        </View>
        <View style={styles.customerInfoContainer}>
          <View>
            <Text style={styles.customerNameText}>
              Tên khách hàng: Lê Minh Duy
            </Text>
            <Text style={styles.text}>Đặt hàng: 22:30 09/06/2025</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Đã hoàn thành</Text>
          </View>
        </View>
      </Pressable>

      {details && (
        <View style={styles.detailsView}>
          <View style={styles.detailsSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="account-circle"
                size={24}
                color={APP_COLOR.BROWN}
              />
              <Text style={styles.boldText}>Thông tin khách hàng</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.text}>Họ Tên: Lê Minh Duy</Text>
              <Text style={styles.text}>SĐT: 0927 133 233</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.text}>Địa chỉ:</Text>
              <Text style={styles.text}>
                123 Đường Nguyễn Văn Linh, Phường Tân Thuận Đông, Quận 7, TP.HCM
              </Text>
            </View>
          </View>
          <View
            style={{
              marginTop: 10,
              paddingBottom: 10,
              borderBottomColor: "#eee",
              borderBottomWidth: 1,
            }}
          >
            <View style={styles.sectionHeader}>
              <AntDesign
                name="shoppingcart"
                size={24}
                color={APP_COLOR.BROWN}
              />
              <Text style={styles.boldText}>Giỏ hàng</Text>
            </View>
            <View
              style={{ height: 300, backgroundColor: "white", borderRadius: 8 }}
            >
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  paddingVertical: 8,
                  gap: 8,
                }}
                showsVerticalScrollIndicator={true}
              >
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
              </ScrollView>
            </View>
          </View>
          <View
            style={{
              marginTop: 10,
              paddingBottom: 10,
              borderBottomColor: "#eee",
              borderBottomWidth: 1,
            }}
          >
            <View style={styles.sectionHeader}>
              <Entypo name="credit-card" size={24} color={APP_COLOR.BROWN} />
              <Text style={styles.boldText}>Thanh toán & giao hàng</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.text}>
                Phương thức: Chuyển khoản ngân hàng
              </Text>
              <Text style={styles.text}>Thời gian: 23:18 08/06/2025</Text>
            </View>
          </View>
          <View
            style={{
              marginTop: 10,
              paddingBottom: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.boldText}>Tổng đơn hàng:</Text>
            <Text style={styles.boldText}>{currencyFormatter(10000000)}</Text>
          </View>
          <View>
            <View style={{ flexDirection: "row" }}>
              <AntDesign name="gift" size={24} color={APP_COLOR.BROWN} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={[styles.text, { marginLeft: 5 }]}>
                  Điểm tích lũy:
                </Text>
                <Text
                  style={{
                    fontFamily: APP_FONT.SEMIBOLD,
                    color: APP_COLOR.ORANGE,
                    fontSize: 17,
                    marginLeft: 10,
                  }}
                >
                  +323 điểm
                </Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 5 }}>
            <Text style={styles.text}>Ghi chú:</Text>
            <Text style={styles.text}>Ít dưa chua</Text>
          </View>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  cardShadow: {
    marginHorizontal: 10,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: APP_COLOR.WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressableContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: APP_COLOR.WHITE,
    borderRadius: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.SEMIBOLD,
    fontSize: 19,
    flex: 1,
  },
  iconContainer: {},
  customerInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 5,
  },
  customerNameText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.MEDIUM,
    fontSize: 15,
  },
  statusBadge: {
    height: 30,
    paddingHorizontal: 5,
    backgroundColor: "#DCFCE7",
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontFamily: APP_FONT.REGULAR,
    fontSize: 11,
    color: "#065F46",
  },
  detailsView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: APP_COLOR.WHITE,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 100,
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsSection: {
    paddingBottom: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  infoColumn: {
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  boldText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.BOLD,
    fontSize: 17,
  },
  text: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.REGULAR,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default OrderCard;
