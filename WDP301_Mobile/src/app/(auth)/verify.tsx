import LoadingOverlay from "@/components/loading/overlay";
import { resendCodeAPI, verifyEmailCustomer } from "@/utils/api";
import { APP_COLOR } from "@/utils/constant";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import OTPTextView from "react-native-otp-textinput";
import Toast from "react-native-root-toast";
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
  resendTextDisabled: {
    color: APP_COLOR.GREY,
    fontFamily: FONTS.medium,
  },
  countdownText: {
    color: APP_COLOR.ORANGE,
    fontFamily: FONTS.medium,
  },
});

const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const VerifyPage = () => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const otpRef = useRef<OTPTextView>(null);
  const [code, setCode] = useState<string>("");
  const { email } = useLocalSearchParams();
  const [coundownEmail, setCoundownEmail] = useState<number>(600);
  useEffect(() => {
    let timer: number | null;
    if (countdown > 0 || coundownEmail > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
        setCoundownEmail((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, coundownEmail]);

  const verifyCustomerEmail = async (email: string, otp: string) => {
    try {
      console.log(email, otp);
      Keyboard.dismiss();
      setIsSubmit(true);
      const verifyRes = await verifyEmailCustomer(email, otp);
      console.log(verifyRes);
      setIsSubmit(false);
      if (verifyRes) {
        Toast.show("Xác thực tài khoản thành công", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
          position: -35,
        });
        router.replace("/(auth)/welcome");
      } else {
        Toast.show("Xác thực tài khoản thất bại", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.CANCEL,
          opacity: 1,
        });
      }
    } catch (error) {
      console.log("Lỗi không thể xác thực được email", error);
    }
  };

  useEffect(() => {
    if (code && code.length === 6) {
      verifyCustomerEmail(email as string, code);
    }
  }, [code]);

  const handleResendCode = async () => {
    if (countdown > 0) return;
    otpRef?.current?.clear();
    setCountdown(60);
    try {
      const res = await resendCodeAPI(email as string);
      const m = res.data ? "Resend code thành công" : res.message;
      Toast.show(m as string, {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1,
      });
    } catch (error) {
      console.error("Error resending code:", error);
      Toast.show("Không thể gửi lại mã. Vui lòng thử lại sau.", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcomeText}>
        <Image style={styles.imgLogo} source={logo} />
        <Text style={styles.headerText}>Chào mừng bạn đến với Tấm Tắc</Text>
        {coundownEmail == 0 ? (
          <Text
            style={{
              marginVertical: 10,
              fontFamily: FONTS.regular,
              color: APP_COLOR.CANCEL,
              marginHorizontal: 10,
              textAlign: "center",
            }}
          >
            OTP đã hết hạn, vui lòng gửi lại mã
          </Text>
        ) : (
          <Text
            style={{
              marginVertical: 10,
              fontFamily: FONTS.regular,
              color: APP_COLOR.BROWN,
              marginHorizontal: 10,
              textAlign: "center",
            }}
          >
            Mã OTP đã được gửi về {email}, OTP có hiệu lực trong{" "}
            {formatCountdown(coundownEmail)}
          </Text>
        )}
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
              height: 45,
              width: 45,
              borderWidth: 1,
              borderColor: APP_COLOR.BROWN,
              borderBottomWidth: 1,
              borderRadius: 5,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            marginVertical: 10,
            alignItems: "center",
          }}
        >
          <Text style={styles.resendText}>Không nhận được mã xác nhận, </Text>
          <TouchableOpacity onPress={handleResendCode} disabled={countdown > 0}>
            <Text
              style={[
                countdown > 0 ? styles.resendTextDisabled : styles.resendText,
                { textDecorationLine: "underline" },
              ]}
            >
              {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi lại"}
            </Text>
          </TouchableOpacity>
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
      {isSubmit && <LoadingOverlay />}
    </View>
  );
};

export default VerifyPage;
