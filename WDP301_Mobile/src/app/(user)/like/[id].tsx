import { FONTS } from "@/theme/typography";
import { API_URL, APP_COLOR } from "@/utils/constant";
import React, { useEffect, useState } from "react";
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
import axios from "axios";
import { useCurrentApp } from "@/context/app.context";

interface DataItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface ReviewItem {
  productId: string;
  rating: number;
  feedback?: string;
}

const Like = () => {
  const [generalRating, setGeneralRating] = useState<number>(0);
  const [generalFeedback, setGeneralFeedback] = useState<string>("");
  const [itemReviews, setItemReviews] = useState<ReviewItem[]>([]);
  const [dataItems, setDataItems] = useState<DataItem[]>([]);
  const { id } = useLocalSearchParams();
  const { appState } = useCurrentApp();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${appState?.token}`,
          },
        });
        setDataItems(res.data.orderItems || []);
      } catch (error) {
        console.log("Error when fetch products", error);
      }
    };
    fetch();
  }, []);

  const handleRating = (productId: number, rating: number) => {
    setItemReviews((prev) => {
      const existingReview = prev.find(
        (review) => review.productId === productId.toString()
      );
      if (existingReview) {
        return prev.map((review) =>
          review.productId === productId.toString()
            ? { ...review, rating }
            : review
        );
      }
      return [...prev, { productId: productId.toString(), rating }];
    });
  };

  const handleFeedback = (productId: number, feedback: string) => {
    setItemReviews((prev) => {
      const existingReview = prev.find(
        (review) => review.productId === productId.toString()
      );
      if (existingReview) {
        return prev.map((review) =>
          review.productId === productId.toString()
            ? { ...review, feedback }
            : review
        );
      }
      return [
        ...prev,
        { productId: productId.toString(), feedback, rating: 0 },
      ];
    });
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

  const handleSubmitFeedback = async () => {
    const feedbackPayload = {
      feedbacks: itemReviews.map((review) => ({
        productId: parseInt(review.productId),
        comment: review.feedback || "",
        rating: review.rating,
      })),
    };
    await axios.post(`${API_URL}/api/feedback?orderId=${id}`, feedbackPayload, {
      headers: {
        Authorization: `Bearer ${appState?.token}`,
        "Content-Type": "application/json",
      },
    });
    setGeneralFeedback("");
    setGeneralRating(0);
    setItemReviews([]);
    router.replace("/(user)/like/feedback.success");
    try {
    } catch (error) {
      console.log("Lỗi khi tạo đánh giá");
    }
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
          {dataItems?.map((item) => {
            const review = itemReviews.find(
              (review) => review.productId === item.productId.toString()
            );
            return (
              <View key={item.productId} style={styles.cartItem}>
                <View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.name}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginHorizontal: 10,
                    }}
                  >
                    <Text style={styles.productDetails}>
                      {item.quantity} X{" "}
                      <Text style={{ fontFamily: FONTS.bold }}>
                        {currencyFormatter(item.price * item.quantity)}
                      </Text>
                    </Text>
                    {renderStars(item.productId, review?.rating || 0)}
                  </View>
                </View>
                <View style={{ justifyContent: "flex-start" }}>
                  <TextInput
                    style={styles.generalFeedbackInput}
                    placeholder={`Để lại nhận xét cho món ${item.name} (tùy chọn)`}
                    placeholderTextColor={APP_COLOR.BROWN || "#A0522D80"}
                    value={review?.feedback || ""}
                    onChangeText={(text) =>
                      handleFeedback(item.productId, text)
                    }
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>
              </View>
            );
          })}
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
    height: 70,
    borderRadius: 10,
    fontFamily: FONTS.regular,
    paddingHorizontal: 10,
    paddingTop: 10,
    textAlignVertical: "top",
    marginBottom: 10,
    color: APP_COLOR.BROWN,
    marginTop: 10,
    marginHorizontal: 10,
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
