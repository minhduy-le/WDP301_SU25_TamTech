import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import Feather from "@expo/vector-icons/Feather";
import { Text, View } from "react-native";
interface IReports {
  title: string;
  number: number;
  percent: number;
}
const StaffReports = (props: IReports) => {
  return (
    <View
      style={{
        marginTop: 10,
        width: 180,
        marginHorizontal: 4,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View
        style={{
          backgroundColor: APP_COLOR.WHITE,
          borderRadius: 10,
          paddingVertical: 20,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: APP_COLOR.BROWN,
            fontSize: 16,
            fontFamily: APP_FONT.BOLD,
          }}
        >
          {props.title}
        </Text>
        <Text
          style={{
            color: APP_COLOR.ORANGE,
            fontSize: 16,
            fontFamily: APP_FONT.BOLD,
          }}
        >
          {props.title === "Doanh số bán hàng"
            ? currencyFormatter(props.number)
            : props.number}
        </Text>
        {props.percent > 0 ? (
          <View style={{ flexDirection: "row", gap: 5 }}>
            <Feather name="trending-up" size={19} color={APP_COLOR.DONE} />
            <Text
              style={{
                color: APP_COLOR.DONE,
                fontSize: 12,
                fontFamily: APP_FONT.BOLD,
              }}
            >
              +{props.percent}% so với hôm qua
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 5 }}>
            <Feather name="trending-down" size={19} color={APP_COLOR.CANCEL} />
            <Text
              style={{
                color: APP_COLOR.CANCEL,
                fontSize: 12,
                fontFamily: APP_FONT.BOLD,
              }}
            >
              {props.percent}% so với hôm qua
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
export default StaffReports;
