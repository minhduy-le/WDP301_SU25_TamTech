import LoadingOverlay from "@/components/loading/overlay";
import { resendCodeAPI, verifyCodeAPI } from "@/utils/api";
import { APP_COLOR } from "@/utils/constant";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Keyboard } from "react-native";
import OTPTextView from "react-native-otp-textinput";
import Toast from "react-native-root-toast";
import { BASE_URL } from "@/utils/constant";
const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 25,
    fontWeight: "600",
    marginVertical: 20,
  },
});

const VerifyPage = () => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const otpRef = useRef<OTPTextView>(null);
  const [code, setCode] = useState<string>("");
  const { phoneNumber, isLogin } = useLocalSearchParams();
  const verifyCode = async () => {
    Keyboard.dismiss();
    setIsSubmit(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/verify-code/verify?phoneNumber=${phoneNumber}&code=${code}`
      );
      setIsSubmit(false);
      if (res.data) {
        const token = res.data.access_token;
        const refresh_token = res.data.refresh_token;
        otpRef?.current?.clear();
        Toast.show("Kích hoạt tài khoản thành công", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });

        if (isLogin) {
          router.replace("/(tabs)");
        } else {
          router.replace({
            pathname: "/(auth)/customer.changepassword",
            params: { token, refresh_token },
          });
        }
      } else {
        Toast.show(res.message as string, {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
      }
    } catch (error) {
      console.log(">>> Error during sign-up: ", error);
    }
  };

  useEffect(() => {
    if (code && code.length === 6) {
      verifyCode();
    }
  }, [code]);

  const handleResendCode = async () => {
    otpRef?.current?.clear();
    const res = await resendCodeAPI(phoneNumber as string);
    const m = res.data ? "Resend code thành công" : res.message;
    Toast.show(m as string, {
      duration: Toast.durations.LONG,
      textColor: "white",
      backgroundColor: APP_COLOR.ORANGE,
      opacity: 1,
    });
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.heading}>Xác thực tài khoản</Text>
        <Text style={{ marginVertical: 10 }}>
          Vui lòng nhập mã xác nhận đã được gửi tới số điện thoại {phoneNumber}
        </Text>
        <View style={{ marginVertical: 20 }}>
          <OTPTextView
            ref={otpRef}
            handleTextChange={setCode}
            autoFocus
            inputCount={6}
            inputCellLength={1}
            tintColor={APP_COLOR.ORANGE}
            textInputStyle={{
              height: 40,
              width: 40,
              borderWidth: 1,
              borderColor: APP_COLOR.GREY,
              borderBottomWidth: 1,
              borderRadius: 5,
              // @ts-ignore:next-line
              color: APP_COLOR.ORANGE,
            }}
          />
        </View>
        <View style={{ flexDirection: "row", marginVertical: 10 }}>
          <Text>Không nhận được mã xác nhận, </Text>
          <Text
            onPress={handleResendCode}
            style={{ textDecorationLine: "underline" }}
          >
            Gửi lại
          </Text>
        </View>
      </View>
      {isSubmit && <LoadingOverlay />}
    </>
  );
};

export default VerifyPage;
