import UserPassword from "@/components/account/user.password";
import { APP_COLOR } from "@/utils/constant";
import { SafeAreaView } from "react-native";

const PasswordPage = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <UserPassword />
    </SafeAreaView>
  );
};

export default PasswordPage;
