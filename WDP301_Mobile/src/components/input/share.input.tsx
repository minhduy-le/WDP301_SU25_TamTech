import { APP_COLOR } from "@/utils/constant";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  KeyboardTypeOptions,
  TouchableWithoutFeedback,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { FONTS } from "@/theme/typography";
import DatePicker from "react-native-date-picker";

const styles = StyleSheet.create({
  inputGroup: {
    gap: 5,
  },
  text: {
    fontSize: 17,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    color: APP_COLOR.BROWN,
  },
  eye: {
    position: "absolute",
    right: 15,
    top: 11,
  },
});

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
  } = props;

  useEffect(() => {
    if (resetForm && setValue) {
      setValue("");
    }
  }, [resetForm, setValue]);
  useEffect(() => {
    if (value && typeof value === "string") {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate);
      }
    }
  }, [value]);

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

  return (
    <View style={styles.inputGroup}>
      {title && <Text style={styles.text}>{title}</Text>}
      <View>
        {isDatePicker ? (
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
                    fontFamily: FONTS.regular,
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
                fontFamily: FONTS.regular,
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

export default ShareInput;
