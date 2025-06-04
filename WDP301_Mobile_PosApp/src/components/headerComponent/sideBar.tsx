import logo from "@/assets/data/logo.png";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
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
        <View style={{ flexDirection: "row", gap: 7 }}>
          <Pressable onPress={toggleSidebar}>
            <AntDesign
              name="shoppingcart"
              size={29}
              color={APP_COLOR.BROWN}
              onPress={toggleSidebar}
            />
          </Pressable>
          <Text style={styles.sidebarText}>Giỏ hàng</Text>
        </View>
        <Image style={{ height: 70, width: 110 }} source={logo} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: screenWidth * 0.8,
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
    paddingTop: 20,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  sidebarText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.BOLD,
    fontSize: 22,
  },
});

export default Sidebar;
