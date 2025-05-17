import { View, StyleSheet, Image } from "react-native";
import ShareButton from "./share.button";
import TextBetweenLine from "./text.between.line";

const styles = StyleSheet.create({
  welcomeBtn: {
    flex: 1,
    gap: 30,
  },
});

interface IProps {
  title: string;
}

const SocialButton = (props: IProps) => {
  const { title } = props;
  return (
    <View style={styles.welcomeBtn}>
      <TextBetweenLine textColor="black" title={title} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 30,
        }}
      ></View>
    </View>
  );
};

export default SocialButton;
