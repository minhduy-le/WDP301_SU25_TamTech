import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import { StyleSheet, Text, View } from "react-native";

interface IOrderHistory {
  countPrice: number;
  date: string;
  time: string;
}

const PaymentHistory = (props: IOrderHistory) => {
  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{props.time}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.priceText}>
          {currencyFormatter(props.countPrice)}đ
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_COLOR.WHITE,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: APP_COLOR.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginVertical: 2,
    borderRadius: 10,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontFamily: APP_FONT.MEDIUM,
    fontSize: 16,
    color: APP_COLOR.BROWN,
  },
  detailsContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  priceText: {
    fontFamily: APP_FONT.BOLD,
    fontSize: 18,
    color: APP_COLOR.ORANGE,
  },
});

export default PaymentHistory;
