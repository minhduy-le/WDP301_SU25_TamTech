import LoadingOverlay from "@/components/loading/overlay";
import { resendCodeAPI } from "@/utils/api";
import { APP_COLOR } from "@/utils/constant";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Keyboard, Image } from "react-native";
import OTPTextView from "react-native-otp-textinput";
import Toast from "react-native-root-toast";
import { BASE_URL } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
import logo from "@/assets/logo.png";
import footerFrame from "@/assets/frame_footer.png";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  welcomeText: {
    flex: 0.4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 130,
  },
  heading: {
    fontSize: 25,
    fontWeight: "600",
    marginVertical: 20,
  },
  headerText: {
    top: 5,
    fontSize: 20,
    color: "#632713",
    fontFamily: FONTS.regular,
  },
  imgLogo: {
    height: 230,
    width: 400,
    marginTop: 70,
  },
  resendText: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.medium,
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
        <View style={styles.welcomeText}>
          <Image style={styles.imgLogo} source={logo} />
          <Text style={styles.headerText}>Chào mừng bạn đến với Tấm Tắc</Text>
          <Text
            style={{
              marginVertical: 10,
              fontFamily: FONTS.regular,
              color: APP_COLOR.BROWN,
              marginHorizontal: 10,
              textAlign: "center",
            }}
          >
            Một mã OTP đã được gửi về số điện thoại của bạn, OTP có hiệu lực
            trong 3 phút {phoneNumber}
          </Text>
          <View style={{ marginVertical: 20 }}>
            <OTPTextView
              ref={otpRef}
              handleTextChange={setCode}
              autoFocus
              inputCount={6}
              inputCellLength={1}
              tintColor={APP_COLOR.ORANGE}
              offTintColor={APP_COLOR.BROWN}
              textInputStyle={{
                height: 40,
                width: 40,
                borderWidth: 1,
                borderColor: APP_COLOR.BROWN,
                borderBottomWidth: 1,
                borderRadius: 5,
                // @ts-ignore:next-line
                color: APP_COLOR.ORANGE,
              }}
            />
          </View>
          <View style={{ flexDirection: "row", marginVertical: 10 }}>
            <Text style={styles.resendText}>Không nhận được mã xác nhận, </Text>
            <Text
              onPress={handleResendCode}
              style={[styles.resendText, { textDecorationLine: "underline" }]}
            >
              Gửi lại
            </Text>
          </View>
        </View>
        <Image
          source={footerFrame}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 250,
            height: 250,
            resizeMode: "contain",
          }}
        />
      </View>
      {isSubmit && <LoadingOverlay />}
    </>
  );
};

export default VerifyPage;
