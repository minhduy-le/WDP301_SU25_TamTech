import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { useLocalSearchParams } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import poster from "@/assets/icons/com-tam.png";
import Entypo from "@expo/vector-icons/Entypo";
const VoucherDetailsPage = () => {
  const { id } = useLocalSearchParams();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: APP_COLOR.WHITE,
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
          flex: 0.4,
        }}
      >
        <Image source={poster} style={{ height: 200, width: 200 }} />
      </View>
      <View
        style={{
          position: "relative",
          top: -20,
          backgroundColor: APP_COLOR.WHITE,
          marginHorizontal: 30,
          alignItems: "center",
          shadowColor: "#000",
          padding: 15,
          borderRadius: 10,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: APP_COLOR.CANCEL + "90",
            borderRadius: 30,
            alignItems: "center",
            marginHorizontal: "auto",
            marginBottom: 5,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.medium,
              color: APP_COLOR.WHITE,
              fontSize: 13,
            }}
          >
            {id}
          </Text>
        </View>
        <Text style={{ fontFamily: FONTS.medium, textAlign: "center" }}>
          Thành viên mới - Mua cơm tặng kèm nước ngọt.
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontFamily: FONTS.regular,
              color: APP_COLOR.BROWN,
              fontSize: 13,
            }}
          >
            HSD: <Text style={{ fontSize: 12 }}> 01/06/2023</Text>
          </Text>
          <Entypo name="dot-single" size={24} color={APP_COLOR.BROWN} />
          <Text
            style={{
              color: APP_COLOR.DONE + "90",
              fontStyle: "italic",
            }}
          >
            Còn hạn
          </Text>
        </View>
      </View>
      <View style={{ marginHorizontal: 10 }}>
        <Text
          style={{
            fontFamily: FONTS.medium,
            color: APP_COLOR.BROWN,
            fontSize: 16,
            marginTop: 10,
          }}
        >
          Quy định sử dụng ưu đãi
        </Text>
        <View style={{ marginTop: 10, marginHorizontal: 10 }}>
          <Text style={styles.text}>
            + Tặng 1 coca khi mua hóa đon từ 50.000đ trở lên.
          </Text>
          <Text style={styles.text}>
            + Không áp dụng đồng thời với các chương trình khuyến mãi khác
          </Text>
          <Text style={styles.text}>+ Không quy đổi ra tiền mặt.</Text>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.regular,
    marginVertical: 2.5,
  },
});
export default VoucherDetailsPage;
