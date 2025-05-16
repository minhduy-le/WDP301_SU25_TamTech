import { Text, View, StyleSheet, TextStyle } from "react-native";
import { FONTS, typography } from "@/theme/typography";

interface IProps {
  title: string;
  textColor?: "#632713" | "black";
  textStyle?: TextStyle;
}

const TextBetweenLine = (props: IProps) => {
  const { title, textColor = "#632713", textStyle } = props;
  return (
    <View style={styles.container}>
      <View style={styles.line}></View>
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {title}
      </Text>
      <View style={styles.line}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
  },
  line: {
    borderBottomColor: "#632713",
    borderBottomWidth: 1,
    paddingHorizontal: 35,
  },
  text: {
    ...typography.bodyMedium,
    position: "relative",
    top: 10,
  },
});

export default TextBetweenLine;
