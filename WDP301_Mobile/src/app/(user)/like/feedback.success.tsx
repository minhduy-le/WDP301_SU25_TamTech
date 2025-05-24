import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { APP_COLOR } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
import { useEffect, useState } from "react";
import ShareButton from "@/components/button/share.button";
import { router } from "expo-router";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 20,
  },
  mainText: {
    color: APP_COLOR.BROWN,
    fontSize: 25,
    fontFamily: FONTS.semiBold,
    marginTop: 15,
    textAlign: "center",
  },
  subText: {
    color: APP_COLOR.BROWN,
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    textAlign: "center",
    marginTop: 10,
  },
  phoneText: {
    color: APP_COLOR.BROWN,
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    textAlign: "center",
    marginTop: 5,
  },
});

const FeedbackSuccess = () => {
  const [countdown, setCountdown] = useState<number>(10);

  useEffect(() => {
    let timer: number | null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);
  if (countdown == 0) router.replace("/(tabs)");
  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <FontAwesome5
            name="check-circle"
            size={150}
            color={APP_COLOR.ORANGE}
            style={styles.icon}
          />
          <Text style={styles.mainText}>
            Tấm Tắc xin ghi nhận góp ý của bạn
          </Text>
          <Text style={styles.subText}>
            Bạn có thể góp ý trực tiếp thông qua số điện thoại{" "}
          </Text>
          <Text style={styles.phoneText}>0828024246 {`(8h-18h)`}</Text>
          <Text style={[styles.subText, { marginBottom: 110 }]}>
            Về trang chủ sau {`${countdown}s`}
          </Text>
        </View>
        <ShareButton
          title="Về Trang Chủ"
          onPress={() => router.replace("/(tabs)")}
          btnStyle={{
            backgroundColor: APP_COLOR.ORANGE,
            marginHorizontal: "27%",
          }}
          textStyle={{
            fontFamily: FONTS.bold,
            fontSize: 17,
            color: APP_COLOR.WHITE,
            paddingHorizontal: 10,
          }}
        />
      </SafeAreaView>
    </>
  );
};
export default FeedbackSuccess;
