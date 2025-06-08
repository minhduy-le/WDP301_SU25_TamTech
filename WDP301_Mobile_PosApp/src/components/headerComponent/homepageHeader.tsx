import logo from "@/assets/data/logo.png";
import Sidebar from "@/components/headerComponent/sideBar";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { useCurrentApp } from "@/context/app.context";
import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from "@expo/vector-icons/Octicons";
import { useEffect, useRef, useState } from "react";
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
const HomepageHeader = () => {
  const { cart } = useCurrentApp();
  const [quantity, setQuantity] = useState(0);
  useEffect(() => {
    if (
      cart &&
      cart.default &&
      typeof cart.default.quantity === "number" &&
      cart.default.quantity > 0
    ) {
      setQuantity(cart.default.quantity);
    } else {
      setQuantity(0);
    }
  }, [cart]);
  const sidebarAnimation = useRef(new Animated.Value(screenWidth)).current;
  const [showSidebar, setShowSidebar] = useState(false);
  const toggleSidebar = () => {
    const toValue = showSidebar ? screenWidth : 0;
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setShowSidebar(!showSidebar);
  };
  return (
    <View style={{ marginHorizontal: 5 }}>
      <View style={styles.headerContainer}>
        <Image source={logo} style={{ height: 60, width: 100 }} />
        <Pressable
          style={styles.locationContainer}
          onPress={() => console.log("Địa chỉ nè")}
        >
          <Text style={styles.locationText}>Ho Chi Minh City</Text>
          <Octicons name="chevron-down" size={15} color={APP_COLOR.BROWN} />
        </Pressable>
        <View>
          <View
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              backgroundColor: APP_COLOR.BROWN,
              width: 20,
              height: 20,
              borderRadius: 50,
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <Text
              style={{
                fontFamily: APP_FONT.BOLD,
                color: APP_COLOR.ORANGE,
                zIndex: 1000,
              }}
            >
              {quantity}
            </Text>
          </View>
          <AntDesign
            name="shoppingcart"
            size={38}
            color={APP_COLOR.BROWN}
            onPress={toggleSidebar}
          />
        </View>
      </View>
      <Sidebar
        sidebarAnimation={sidebarAnimation}
        toggleSidebar={toggleSidebar}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locationText: {
    fontFamily: APP_FONT.MEDIUM,
    color: APP_COLOR.BROWN,
    fontSize: 15,
  },
});
export default HomepageHeader;
