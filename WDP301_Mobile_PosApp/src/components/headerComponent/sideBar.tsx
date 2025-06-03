import logo from "@/assets/data/logo.png";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { FontAwesome6 } from "@expo/vector-icons";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

interface SidebarProps {
  sidebarAnimation: Animated.Value;
  toggleSidebar: () => void;
}

const Sidebar = ({ sidebarAnimation, toggleSidebar }: SidebarProps) => {
  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          transform: [{ translateX: sidebarAnimation }],
        },
      ]}
    >
      <View style={styles.sidebarContent}>
        <Image style={{ height: 70, width: 110 }} source={logo} />
        <Pressable onPress={toggleSidebar}>
          <FontAwesome6 name="bars" size={29} color={APP_COLOR.BROWN} />
        </Pressable>
      </View>
      <View style={{ marginHorizontal: 10 }}>
        <Text style={styles.sidebarText}>Trang chủ</Text>
        <Text style={styles.sidebarText}>Lịch sử thanh toán</Text>
        <Text style={styles.sidebarText}>Báo cáo doanh thu</Text>
        <Text style={styles.sidebarText}>Tra cứu khách hàng</Text>
        <Text style={styles.sidebarText}>Tra cứu ưu đãi</Text>
        <Text style={styles.sidebarText}>Kiểm kê tồn kho</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: screenWidth * 0.6,
    height: screenHeight,
    backgroundColor: APP_COLOR.WHITE,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sidebarContent: {
    padding: 20,
    paddingTop: 25,
    flexDirection: "row",
    gap: 55,
    alignItems: "center",
  },
  sidebarText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.SEMIBOLD,
    fontSize: 20,
    marginBottom: 10,
  },
});

export default Sidebar;
