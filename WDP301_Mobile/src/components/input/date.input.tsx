import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { APP_COLOR } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
import AntDesign from "@expo/vector-icons/AntDesign";
interface DateInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur: (e: any) => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
}

const DateInput = ({
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  placeholder,
}: DateInputProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [yearList, setYearList] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 100; i <= currentYear; i++) {
      years.push(i);
    }
    setYearList(years);
  }, []);

  const handleDateSelect = (date: string) => {
    onChangeText(date);
    setShowCalendar(false);
    onBlur({ target: { name: "date_of_birth" } });
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    setSelectedDate(newDate);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowCalendar(true)}
        style={[styles.input, error && touched && styles.inputError]}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <AntDesign name="calendar" size={24} color={APP_COLOR.BROWN} />
      </TouchableOpacity>

      {error && touched && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={showCalendar} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.yearList}
              >
                {yearList.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearButton,
                      currentYear === year && styles.selectedYearButton,
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text
                      style={[
                        styles.yearButtonText,
                        currentYear === year && styles.selectedYearButtonText,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Calendar
              key={currentYear}
              onDayPress={(day) => {
                handleDateSelect(day.dateString);
                setSelectedDate(new Date(day.dateString));
              }}
              markedDates={{
                [value]: { selected: true, selectedColor: APP_COLOR.ORANGE },
              }}
              theme={{
                todayTextColor: APP_COLOR.ORANGE,
                selectedDayBackgroundColor: APP_COLOR.ORANGE,
                arrowColor: APP_COLOR.ORANGE,
              }}
              current={selectedDate.toISOString()}
              onMonthChange={(date) => {
                setSelectedDate(new Date(date.timestamp));
                setCurrentYear(new Date(date.timestamp).getFullYear());
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: APP_COLOR.BROWN,
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: "space-between",
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    flexDirection: "row",
    alignItems: "center",
  },
  inputError: {
    borderColor: "red",
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: APP_COLOR.BROWN,
  },
  placeholder: {
    color: APP_COLOR.BROWN,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    fontFamily: FONTS.regular,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    backgroundColor: APP_COLOR.WHITE,
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  yearButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: APP_COLOR.ORANGE,
    marginHorizontal: 5,
    minWidth: 80,
    alignItems: "center",
  },
  yearButtonText: {
    color: APP_COLOR.WHITE,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  selectedYearButton: {
    backgroundColor: APP_COLOR.BROWN,
  },
  selectedYearButtonText: {
    color: APP_COLOR.WHITE,
  },
  yearList: {
    flexDirection: "row",
    paddingVertical: 10,
    gap: 10,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
});

export default DateInput;
