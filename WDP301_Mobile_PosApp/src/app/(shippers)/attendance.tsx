import CheckAttendanceCard from "@/components/cardStaff/checkAttendanceCard";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
const screenWidth = Dimensions.get("screen").width;
const Attendance = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState("");
  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [pressCount, setPressCount] = useState(0);
  const [lastDate, setLastDate] = useState("");
  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear().toString().padStart(2, "0");
    return `${day}/${month}/${year}`;
  };
  const getDayOfWeek = () => {
    const now = new Date();
    const days = [
      "Chủ nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return days[now.getDay()];
  };
  const getCurrentTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    if (hour <= 11 && minutes <= 59) {
      return `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}${" "}AM`;
    } else {
      return `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}${" "}PM`;
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = getCurrentDate();
      setCurrentDate(getCurrentDate());
      setCurrentTime(getCurrentTime());
      setCurrentDayOfWeek(getDayOfWeek());
      if (lastDate && lastDate !== newDate) {
        setClockInTime("");
        setClockOutTime("");
        setPressCount(0);
      }
      setLastDate(newDate);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const handleAttendance = () => {
    if (pressCount >= 2) return;
    const currentTime = getCurrentTime();
    if (pressCount === 0) {
      setClockInTime(currentTime);
    } else if (pressCount === 1) {
      setClockOutTime(currentTime);
    }
    setPressCount((prev) => prev + 1);
  };
  const isButtonDisabled = pressCount >= 2;
  const calculateTotalHours = (clockIn: any, clockOut: any) => {
    const parseTime = (timeStr: any) => {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes, seconds] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 3600 + minutes * 60 + seconds;
    };

    const totalSeconds = parseTime(clockOut) - parseTime(clockIn);
    if (totalSeconds < 0) return "--:--";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds}`;
  };
  return (
    <ScrollView style={{ flex: 1 }}>
      <LinearGradient
        colors={[APP_COLOR.BACKGROUND_ORANGE, APP_COLOR.WHITE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientContainer}
      >
        <StaffHeader />
        <View style={styles.checkContainer}>
          <Text
            style={{
              marginTop: 10,
              fontFamily: APP_FONT.BOLD,
              fontSize: 37,
              color: APP_COLOR.BROWN,
            }}
          >
            {currentTime}
          </Text>
          <Text
            style={{
              color: APP_COLOR.BROWN,
              fontFamily: APP_FONT.REGULAR,
              fontSize: 18,
            }}
          >
            {currentDayOfWeek} - {currentDate}
          </Text>
          <Pressable
            style={({ pressed }) => [
              {
                height: 150,
                width: 150,
                backgroundColor: isButtonDisabled
                  ? APP_COLOR.GREY
                  : APP_COLOR.ORANGE,
                borderRadius: 75,
                justifyContent: "center",
                alignItems: "center",
                opacity: pressed && !isButtonDisabled ? 0.7 : 1,
              },
            ]}
            onPress={handleAttendance}
            disabled={isButtonDisabled}
          >
            <MaterialIcons
              name="touch-app"
              size={70}
              color={APP_COLOR.WHITE}
              style={{ marginBottom: 10 }}
            />
            <Text
              style={{
                color: APP_COLOR.WHITE,
                fontFamily: APP_FONT.MEDIUM,
                fontSize: 17,
              }}
            >
              Chấm công
            </Text>
          </Pressable>
          <View style={styles.dashedLine} />
          <View style={{ flexDirection: "row", gap: 30 }}>
            <View style={styles.timeLog}>
              <Fontisto name="clock" size={24} color={APP_COLOR.BROWN} />
              <Text style={styles.timeLogValue}>
                {clockInTime || "--:--:--"}
              </Text>
              <Text style={styles.timeLogLabel}>Clock In</Text>
            </View>
            <View style={styles.timeLog}>
              <Fontisto name="clock" size={24} color={APP_COLOR.BROWN} />
              <Text style={styles.timeLogValue}>
                {clockOutTime || "--:--:--"}
              </Text>
              <Text style={styles.timeLogLabel}>Clock Out</Text>
            </View>
            <View style={styles.timeLog}>
              <Fontisto name="clock" size={24} color={APP_COLOR.BROWN} />
              <Text style={styles.timeLogValue}>
                {clockInTime && clockOutTime
                  ? calculateTotalHours(clockInTime, clockOutTime)
                  : "--:--"}
              </Text>
              <Text style={styles.timeLogLabel}>Total Hours</Text>
            </View>
          </View>
        </View>
        <View style={styles.reportContainer}>
          <Text
            style={{
              color: APP_COLOR.BROWN,
              fontFamily: APP_FONT.SEMIBOLD,
              fontSize: 17,
              marginTop: 10,
            }}
          >
            Báo cáo chấm công tháng 6
          </Text>
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <CheckAttendanceCard
                title="Tổng số ngày làm"
                color={APP_COLOR.SOFT_BLUE}
              />
              <CheckAttendanceCard
                title="Đi trễ"
                color={APP_COLOR.WARNING_ORANGE}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 5, marginTop: 10 }}>
              <CheckAttendanceCard title="Về sớm" color={APP_COLOR.AMBER} />
              <CheckAttendanceCard
                title="Nghỉ làm"
                color={APP_COLOR.ALERT_RED}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  checkContainer: {
    backgroundColor: APP_COLOR.WHITE,
    width: screenWidth * 0.9,
    height: 380,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
  },
  reportContainer: {
    backgroundColor: APP_COLOR.WHITE,
    width: screenWidth * 0.9,
    height: 200,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
  },
  dashedLine: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#D3D3D3",
    width: screenWidth * 0.8,
    marginVertical: 20,
  },
  timeLog: { alignItems: "center" },
  timeLogValue: {
    fontFamily: APP_FONT.MEDIUM,
    fontSize: 14,
    color: APP_COLOR.BROWN,
    marginTop: 5,
  },
  timeLogLabel: {
    fontFamily: APP_FONT.BOLD,
    fontSize: 16,
    color: APP_COLOR.ORANGE,
  },
});
export default Attendance;
