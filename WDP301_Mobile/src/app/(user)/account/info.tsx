import UserInfo from "@/components/account/user.info";
import { APP_COLOR } from "@/utils/constant";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrentApp } from "@/context/app.context";
import { View, Text, StyleSheet } from "react-native";
import { FONTS } from "@/theme/typography";

const InfoPage = () => {
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
    <>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
      >
        <UserInfo />
      </SafeAreaView>
    </>
  );
};

export default InfoPage;
