import { Text, View, StyleSheet, ImageBackground, Image } from "react-native";
import { Link, router } from "expo-router";
import ShareButton from "components/button/share.button";
import { APP_COLOR } from "utils/constant";
import bg from "@/assets/auth/welcome-background.jpg";
import { LinearGradient } from "expo-linear-gradient";
import logo from "@/assets/logo.png";
import { FONTS, typography } from "@/theme/typography";
import TextBetweenLine from "@/components/button/text.between.line";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headingText: {
    flex: 0.6,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 20,
    position: "relative",
  },
  textBackground: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    zIndex: -1,
    height: 130,
  },
  heading: {
    fontSize: 60,
    fontFamily: FONTS.bold,
    color: APP_COLOR.YELLOW,
    marginTop: 150,
  },
  body: {
    fontSize: 35,
    fontFamily: FONTS.regular,
    color: APP_COLOR.ORANGE,
    marginLeft: 170,
  },
  imgLogo: {
    position: "absolute",
    top: 0,
    left: 90,
    height: 200,
    width: 200,
    marginBottom: 30,
    marginTop: 50,
  },
  textLine: {
    marginBottom: 40,
  },
  signUpBtn: {
    flex: 0.4,
    gap: 10,
  },
  signUpText: {
    color: "white",
    textDecorationLine: "underline",
    fontFamily: FONTS.regular,
  },
  roleBtn: {
    width: 300,
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 10,
    backgroundColor: "#2c2c2c",
    borderColor: "#505050",
    borderWidth: 1,
    marginHorizontal: 20,
  },
  roleBtnText: {
    ...typography.labelLarge,
    color: "#fff",
    paddingVertical: 5,
  },
  roleSelection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 30,
  },
  normalText: {
    ...typography.bodyMedium,
    color: "white",
  },
  hrefLink: { marginTop: 4 },
  loginLink: {
    color: "#fff",
    textDecorationLine: "underline",
    fontFamily: FONTS.regular,
  },
});

const RoleSignup = () => {
  return (
    <ImageBackground style={{ flex: 1 }} source={bg}>
      <LinearGradient
        style={{ flex: 1 }}
        colors={["transparent", "#191B2F"]}
        locations={[0.2, 0.8]}
      >
        <View style={styles.container}>
          <View style={styles.headingText}>
            <Image style={styles.imgLogo} source={logo} />
            <View style={styles.textBackground}></View>
            <Text style={styles.heading}>Tấm Tắc</Text>
            <Text style={styles.body}>Đăng ký</Text>
          </View>
          <View style={styles.textLine}>
            <TextBetweenLine title="Đăng ký bằng vai trò" />
          </View>
          <View style={styles.signUpBtn}>
            <ShareButton
              title="Khách Hàng"
              onPress={() => {
                router.navigate("/(auth)/customer.signup");
              }}
              textStyle={styles.roleBtnText}
              btnStyle={styles.roleBtn}
              pressStyle={{ alignSelf: "stretch" }}
            />
            <View />
            <View style={styles.signUpBtn}>
              <ShareButton
                title="Nhân Viên"
                onPress={() => {
                  router.navigate("/(auth)/signup");
                }}
                textStyle={styles.roleBtnText}
                btnStyle={styles.roleBtn}
                pressStyle={{ alignSelf: "stretch" }}
              />
            </View>

            <View style={styles.roleSelection}>
              <Text style={styles.normalText}>Đã có tài khoản? </Text>
              <Link href={"/(auth)/welcome"} style={styles.hrefLink}>
                <Text style={styles.loginLink}>Đăng nhập.</Text>
              </Link>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default RoleSignup;
