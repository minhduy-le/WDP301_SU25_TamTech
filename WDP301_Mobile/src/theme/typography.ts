import { StyleSheet } from "react-native";

export const FONTS = {
  regular: "Montserrat-Regular",
  medium: "Montserrat-Medium",
  semiBold: "Montserrat-SemiBold",
  bold: "Montserrat-Bold",
};

export const typography = StyleSheet.create({
  h1: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  bodyLarge: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    lineHeight: 26,
  },
  bodyMedium: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 35,
  },
  bodySmall: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },

  labelLarge: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  labelMedium: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  labelSmall: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
