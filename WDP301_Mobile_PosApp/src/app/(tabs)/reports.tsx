import StaffReports from "@/components/cardStaff/staffReports";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import Fontisto from "@expo/vector-icons/Fontisto";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
const currentTime = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString().padStart(2, "0");
  return `${day}/${month}/${year}`;
};
const screenWidth = Dimensions.get("window").width;
const data = {
  labels: [
    "8:00",
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ],
  datasets: [
    {
      data: [6, 12, 19, 25, 33, 28, 22, 20, 24, 19, 15, 8],
      color: (opacity = 1) => APP_COLOR.BROWN,
      strokeWidth: 2,
      colors: [
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
        () => "#FF6B00",
      ],
    },
  ],
};
const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: () => APP_COLOR.BROWN,
  labelColor: () => APP_COLOR.BROWN,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: APP_COLOR.BROWN,
  },
  withHorizontalLines: false,
  withVerticalLines: false,
  withInnerLines: false,
};
const Reports = () => {
  const curentTime = currentTime();
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
        <StaffHeader />
        <Pressable
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 3,
            backgroundColor: APP_COLOR.WHITE,
            borderRadius: 10,
            paddingVertical: 10,
            paddingLeft: 10,
            paddingRight: 10,
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: APP_COLOR.BROWN,
              fontFamily: APP_FONT.SEMIBOLD,
              fontSize: 17,
            }}
          >
            Doanh thu ngày {curentTime}
          </Text>
          <Fontisto name="export" size={24} color={APP_COLOR.BROWN} />
        </Pressable>
        <View style={{ flexDirection: "row" }}>
          <StaffReports
            title="Doanh số bán hàng"
            number={1000000}
            percent={12.5}
          />
          <StaffReports title="Số đơn hàng" number={101} percent={-5.5} />
        </View>
        <View style={{ flexDirection: "row" }}>
          <StaffReports title="Trung bình mỗi đơn" number={23645} percent={0} />
          <StaffReports title="Số khách ghé quán" number={32} percent={13.5} />
        </View>

        <View style={styles.container}>
          <Text style={styles.header}>Báo cáo đơn hàng</Text>
          <Text style={styles.subHeader}>
            Số lượng đơn hàng của Lê Minh Duy trong ngày hôm nay
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              style={styles.chart}
              data={data}
              width={data.labels.length * 50}
              height={250}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () => "#6D4C41",
                labelColor: () => "#6D4C41",
                style: { borderRadius: 16 },
                propsForBackgroundLines: {
                  stroke: "#6D4C41",
                  strokeDasharray: "2",
                },
                barPercentage: 0.9,
              }}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              showValuesOnTopOfBars={false}
              withCustomBarColorFromData={true}
              showBarTops={false}
              segments={6}
            />
          </ScrollView>
        </View>
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
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.WHITE,
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 16,
    marginTop: 10,
    borderRadius: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: APP_COLOR.BROWN,
  },
  subHeader: {
    fontSize: 16,
    color: APP_COLOR.BROWN,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 5,
    borderRadius: 16,
  },
});
export default Reports;
