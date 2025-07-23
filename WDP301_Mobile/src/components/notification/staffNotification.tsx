import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { ScrollView, Text, View } from "react-native";

const StaffNotification = () => {
  return (
    <ScrollView
      style={{
        backgroundColor: APP_COLOR.WHITE,
        borderWidth: 0.5,
        borderColor: APP_COLOR.BROWN,
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
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
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <Text
          style={{
            color: APP_COLOR.BROWN,
            fontFamily: FONTS.semiBold,
            fontSize: 17,
          }}
        >
          Cập nhật hệ thống
        </Text>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: "#DCFCE7",
            borderRadius: 30,
            borderWidth: 0.5,
            borderColor: "#DCCCA3",
            position: "relative",
            right: 0,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.regular,
              fontSize: 10,
              color: "#74AD89",
            }}
          >
            Mới
          </Text>
        </View>
      </View>
      <Text
        style={{
          color: APP_COLOR.BLACK,
          fontFamily: FONTS.regular,
          fontSize: 15,
          marginBottom: 5,
        }}
      >
        Hệ thống sẽ được bảo trì vào lúc 2:00 AM ngày mai. Thời gian dự kiến là
        30 phút.
      </Text>
      <Text
        style={{
          color: APP_COLOR.BROWN,
          fontFamily: FONTS.regular,
          fontSize: 13,
        }}
      >
        Thời gian: 12:30 08/06/2025
      </Text>
    </ScrollView>
  );
};
export default StaffNotification;
