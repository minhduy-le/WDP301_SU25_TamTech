import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface IBlinkingNoti {
  count: number;
  children: number;
}
const BlinkingBadge = (props: IBlinkingNoti) => {
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (props.count > 0) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.2,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );

      animation.start();

      return () => animation.stop();
    }
  }, [props.count, opacityAnim]);

  return (
    <View style={styles.container}>
      {props.children}
      {props.count > 0 && (
        <Animated.View
          style={[styles.badgeContainer, { opacity: opacityAnim }]}
        >
          <Text style={styles.badgeText}>{props.count}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "auto",
    height: "auto",
  },
  badgeContainer: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: APP_COLOR.CANCEL,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: APP_COLOR.WHITE,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  badgeText: {
    color: APP_COLOR.WHEAT,
    fontSize: 12,
    fontFamily: APP_FONT.BOLD,
  },
});

export default BlinkingBadge;
