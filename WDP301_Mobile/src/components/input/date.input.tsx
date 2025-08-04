import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  AccessibilityInfo,
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
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}
const useDateUtils = () => {
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const isValidDate = useCallback((dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }, []);

  const getYearList = useCallback(
    (startYear: number, endYear: number): number[] => {
      const years = [];
      for (let i = startYear; i <= endYear; i++) {
        years.push(i);
      }
      return years;
    },
    []
  );

  return { formatDate, isValidDate, getYearList };
};

const useDatePicker = (
  initialValue: string,
  minDate?: string,
  maxDate?: string
) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const { isValidDate } = useDateUtils();

  const isDateInRange = useCallback(
    (dateString: string): boolean => {
      if (!isValidDate(dateString)) return false;

      const date = new Date(dateString);
      const min = minDate ? new Date(minDate) : null;
      const max = maxDate ? new Date(maxDate) : null;

      if (min && date < min) return false;
      if (max && date > max) return false;

      return true;
    },
    [isValidDate, minDate, maxDate]
  );

  const openCalendar = useCallback(() => {
    setShowCalendar(true);
  }, []);

  const closeCalendar = useCallback(() => {
    setShowCalendar(false);
    setShowYearPicker(false);
  }, []);

  const updateSelectedDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const openYearPicker = useCallback(() => {
    setShowYearPicker(true);
  }, []);

  const closeYearPicker = useCallback(() => {
    setShowYearPicker(false);
  }, []);

  const selectYear = useCallback(
    (year: number) => {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(year);
      setSelectedDate(newDate);
      closeYearPicker();
    },
    [selectedDate, closeYearPicker]
  );

  return {
    showCalendar,
    selectedDate,
    showYearPicker,
    isDateInRange,
    openCalendar,
    closeCalendar,
    updateSelectedDate,
    openYearPicker,
    closeYearPicker,
    selectYear,
  };
};

const DateInput = ({
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  placeholder = "Chọn ngày",
  disabled = false,
  minDate,
  maxDate,
}: DateInputProps) => {
  const { formatDate, isValidDate, getYearList } = useDateUtils();
  const {
    showCalendar,
    selectedDate,
    showYearPicker,
    isDateInRange,
    openCalendar,
    closeCalendar,
    updateSelectedDate,
    openYearPicker,
    closeYearPicker,
    selectYear,
  } = useDatePicker(value, minDate, maxDate);
  const yearList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = getYearList(currentYear - 100, currentYear);
    return years.reverse();
  }, [getYearList]);
  const calendarTheme = useMemo(
    () => ({
      todayTextColor: APP_COLOR.ORANGE,
      selectedDayBackgroundColor: APP_COLOR.ORANGE,
      arrowColor: APP_COLOR.ORANGE,
      textSectionTitleColor: APP_COLOR.BROWN,
      selectedDayTextColor: APP_COLOR.WHITE,
      dayTextColor: APP_COLOR.BROWN,
      textDisabledColor: APP_COLOR.GREY,
      dotColor: APP_COLOR.ORANGE,
      selectedDotColor: APP_COLOR.WHITE,
      monthTextColor: APP_COLOR.BROWN,
      indicatorColor: APP_COLOR.ORANGE,
      textMonthFontFamily: FONTS.medium,
      textMonthFontSize: 18,
      textDayHeaderFontFamily: FONTS.medium,
      textDayHeaderFontSize: 14,
      textDayFontFamily: FONTS.regular,
      textDayFontSize: 16,
      arrowStyle: {
        padding: 10,
      },
    }),
    []
  );
  const markedDates = useMemo(() => {
    if (!value || !isValidDate(value)) return {};
    return {
      [value]: {
        selected: true,
        selectedColor: APP_COLOR.ORANGE,
        selectedTextColor: APP_COLOR.WHITE,
      },
    };
  }, [value, isValidDate]);
  const handleDateSelect = useCallback(
    (date: string) => {
      if (!isDateInRange(date)) {
        AccessibilityInfo.announceForAccessibility("Ngày không hợp lệ");
        return;
      }

      onChangeText(date);
      closeCalendar();
      onBlur({ target: { name: "date_of_birth" } });
      AccessibilityInfo.announceForAccessibility(
        `Đã chọn ngày ${formatDate(date)}`
      );
    },
    [onChangeText, onBlur, isDateInRange, formatDate, closeCalendar]
  );
  const handleOpenCalendar = useCallback(() => {
    if (disabled) return;
    openCalendar();
  }, [disabled, openCalendar]);
  const displayValue = useMemo(() => {
    if (!value) return "";
    return isValidDate(value) ? formatDate(value) : value;
  }, [value, isValidDate, formatDate]);
  const hasError = useMemo(() => {
    return error && touched;
  }, [error, touched]);
  const handleMonthChange = useCallback(
    (date: any) => {
      const newDate = new Date(date.timestamp);
      updateSelectedDate(newDate);
    },
    [updateSelectedDate]
  );
  const renderHeader = useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = date.toLocaleDateString("vi-VN", { month: "long" });
      return (
        <View style={styles.calendarHeaderContainer}>
          <TouchableOpacity
            style={styles.yearPickerButton}
            onPress={openYearPicker}
            accessible={true}
            accessibilityLabel={`Chọn năm ${year}`}
            accessibilityHint="Nhấn để mở popup chọn năm"
          >
            <Text style={styles.yearPickerText}>{year}</Text>
            <AntDesign name="calendar" size={16} color={APP_COLOR.ORANGE} />
          </TouchableOpacity>
          <Text style={styles.calendarSubText}>Chọn ngày sinh của bạn</Text>
        </View>
      );
    },
    [openYearPicker]
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleOpenCalendar}
        style={[
          styles.input,
          hasError && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        disabled={disabled}
        accessible={true}
        accessibilityLabel={`${placeholder}${value ? `: ${displayValue}` : ""}`}
        accessibilityHint="Nhấn để mở lịch chọn ngày"
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.text,
            !value && styles.placeholder,
            disabled && styles.textDisabled,
          ]}
        >
          {displayValue || placeholder}
        </Text>
        <AntDesign
          name="calendar"
          size={24}
          color={disabled ? APP_COLOR.GREY : APP_COLOR.BROWN}
        />
      </TouchableOpacity>

      {hasError && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={closeCalendar}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <Calendar
              key={selectedDate.getFullYear()}
              onDayPress={(day) => {
                handleDateSelect(day.dateString);
                updateSelectedDate(new Date(day.dateString));
              }}
              markedDates={markedDates}
              theme={calendarTheme}
              current={selectedDate.toISOString()}
              onMonthChange={handleMonthChange}
              minDate={minDate}
              maxDate={maxDate}
              enableSwipeMonths={true}
              hideExtraDays={true}
              disableMonthChange={false}
              firstDay={1}
              hideDayNames={false}
              showWeekNumbers={false}
              disableArrowLeft={false}
              disableArrowRight={false}
              disableAllTouchEventsForDisabledDays={true}
              renderHeader={renderHeader}
              style={styles.calendar}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeCalendar}
                accessible={true}
                accessibilityLabel="Hủy chọn ngày"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={closeCalendar}
                accessible={true}
                accessibilityLabel="Xác nhận chọn ngày"
                accessibilityRole="button"
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={closeYearPicker}
      >
        <View style={styles.yearPickerModalContainer}>
          <View style={styles.yearPickerModalContent}>
            <View style={styles.yearPickerHeader}>
              <Text style={styles.yearPickerTitle}>Chọn năm</Text>
              <TouchableOpacity
                onPress={closeYearPicker}
                style={styles.closeYearPickerButton}
                accessible={true}
                accessibilityLabel="Đóng popup chọn năm"
                accessibilityRole="button"
              >
                <AntDesign name="close" size={24} color={APP_COLOR.BROWN} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.yearPickerScroll}
              contentContainerStyle={styles.yearPickerContent}
            >
              {yearList.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearPickerItem,
                    selectedDate.getFullYear() === year &&
                      styles.selectedYearPickerItem,
                  ]}
                  onPress={() => selectYear(year)}
                  accessible={true}
                  accessibilityLabel={`Năm ${year}`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.yearPickerItemText,
                      selectedDate.getFullYear() === year &&
                        styles.selectedYearPickerItemText,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
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
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: APP_COLOR.GREY,
    opacity: 0.6,
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: APP_COLOR.BROWN,
    flex: 1,
  },
  textDisabled: {
    color: APP_COLOR.GREY,
  },
  placeholder: {
    color: APP_COLOR.BROWN,
    opacity: 0.7,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  calendarContainer: {
    backgroundColor: APP_COLOR.WHITE,
    padding: 20,
    borderRadius: 15,
    width: "90%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendarHeaderContainer: {
    alignItems: "center",
    paddingVertical: 10,
    position: "relative",
  },
  calendarHeaderText: {
    fontSize: 20,
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
    textAlign: "center",
  },
  yearPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 5,
  },
  yearPickerText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: APP_COLOR.ORANGE,
  },
  calendarSubText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: APP_COLOR.GREY,
    marginTop: 5,
  },
  calendar: {
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: APP_COLOR.GREY,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: APP_COLOR.WHITE,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: APP_COLOR.WHITE,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  yearPickerModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  yearPickerModalContent: {
    backgroundColor: APP_COLOR.WHITE,
    borderRadius: 15,
    width: "80%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  yearPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  yearPickerTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
  },
  closeYearPickerButton: {
    padding: 5,
  },
  yearPickerScroll: {
    maxHeight: 400,
  },
  yearPickerContent: {
    padding: 15,
  },
  yearPickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 3,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  selectedYearPickerItem: {
    backgroundColor: APP_COLOR.ORANGE,
  },
  yearPickerItemText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
    textAlign: "center",
  },
  selectedYearPickerItemText: {
    color: APP_COLOR.WHITE,
    fontFamily: FONTS.medium,
  },
});

export default DateInput;
