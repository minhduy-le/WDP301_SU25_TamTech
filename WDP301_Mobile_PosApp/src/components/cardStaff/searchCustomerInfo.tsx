import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import PressBtn from "../btnComponent/pressBtn";
const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;
const SearchCustomerInfo = () => {
  const handleEdit = () => {
    console.log("hihi");
  };
  const handleContact = () => {
    console.log("contact");
  };
  return (
    <View
      style={{
        borderRadius: 10,
        backgroundColor: APP_COLOR.WHITE,
        height: screenHeight * 0.57,
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
          flexDirection: "row",
          gap: 30,
          justifyContent: "space-between",
          backgroundColor: APP_COLOR.BROWN,
          paddingHorizontal: 10,
          paddingVertical: 15,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: APP_FONT.MEDIUM,
            fontSize: 17,
            color: APP_COLOR.WHITE,
          }}
        >
          Thông tin khách hàng
        </Text>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: "yellow",
            borderRadius: 30,
            borderWidth: 0.5,
            borderColor: APP_COLOR.ORANGE,
          }}
        >
          <Text style={{ fontFamily: APP_FONT.REGULAR, fontSize: 12 }}>
            Gold
          </Text>
        </View>
      </View>
      <View>
        <View style={{ marginHorizontal: 10, marginTop: 15 }}>
          <Text
            style={{
              fontFamily: APP_FONT.BOLD,
              fontSize: 20,
              color: APP_COLOR.BROWN,
            }}
          >
            Lê Minh Duy
          </Text>
          <Text
            style={{ fontFamily: APP_FONT.REGULAR, color: APP_COLOR.BROWN }}
          >
            Mã khách hàng: KH001
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginHorizontal: 10,
            marginTop: 15,
          }}
        >
          <View style={{ width: "45%", justifyContent: "center" }}>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginBottom: 10,
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="account-circle"
                size={24}
                color={APP_COLOR.BROWN}
              />
              <Text style={styles.label}>Thông tin liên hệ</Text>
            </View>
            <Text style={styles.title}>Email:</Text>
            <Text style={styles.text}>duylmse@gmail.com</Text>
            <Text style={styles.title}>Số điện thoại:</Text>
            <Text style={styles.text}>0999 899 927</Text>
          </View>
          <View style={{ width: "45%", justifyContent: "center" }}>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginBottom: 10,
                alignItems: "center",
              }}
            >
              <FontAwesome
                name="address-book"
                size={21}
                color={APP_COLOR.BROWN}
              />
              <Text style={styles.label}>Địa chỉ</Text>
            </View>
            <Text style={styles.text}>71 đường 12D, Long Thạnh Mỹ</Text>
            <Text style={styles.text}>TP Thủ Đức, TP.HCM, Việt Nam</Text>
          </View>
        </View>
        <View
          style={{
            justifyContent: "space-between",
            marginHorizontal: 10,
            marginTop: 15,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="google-analytics"
              size={24}
              color={APP_COLOR.BROWN}
            />
            <Text style={styles.label}>Thống kê</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              justifyContent: "space-around",
              borderBottomWidth: 0.5,
              borderBottomColor: APP_COLOR.BROWN,
              paddingBottom: 15,
              marginBottom: 25,
            }}
          >
            <View style={styles.inforTag}>
              <Text style={styles.headerText}>24</Text>
              <Text style={styles.text}>Tổng đơn hàng</Text>
            </View>
            <View style={styles.inforTag}>
              <Text style={styles.headerText}>
                {currencyFormatter(1000000)}
              </Text>
              <Text style={styles.text}>Tổng chi tiêu</Text>
            </View>
          </View>
          <View
            style={{ flexDirection: "row", gap: 5, marginHorizontal: "auto" }}
          >
            <PressBtn
              title="Chỉnh sửa thông tin"
              onPress={handleEdit}
              btnStyle={{
                width: screenWidth * 0.43,
                backgroundColor: APP_COLOR.BROWN,
              }}
              textStyle={{
                fontFamily: APP_FONT.REGULAR,
                color: APP_COLOR.WHITE,
                fontSize: 12,
              }}
            />
            <PressBtn
              title="Liên hệ"
              onPress={handleContact}
              btnStyle={{ width: screenWidth * 0.43 }}
              textStyle={{
                fontFamily: APP_FONT.REGULAR,
                color: APP_COLOR.BROWN,
                fontSize: 12,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  label: {
    fontFamily: APP_FONT.SEMIBOLD,
    color: APP_COLOR.BROWN,
    fontSize: 16,
  },
  title: {
    fontFamily: APP_FONT.SEMIBOLD,
    color: APP_COLOR.BROWN,
    fontSize: 13,
  },
  inforTag: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: APP_COLOR.BROWN,
    width: "45%",
    alignItems: "center",
    borderRadius: 10,
  },
  headerText: {
    fontFamily: APP_FONT.BOLD,
    color: APP_COLOR.ORANGE,
    fontSize: 19,
  },
  text: {
    fontFamily: APP_FONT.REGULAR,
    color: APP_COLOR.BROWN,
    fontSize: 14,
  },
});
export default SearchCustomerInfo;
