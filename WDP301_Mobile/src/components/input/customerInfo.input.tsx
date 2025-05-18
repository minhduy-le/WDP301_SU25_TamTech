import { APP_COLOR } from "@/utils/constant";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  KeyboardTypeOptions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { FONTS } from "@/theme/typography";
const styles = StyleSheet.create({
  inputGroup: {
    padding: 5,
    gap: 7,
  },
  text: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    height: 40,
    width: "100%",
  },
  eye: {
    position: "absolute",
    right: 10,
    top: 18,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderColor: APP_COLOR.BROWN,
  },
  checkboxChecked: {
    backgroundColor: APP_COLOR.BROWN,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: APP_COLOR.BROWN,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    backgroundColor: "white",
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    fontSize: 16,
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
  isBoolean?: boolean;
  dropdownItems?: { id: string; title: string }[];
}

const CustomerInforInput = (props: IProps) => {
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
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
    isBoolean = false,
    dropdownItems,
  } = props;

  useEffect(() => {
    if (resetForm && setValue) {
      setValue(isBoolean ? false : "");
    }
  }, [resetForm, setValue, isBoolean]);

  const handleSelectItem = (item: { id: string; title: string }) => {
    setValue && setValue(item);
    setIsDropdownOpen(false);
  };

  if (isBoolean) {
    return (
      <View style={styles.inputGroup}>
        <View style={styles.checkboxContainer}>
          {title && <Text style={styles.text}>{title}</Text>}
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => setValue && setValue(!value)}
              style={[styles.checkbox, value && styles.checkboxChecked]}
            >
              {value && <FontAwesome5 name="check" size={12} color="white" />}
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 17,
                color: APP_COLOR.BROWN,
                position: "relative",
                bottom: 2,
              }}
            >
              {value ? "Có" : "Không"}
            </Text>
          </View>
        </View>
        {error && touched && (
          <Text style={{ color: "red", marginTop: 5 }}>{error}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inputGroup}>
      {title && <Text style={styles.text}>{title}</Text>}
      {dropdownItems ? (
        <>
          <TouchableOpacity
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            style={styles.dropdown}
          >
            <Text style={{ fontFamily: FONTS.regular, fontSize: 16 }}>
              {value ? value.title : "Select an option"}
            </Text>
          </TouchableOpacity>
          {isDropdownOpen && (
            <FlatList
              data={dropdownItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectItem(item)}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownItemText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      ) : (
        <View>
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
              { borderColor: isFocus ? APP_COLOR.ORANGE : APP_COLOR.BROWN },
            ]}
            secureTextEntry={secureTextEntry && !isShowPassword}
          />
          {error && touched && (
            <Text style={{ color: "red", marginTop: 5 }}>{error}</Text>
          )}
          {secureTextEntry && (
            <FontAwesome5
              style={styles.eye}
              name={isShowPassword ? "eye" : "eye-slash"}
              size={15}
              color="black"
              onPress={() => setIsShowPassword(!isShowPassword)}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default CustomerInforInput;
