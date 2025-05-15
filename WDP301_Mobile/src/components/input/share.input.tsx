import { APP_COLOR } from "@/utils/constant";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  KeyboardTypeOptions,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { FONTS } from "@/theme/typography";

const styles = StyleSheet.create({
  inputGroup: {
    padding: 5,
    gap: 10,
  },

  text: {
    fontSize: 25,
    fontFamily: FONTS.regular,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  eye: {
    position: "absolute",
    right: 10,
    top: 18,
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
}
const ShareInput = (props: IProps) => {
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
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
  } = props;
  useEffect(() => {
    if (resetForm && setValue) {
      setValue("");
    }
  }, [resetForm, setValue]);
  return (
    <View style={styles.inputGroup}>
      {title && <Text style={styles.text}>{title}</Text>}
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
            { borderColor: isFocus ? APP_COLOR.ORANGE : APP_COLOR.GREY },
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
    </View>
  );
};

export default ShareInput;
