import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { Text, View } from "react-native";
interface IAttent {
  title: string;
  color: string;
}
const CheckAttendanceCard = (props: IAttent) => {
  const color = props.color;
  return (
    <View
      style={{
        borderColor: color,
        borderWidth: 0.5,
        padding: 5,
        width: 165,
        borderRadius: 10,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: color,
          fontFamily: APP_FONT.REGULAR,
          fontSize: 17,
        }}
      >
        {props.title}
      </Text>
      <Text
        style={{
          color: APP_COLOR.BROWN,
          fontFamily: APP_FONT.REGULAR,
          fontSize: 17,
        }}
      >
        --
      </Text>
    </View>
  );
};
export default CheckAttendanceCard;
