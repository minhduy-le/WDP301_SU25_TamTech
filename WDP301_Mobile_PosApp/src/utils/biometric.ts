import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const isBiometricAvailable = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
};

export const authenticateWithBiometric = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Xác thực vân tay để đăng nhập",
      fallbackLabel: "Sử dụng mật khẩu",
      disableDeviceFallback: false,
    });

    if (result.success) {
      // Lưu trạng thái đã xác thực
      await AsyncStorage.setItem("biometric_authenticated", "true");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Biometric authentication error:", error);
    return false;
  }
};

export const checkBiometricAuth = async () => {
  try {
    const authenticated = await AsyncStorage.getItem("biometric_authenticated");
    return authenticated === "true";
  } catch (error) {
    console.error("Error checking biometric auth:", error);
    return false;
  }
};

export const clearBiometricAuth = async () => {
  try {
    await AsyncStorage.removeItem("biometric_authenticated");
  } catch (error) {
    console.error("Error clearing biometric auth:", error);
  }
};
