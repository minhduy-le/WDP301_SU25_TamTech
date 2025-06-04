import logo from "@/assets/data/logo.png";
import CartProductTag from "@/components/btnComponent/cartProductTag";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { useCurrentApp } from "@/context/app.context";
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

interface CartItem {
  quantity: number;
  data: {
    productId: string;
    productName: string;
    productPrice: number;
    productImg: any;
    productQuantity: number;
    basePrice: number;
    title: string;
  };
  extra?: {
    [key: string]: number;
  };
}

interface SidebarProps {
  sidebarAnimation: Animated.Value;
  toggleSidebar: () => void;
}

const Sidebar = ({ sidebarAnimation, toggleSidebar }: SidebarProps) => {
  const { cart } = useCurrentApp();
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
        <Pressable style={styles.logoContainer} onPress={toggleSidebar}>
          <Image source={logo} style={styles.logo} />
        </Pressable>
        <Text style={styles.sidebarText}>Giỏ hàng</Text>
      </View>
      {cart &&
        cart.default &&
        Object.entries(cart.default.items).map(
          ([key, item]: [string, CartItem]) => {
            return (
              <View key={key}>
                <CartProductTag
                  productImg={item.data.productImg}
                  productName={item.data.title}
                  productQuantity={item.quantity}
                  productPrice={item.data.basePrice}
                />
              </View>
            );
          }
        )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    right: 0,
    width: screenWidth * 0.8,
    height: screenHeight,
    backgroundColor: APP_COLOR.WHITE,
    borderTopLeftRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    zIndex: 1001,
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
    gap: 30,
    alignItems: "center",
  },
  sidebarText: {
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.BOLD,
    fontSize: 22,
  },
  logoContainer: {
    flexDirection: "row",
    gap: 7,
  },
  logo: {
    height: 70,
    width: 110,
  },
});

export default Sidebar;
