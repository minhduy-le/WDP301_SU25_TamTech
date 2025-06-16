import { APP_COLOR } from "@/constants/Colors";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import SlotRegister from "./slotRegister";

interface IProps {
  date: string[];
}
const CalendarComponent = (props: IProps) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"register" | "history">(
    "register"
  );
  const markedDates = props.date.reduce((acc, date) => {
    const [day, month, year] = date.split("/");
    const formattedDate = `${year}-${month}-${day}`;
    acc[formattedDate] = {
      marked: true,
      dotColor: APP_COLOR.DONE,
    };
    return acc;
  }, {} as { [key: string]: any });

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: APP_COLOR.ORANGE,
    };
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            backgroundColor: "transparent",
            calendarBackground: "transparent",
            textSectionTitleColor: APP_COLOR.BROWN,
            selectedDayBackgroundColor: APP_COLOR.ORANGE,
            selectedDayTextColor: APP_COLOR.WHITE,
            todayTextColor: APP_COLOR.ORANGE,
            dayTextColor: APP_COLOR.BROWN,
            textDisabledColor: APP_COLOR.BROWN + "50",
            arrowColor: APP_COLOR.ORANGE,
            monthTextColor: APP_COLOR.BROWN,
            textDayFontFamily: "Inter-Regular",
            textMonthFontFamily: "Inter-Bold",
            textDayHeaderFontFamily: "Inter-Medium",
          }}
          style={styles.calendar}
        />
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "register" && styles.activeTab]}
          onPress={() => setActiveTab("register")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "register" && styles.activeTabText,
            ]}
          >
            Đăng ký ca
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            Lịch sử đăng ký
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === "register" && (
        <View>
          <SlotRegister />
          <SlotRegister />
          <SlotRegister />
          <SlotRegister />
          <SlotRegister />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: APP_COLOR.WHITE + "80",
    padding: 10,
  },
  calendar: {
    borderRadius: 10,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: APP_COLOR.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignSelf: "center",
    overflow: "hidden",
    marginTop: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: APP_COLOR.BROWN,
  },
  tabText: {
    fontSize: 16,
    color: APP_COLOR.BROWN,
    fontWeight: "bold",
  },
  activeTabText: {
    color: APP_COLOR.WHITE,
    fontWeight: "bold",
  },
});

export default CalendarComponent;
