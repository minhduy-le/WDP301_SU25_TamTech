import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
interface IBtn {
  onPress: () => void;
  title: string;
  textStyle?: StyleProp<TextStyle>;
  pressStyle?: StyleProp<ViewStyle>;
  btnStyle?: StyleProp<ViewStyle>;
}
const PressBtn = (props: IBtn) => {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, props.btnStyle]}
      onPress={props.onPress}
      activeOpacity={0.8}
    >
      <Text style={[props.textStyle]}>{props.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

export default PressBtn;
