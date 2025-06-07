import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
const screenHeight = Dimensions.get("screen").height;
const SearchVoucher = () => {
  return (
    <View>
      <Text
        style={{
          fontFamily: APP_FONT.SEMIBOLD,
          color: APP_COLOR.BROWN,
          fontSize: 17,
          marginTop: 10,
          marginHorizontal: 10,
        }}
      >
        Tất cả ưu đãi hiện hành (5)
      </Text>
      <ScrollView
        style={{
          borderRadius: 10,
          backgroundColor: APP_COLOR.WHITE,
          height: screenHeight * 0.35,
          marginTop: 10,
          borderColor: "#E0E0E0",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.05,
          shadowRadius: 1.5,
          elevation: 2,
        }}
      >
        <View
          style={{
            gap: 10,
            borderWidth: 0.5,
            borderColor: APP_COLOR.BROWN,
            paddingVertical: 10,
            paddingHorizontal: 5,
            marginHorizontal: 10,
            borderRadius: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              width: "100%",
            }}
          >
            <Feather name="percent" size={20} color={APP_COLOR.BROWN} />
            <Text style={styles.textLabel}>Giảm giá mùa hè</Text>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: "#DCFCE7",
                borderRadius: 30,
                borderWidth: 0.5,
                borderColor: APP_COLOR.DONE,
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Text
                style={{
                  fontFamily: APP_FONT.BOLD,
                  fontSize: 10,
                  color: APP_COLOR.DONE,
                }}
              >
                Đang áp dụng
              </Text>
            </View>
          </View>
          <View
            style={{
              borderBottomColor: APP_COLOR.BROWN,
              borderBottomWidth: 0.5,
              paddingBottom: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
            >
              <Text style={styles.text}>Giảm</Text>
              <Text
                style={{
                  color: APP_COLOR.ORANGE,
                  fontFamily: APP_FONT.SEMIBOLD,
                  fontSize: 20,
                }}
              >
                20%
              </Text>
              <Text style={styles.text}>cho tất cả sản phẩm mùa hè</Text>
            </View>
            <View style={styles.iconContent}>
              <Text style={styles.text}>Mã KM:</Text>
              <Text
                style={{ fontFamily: APP_FONT.BOLD, color: APP_COLOR.BROWN }}
              >
                SUMMER25
              </Text>
            </View>
          </View>
          <View style={styles.iconContent}>
            <MaterialIcons name="schedule" size={24} color={APP_COLOR.BROWN} />
            <Text style={styles.textLabel}>Thời gian:</Text>
            <Text style={styles.text}>01/06/2025 - 10/06/2025</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <View style={styles.discountLabel}>
              <Text style={styles.textLabel}>Đơn tối thiểu</Text>
              <Text style={styles.text}>{currencyFormatter(100000)}</Text>
            </View>
            <View style={styles.discountLabel}>
              <Text style={styles.textLabel}>Giảm tối thiểu</Text>
              <Text style={styles.text}>{currencyFormatter(20000)}</Text>
            </View>
          </View>
          <View style={styles.iconContent}>
            <Entypo name="ticket" size={24} color={APP_COLOR.BROWN} />
            <Text style={styles.textLabel}>Đã sử dụng</Text>
          </View>
          <View style={{ marginTop: 4, width: "100%" }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                color: APP_COLOR.BROWN,
              }}
            >
              125/1000
            </Text>
            <View
              style={{
                height: 8,
                backgroundColor: "#E5E7EB",
                borderRadius: 4,
                marginTop: 2,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 8,
                  backgroundColor: APP_COLOR.ORANGE,
                  width: `${(125 / 1000) * 100}%`,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  text: { fontFamily: APP_FONT.REGULAR, color: APP_COLOR.BROWN },
  discountLabel: { alignItems: "center" },
  textLabel: { fontFamily: APP_FONT.BOLD, color: APP_COLOR.BROWN },
  iconContent: { flexDirection: "row", alignItems: "center", gap: 5 },
});
export default SearchVoucher;
