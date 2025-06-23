import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import ShareButton from "@/components/button/share.button";
import { router, useLocalSearchParams } from "expo-router";
import { currencyFormatter } from "@/utils/api";
interface OrderItem {
  productId: number;
  productName: string;
  orderId: number;
  quantity: number;
  price: number;
  note: string | null;
  feedback: string | null;
  expiredFeedbackTime: string | null;
  productImg: string;
  feedBackYet: boolean;
}
interface DataSample {
  id: number;
  subTotal: number;
  promotionCode: string | null;
  discountValue: number;
  discountPercent: number;
  amount: number;
  shippingFee: number;
  isPickUp: boolean;
  delivery_at: string | null;
  orderStatus: string;
  note: string | null;
  payment_code: string;
  address: string | null;
  phone: string;
  pointUsed: number;
  pointEarned: number;
  createdAt: string;
  orderItems: OrderItem[];
  customerDTO: string | null;
}
const dataSample: DataSample = {
  id: 12,
  subTotal: 375000,
  promotionCode: null,
  discountValue: 0,
  discountPercent: 0,
  amount: 337500,
  shippingFee: 0,
  isPickUp: true,
  delivery_at: null,
  orderStatus: "Đặt Hàng Thành Công",
  note: "Thêm nhiều tương ớt",
  payment_code: "93b101eb69ca42649ac82fad9ca69df6",
  address: null,
  phone: "0988998249",
  pointUsed: 38,
  pointEarned: 38,
  createdAt: "2025-05-20T08:27:19.611+07:00",
  orderItems: [
    {
      productId: 1,
      productName: "Cơm tấm sườn nướng",
      orderId: 12,
      quantity: 2,
      price: 60000,
      note: "Ít mỡ",
      feedback: null,
      expiredFeedbackTime: null,
      productImg:
        "https://firebasestorage.googleapis.com/v0/b/four-gems.appspot.com/o/product%20image%2Fco%CC%9Bm%20ta%CC%82%CC%81m%20su%CC%9Bo%CC%9B%CC%80n%20nu%CC%9Bo%CC%9B%CC%81ng.jpeg?alt=media&token=c80305bb-9853-44e5-a068-80470d3b6441",
      feedBackYet: false,
    },
    {
      productId: 2,
      productName: "Phở bò tái chín",
      orderId: 12,
      quantity: 1,
      price: 55000,
      note: "Nhiều hành",
      feedback: null,
      expiredFeedbackTime: null,
      productImg:
        "https://firebasestorage.googleapis.com/v0/b/four-gems.appspot.com/o/product%20image%2Fpho_bo_tai_chin.jpg?alt=media&token=example-token-pho",
      feedBackYet: false,
    },
    {
      productId: 3,
      productName: "Bún chả Hà Nội",
      orderId: 12,
      quantity: 3,
      price: 50000,
      note: null,
      feedback: null,
      expiredFeedbackTime: null,
      productImg:
        "https://firebasestorage.googleapis.com/v0/b/four-gems.appspot.com/o/product%20image%2Fbun_cha_ha_noi.jpg?alt=media&token=example-token-buncha",
      feedBackYet: false,
    },
    {
      productId: 4,
      productName: "Trà sữa trân châu đường đen",
      orderId: 12,
      quantity: 1,
      price: 50000,
      note: "Ít ngọt, nhiều đá",
      feedback: null,
      expiredFeedbackTime: null,
      productImg:
        "https://firebasestorage.googleapis.com/v0/b/four-gems.appspot.com/o/product%20image%2Ftra_sua_tran_chau.jpg?alt=media&token=example-token-trasua",
      feedBackYet: false,
    },
  ],
  customerDTO: null,
};

const Like = () => {
  const navigation: any = useNavigation();
  const [generalRating, setGeneralRating] = useState<number>(0);
  const [generalFeedback, setGeneralFeedback] = useState<string>("");
  const [itemReviews, setItemReviews] = useState<{
    [key: number]: { rating: number; feedback: string };
  }>({});
  const { id } = useLocalSearchParams();
  const handleRating = (productId: number, rating: number) => {
    setItemReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const handleFeedback = (productId: number, feedback: string) => {
    setItemReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], feedback },
    }));
  };

  const renderStars = (productId: number, rating: number) => {
    const stars = [];
    const maxRating = 5;
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRating(productId, i)}
          style={styles.starStyle}
        >
          <AntDesign
            name={i <= rating ? "star" : "staro"}
            size={27}
            color={APP_COLOR.ORANGE}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const handleSubmitFeedback = () => {
    console.log("Đánh giá chung cho đơn hàng:");
    console.log("Số sao:", generalRating);
    console.log("Nhận xét:", generalFeedback);
    console.log("Đánh giá từng món:");
    console.log(itemReviews);
    setGeneralFeedback("");
    setGeneralRating(0);
    setItemReviews({});
    router.replace("/(user)/like/feedback.success");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Đánh giá đơn hàng</Text>
          <Text style={styles.headerText}>Đơn hàng #{id}</Text>
        </View>
        <Text style={styles.sectionTitle}>Các món trong đơn hàng:</Text>
        <View>
          {dataSample.orderItems.map((item) => (
            <View key={item.productId} style={styles.cartItem}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  {item.note && (
                    <Text style={styles.productDetails}>
                      Ghi chú: {item.note}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.productDetails}>
                    {item.quantity} X{" "}
                    <Text style={{ fontFamily: FONTS.bold }}>
                      {currencyFormatter(item.price * item.quantity)}
                    </Text>
                  </Text>

                  {renderStars(
                    item.productId,
                    itemReviews[item.productId]?.rating || 0
                  )}
                </View>
              </View>
              <View style={{ justifyContent: "flex-start" }}>
                <TextInput
                  style={styles.generalFeedbackInput}
                  placeholder={`Để lại nhận xét cho món ${item.productName} (tùy chọn)`}
                  placeholderTextColor={APP_COLOR.BROWN || "#A0522D80"}
                  value={itemReviews[item.productId]?.feedback || ""}
                  onChangeText={(text) => handleFeedback(item.productId, text)}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.buttonContainer}>
          <ShareButton
            title="Gửi đánh giá"
            onPress={handleSubmitFeedback}
            btnStyle={{
              backgroundColor: APP_COLOR.ORANGE,
            }}
            textStyle={{
              fontFamily: FONTS.bold,
              fontSize: 17,
              color: APP_COLOR.WHITE,
              paddingHorizontal: 10,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerText: {
    color: APP_COLOR.ORANGE,
    fontFamily: FONTS.semiBold,
    fontSize: 17,
  },
  cartItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    justifyContent: "space-between",
  },
  productName: {
    fontFamily: FONTS.semiBold,
    color: APP_COLOR.BROWN,
    fontSize: 17,
    flex: 1,
    marginRight: 10,
  },
  productDetails: {
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
    fontSize: 14,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 5,
  },
  starStyle: {
    marginHorizontal: 5,
  },
  generalFeedbackInput: {
    borderColor: APP_COLOR.BROWN,
    borderWidth: 0.5,
    width: "90%",
    height: 70,
    borderRadius: 10,
    fontFamily: FONTS.regular,
    paddingHorizontal: 10,
    paddingTop: 10,
    textAlignVertical: "top",
    marginBottom: 10,
    color: APP_COLOR.BROWN,
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    color: APP_COLOR.BROWN,
    fontSize: 20,
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 5,
  },
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 10,
  },
});

export default Like;
