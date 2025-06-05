import PaymentHistory from "@/components/btnComponent/paymentHistory";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Payment = { countPrice: number; date: string; time: string };
type DailyPayments = { [date: string]: { paymentHistory: Payment[] } };

const dataSample = {
  staffName: "Lê Minh Duy",
  staffCounter: "TP.Hồ Chí Minh",
};

const dataSample1: { dailyPayments: DailyPayments } = {
  dailyPayments: {
    "05/06/2025": {
      paymentHistory: [
        {
          countPrice: 150000,
          date: "05/06/2025",
          time: "08:30:15",
        },
        {
          countPrice: 75000,
          date: "05/06/2025",
          time: "10:15:45",
        },
        {
          countPrice: 220000,
          date: "05/06/2025",
          time: "14:05:02",
        },
        {
          countPrice: 50000,
          date: "05/06/2025",
          time: "17:55:30",
        },
      ],
    },
    "04/06/2025": {
      paymentHistory: [
        {
          countPrice: 100000,
          date: "04/06/2025",
          time: "09:00:00",
        },
        {
          countPrice: 350000,
          date: "04/06/2025",
          time: "15:20:10",
        },
      ],
    },
    "03/06/2025": {
      paymentHistory: [
        {
          countPrice: 150000,
          date: "05/06/2025",
          time: "08:30:15",
        },
        {
          countPrice: 75000,
          date: "05/06/2025",
          time: "10:15:45",
        },
        {
          countPrice: 220000,
          date: "05/06/2025",
          time: "14:05:02",
        },
        {
          countPrice: 50000,
          date: "05/06/2025",
          time: "17:55:30",
        },
      ],
    },
    "02/06/2025": {
      paymentHistory: [
        {
          countPrice: 150000,
          date: "05/06/2025",
          time: "08:30:15",
        },
        {
          countPrice: 75000,
          date: "05/06/2025",
          time: "10:15:45",
        },
        {
          countPrice: 220000,
          date: "05/06/2025",
          time: "14:05:02",
        },
        {
          countPrice: 50000,
          date: "05/06/2025",
          time: "17:55:30",
        },
      ],
    },
  },
};

const sections = Object.keys(dataSample1.dailyPayments).map((date) => ({
  title: date,
  data: dataSample1.dailyPayments[date].paymentHistory,
}));

const OrderHistory = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <LinearGradient
        style={styles.gradientContainer}
        colors={[APP_COLOR.BACKGROUND_ORANGE, APP_COLOR.WHITE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <StaffHeader
          staffName={dataSample.staffName}
          staffCounter={dataSample.staffCounter}
        />
        <View>
          <Text
            style={{
              color: APP_COLOR.BROWN,
              fontSize: 23,
              fontFamily: APP_FONT.BOLD,
            }}
          >
            Lịch sử thanh toán
          </Text>
        </View>
        <SectionList
          sections={sections}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <PaymentHistory
              countPrice={item.countPrice}
              date={item.date}
              time={item.time}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.dateHeader}>{title}</Text>
          )}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dateHeader: {
    fontFamily: APP_FONT.BOLD,
    fontSize: 18,
    color: APP_COLOR.BROWN,
    backgroundColor: "rgb(255, 234, 218)",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export default OrderHistory;
