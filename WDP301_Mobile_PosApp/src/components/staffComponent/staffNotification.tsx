import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { Text, View } from "react-native";

const StaffNotification = () => {
  return (
    <View
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
      <Text
        style={{
          color: APP_COLOR.BROWN,
          fontFamily: APP_FONT.SEMIBOLD,
          fontSize: 17,
        }}
      >
        Cập nhật hệ thống
      </Text>
      <Text
        style={{
          color: APP_COLOR.BLACK,
          fontFamily: APP_FONT.REGULAR,
          fontSize: 15,
        }}
      >
        Hệ thống sẽ được bảo trì vào lúc 2:00 AM ngày mai. Thời gian dự kiến là
        30 phút.
      </Text>
      <Text
        style={{
          color: APP_COLOR.BROWN,
          fontFamily: APP_FONT.REGULAR,
          fontSize: 13,
        }}
      >
        Thời gian: 12:30 08/06/2025
      </Text>
    </View>
  );
};
export default StaffNotification;
