import TopHeader from "@/components/headerComponent/topHeader";
import TopList from "@/components/headerComponent/topList";
import SearchComponent from "@/components/headerComponent/topSearch";
import { APP_COLOR } from "@/constants/Colors";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLOR.WHITE }}>
      <View>
        <TopHeader />
        <SearchComponent />
        <TopList />
      </View>
    </SafeAreaView>
  );
};
export default HomePage;
