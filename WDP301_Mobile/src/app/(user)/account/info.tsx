import UserInfo from "@/components/account/user.info";
import { APP_COLOR } from "@/utils/constant";
import { SafeAreaView } from "react-native-safe-area-context";

const InfoPage = () => {
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
