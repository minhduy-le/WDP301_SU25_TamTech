import { Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Fontisto from "@expo/vector-icons/Fontisto";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { APP_COLOR } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
interface IUserInfoTextProps {
  title: string;
  info: string;
}
const CusInfoText = (props: IUserInfoTextProps) => {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {(() => {
        switch (props.title) {
          case "Họ và tên":
            return (
              <MaterialIcons
                name="account-circle"
                size={20}
                color={APP_COLOR.BROWN}
              />
            );
          case "Email":
            return <Fontisto name="email" size={20} color={APP_COLOR.BROWN} />;
          case "SĐT":
            return (
              <FontAwesome5
                name="phone-alt"
                size={20}
                color={APP_COLOR.BROWN}
              />
            );
          default:
            return (
              <FontAwesome
                name="birthday-cake"
                size={20}
                color={APP_COLOR.BROWN}
              />
            );
        }
      })()}
      <Text
        style={{
          fontSize: 16,
          marginBottom: 5,
          fontFamily: FONTS.regular,
          color: APP_COLOR.BROWN,
        }}
      >
        {props.title}{" "}
        <Text style={{ fontFamily: FONTS.medium, color: APP_COLOR.ORANGE }}>
          {props.info ? `: ${props.info}` : ""}
        </Text>
      </Text>
    </View>
  );
};
export default CusInfoText;
