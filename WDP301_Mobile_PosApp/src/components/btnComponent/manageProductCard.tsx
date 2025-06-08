import img from "@/assets/data/comtam.jpg";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import { Image, StyleSheet, Text, View } from "react-native";
import PressBtn from "./pressBtn";
const ManageProducts = () => {
  const handleUpdate = () => {
    console.log("update");
  };
  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderWidth: 0.5,
        borderColor: APP_COLOR.BROWN,
        borderRadius: 10,
        marginHorizontal: 10,
        marginTop: 20,
      }}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Image
          source={img}
          style={{ height: 50, width: 50, borderRadius: 10 }}
        />
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
                fontSize: 15,
                marginBottom: 5,
              }}
            >
              Cơm tấm sườn bì chả
            </Text>
            <View
              style={{
                paddingHorizontal: 10,
                backgroundColor: "#DCFCE7",
                borderRadius: 30,
                borderWidth: 0.5,
                borderColor: "#DCCCA3",
                position: "relative",
                right: -20,
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
          <Text style={styles.text}>Mã SP: CT001</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <View>
          <Text style={styles.text}>Loại sản phẩm: Món chính</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Text style={styles.text}>Giá tiền:</Text>
            <Text
              style={{
                color: APP_COLOR.ORANGE,
                fontFamily: APP_FONT.SEMIBOLD,
                fontSize: 15,
              }}
            >
              {currencyFormatter(30000)}
            </Text>
            <Text style={styles.text}>(vnđ)</Text>
          </View>
        </View>
        <View style={{ alignItems: "center", position: "relative", top: -6 }}>
          <Text
            style={{
              color: APP_COLOR.ORANGE,
              fontFamily: APP_FONT.BOLD,
              fontSize: 20,
            }}
          >
            23
          </Text>
          <Text style={styles.text}>Tối đa: 200</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.text}>Chỉnh sửa lần cuối: 06/06/2025</Text>
        <PressBtn
          title="Chỉnh sửa"
          onPress={handleUpdate}
          btnStyle={{
            backgroundColor: APP_COLOR.BROWN,
          }}
          textStyle={{ color: APP_COLOR.WHITE, fontFamily: APP_FONT.SEMIBOLD }}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  text: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.REGULAR,
    fontSize: 13,
  },
});
export default ManageProducts;
