import UserPassword from "@/components/account/user.password";
import { APP_COLOR } from "@/utils/constant";
import { SafeAreaView } from "react-native";
import { useCurrentApp } from "@/context/app.context";
import { View, Text } from "react-native";
import { FONTS } from "@/theme/typography";

const PasswordPage = () => {
  const { appState } = useCurrentApp();

  if (!appState) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: APP_COLOR.BROWN,
            fontFamily: FONTS.regular,
            alignSelf: "center",
          }}
        >
          Vui lòng đăng nhập để sử dụng tính năng này.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <UserPassword />
    </SafeAreaView>
  );
};

export default PasswordPage;
