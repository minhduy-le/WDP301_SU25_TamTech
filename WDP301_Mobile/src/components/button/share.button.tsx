import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { ReactNode } from "react";
import { APP_COLOR } from "utils/constant";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Zocial from "@expo/vector-icons/Zocial";
const styles = StyleSheet.create({
  btnContainer: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: APP_COLOR.ORANGE,
  },
});
interface IProps {
  title?: string;
  onPress: () => void;
  textStyle?: StyleProp<TextStyle>;
  pressStyle?: StyleProp<ViewStyle>;
  btnStyle?: StyleProp<ViewStyle>;
  icons?: ReactNode;
  loading?: boolean;
}

const ShareButton = (props: IProps) => {
  const {
    title,
    onPress,
    textStyle,
    pressStyle,
    btnStyle,
    icons,
    loading = false,
  } = props;
  return (
    <Pressable
      disabled={loading}
      style={({ pressed }) => [
        {
          opacity: pressed === true || loading ? 0.5 : 1,
          alignSelf: "flex-start",
        },
        pressStyle,
      ]}
      onPress={onPress}
    >
      <View style={[styles.btnContainer, btnStyle]}>
        {(() => {
          switch (title) {
            case "Số điện thoại":
              return (
                <>
                  <Feather name="phone" size={24} color={APP_COLOR.WHITE} />
                </>
              );
            case "Đăng nhập":
              return (
                <>
                  <AntDesign name="mail" size={24} color={APP_COLOR.WHITE} />
                </>
              );
            case "Khách Hàng":
              return (
                <>
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color={APP_COLOR.WHITE}
                  />
                </>
              );
            case "Nhân Viên":
              return (
                <>
                  <AntDesign
                    name="customerservice"
                    size={24}
                    color={APP_COLOR.WHITE}
                  />
                </>
              );
            case "Đăng Ký với Khách":
              return (
                <>
                  <Zocial name="guest" size={24} color={APP_COLOR.WHITE} />
                </>
              );
            case "Tạo đơn hàng":
              return (
                <>
                  <AntDesign
                    name="shoppingcart"
                    size={24}
                    color={APP_COLOR.WHITE}
                  />
                </>
              );
            case "Trang chủ":
              return (
                <>
                  <FontAwesome5 name="home" size={24} color={APP_COLOR.WHITE} />
                </>
              );
            case "Đặt hàng":
              return (
                <>
                  <Feather
                    name="shopping-cart"
                    size={24}
                    color={APP_COLOR.WHITE}
                  />
                </>
              );
            case " ":
              return (
                <>
                  <FontAwesome5
                    name="fingerprint"
                    size={24}
                    color={APP_COLOR.WHITE}
                  />
                </>
              );
            default:
              return <></>;
          }
        })()}
        {loading && <ActivityIndicator color={"black"} />}
        {icons}
        {title && <Text style={textStyle}>{title}</Text>}
      </View>
    </Pressable>
  );
};

export default ShareButton;
