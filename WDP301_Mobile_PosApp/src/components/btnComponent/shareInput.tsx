import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";

interface IProps {
  title?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  value: any;
  setValue?: (v: any) => void;
  onChangeText?: any;
  onBlur?: any;
  error?: any;
  touched?: any;
  editable?: boolean;
  resetForm?: boolean;
  placeholder?: string;
  placeholderTextColor?: string;
  isDatePicker?: boolean;
  isDropdown?: boolean;
  dropdownOptions?: { label: string; value: any }[];
}

const ShareInput = (props: IProps) => {
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());

  const {
    title,
    keyboardType,
    secureTextEntry = false,
    value,
    setValue,
    onChangeText,
    onBlur,
    error,
    touched,
    editable = true,
    resetForm = false,
    placeholder,
    placeholderTextColor,
    isDatePicker = false,
    isDropdown = false,
    dropdownOptions = [],
  } = props;

  useEffect(() => {
    if (resetForm && setValue) {
      setValue("");
    }
  }, [resetForm, setValue]);

  useEffect(() => {
    if (value && typeof value === "string" && isDatePicker) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate);
      }
    }
  }, [value, isDatePicker]);

  const handleDateConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    setDate(selectedDate);
    const formattedDate = selectedDate.toLocaleDateString("en-CA");
    if (onChangeText) {
      onChangeText(formattedDate);
    }
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleDropdownChange = (itemValue: any) => {
    if (onChangeText) {
      onChangeText(itemValue);
    }
  };

  return (
    <View style={styles.inputGroup}>
      {title && <Text style={styles.text}>{title}</Text>}
      <View>
        {isDropdown ? (
          <View
            style={[
              styles.pickerContainer,
              {
                borderColor: isFocus ? APP_COLOR.ORANGE : APP_COLOR.BROWN,
              },
            ]}
          >
            <Picker
              selectedValue={value}
              onValueChange={handleDropdownChange}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              style={styles.picker}
              enabled={editable}
            >
              {placeholder && (
                <Picker.Item
                  label={placeholder}
                  value=""
                  color={placeholderTextColor || APP_COLOR.BROWN}
                />
              )}
              {dropdownOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        ) : isDatePicker ? (
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(true)}>
            <View>
              <TextInput
                editable={false}
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={(e) => {
                  if (onBlur) onBlur(e);
                  setIsFocus(false);
                }}
                style={[
                  styles.input,
                  {
                    borderColor: isFocus ? APP_COLOR.ORANGE : APP_COLOR.BROWN,
                    fontFamily: APP_FONT.REGULAR,
                  },
                ]}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor || APP_COLOR.BROWN}
              />
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <TextInput
            editable={editable}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocus(true)}
            onBlur={(e) => {
              if (onBlur) onBlur(e);
              setIsFocus(false);
            }}
            keyboardType={keyboardType}
            style={[
              styles.input,
              {
                borderColor: isFocus ? APP_COLOR.ORANGE : APP_COLOR.BROWN,
                fontFamily: APP_FONT.REGULAR,
              },
            ]}
            secureTextEntry={secureTextEntry && !isShowPassword}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor || APP_COLOR.BROWN}
          />
        )}

        {error && touched && (
          <Text style={{ color: "red", marginTop: 5 }}>{error}</Text>
        )}

        {secureTextEntry && (
          <FontAwesome5
            style={styles.eye}
            name={isShowPassword ? "eye" : "eye-slash"}
            size={20}
            color={APP_COLOR.BROWN}
            onPress={() => setIsShowPassword(!isShowPassword)}
          />
        )}
      </View>
      {isDatePicker && (
        <DatePicker
          modal
          open={showDatePicker}
          date={date}
          onConfirm={handleDateConfirm}
          onCancel={handleDateCancel}
          mode="date"
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  inputGroup: {
    gap: 5,
  },
  text: {
    fontSize: 20,
    fontFamily: APP_FONT.REGULAR,
    color: APP_COLOR.BROWN,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    color: APP_COLOR.BROWN,
  },
  pickerContainer: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: APP_COLOR.BROWN,
    justifyContent: "center",
  },
  picker: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.REGULAR,
  },
  eye: {
    position: "absolute",
    right: 15,
    top: 11,
  },
});
export default ShareInput;
