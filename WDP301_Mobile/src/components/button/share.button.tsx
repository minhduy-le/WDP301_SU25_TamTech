import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import { ReactNode } from "react";
import { APP_COLOR } from "utils/constant";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
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
  pressStyle?: StyleProp<TextStyle>;
  btnStyle?: StyleProp<TextStyle>;
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
            case "Đăng nhập":
              return (
                <>
                  <Feather name="phone" size={24} color={APP_COLOR.WHITE} />
                </>
              );
            case "Email":
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
            default:
              return (
                <>
                  <FontAwesome5
                    name="fingerprint"
                    size={24}
                    color={APP_COLOR.WHITE}
                  />
                </>
              );
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
