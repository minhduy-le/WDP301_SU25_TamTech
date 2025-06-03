import TopHeader from "@/components/headerComponent/topHeader";
import SearchComponent from "@/components/headerComponent/topSearch";
import { APP_COLOR } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLOR.WHITE }}>
      <TopHeader />
      <SearchComponent />
    </SafeAreaView>
  );
};
export default HomePage;
