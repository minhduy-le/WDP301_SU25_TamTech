import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardTypeOptions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 15,
    fontFamily: APP_FONT.REGULAR,
    color: APP_COLOR.BROWN,
  },
  input: {
    borderBottomWidth: 0.5,
    paddingHorizontal: 10,
    paddingBottom: 2,
    maxWidth: 250,
    ...Platform.select({
      android: {
        position: "relative",
        top: -5,
      },
    }),
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
    borderBottomColor: APP_COLOR.BROWN,
    marginVertical: "auto",
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
  placeholder?: string;
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
    placeholder,
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
      <View style={styles.container}>
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
                fontFamily: APP_FONT.MEDIUM,
                fontSize: 15,
                color: APP_COLOR.ORANGE,
              }}
            >
              {value ? "Có" : "Dùng tại cửa hàng"}
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
    <View style={styles.container}>
      {title && <Text style={styles.text}>{title}</Text>}
      {dropdownItems ? (
        <>
          <TouchableOpacity
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            style={styles.dropdown}
          >
            <Text style={{ fontFamily: APP_FONT.REGULAR, fontSize: 16 }}>
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
            placeholder={placeholder}
            placeholderTextColor={APP_COLOR.BROWN}
            keyboardType={keyboardType}
            style={[
              styles.input,
              {
                borderBottomColor: isFocus ? APP_COLOR.ORANGE : APP_COLOR.BROWN,
                color: APP_COLOR.ORANGE,
                fontFamily: APP_FONT.REGULAR,
              },
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
