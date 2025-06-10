import logo from "@/assets/data/logo.png";
import CartProductTag from "@/components/btnComponent/cartProductTag";
import ShareButton from "@/components/btnComponent/shareBtn";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { useCurrentApp } from "@/context/app.context";
import { router } from "expo-router";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";

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
  const { cart, setCart } = useCurrentApp();

  const handleDeleteItem = (productId: string) => {
    if (cart && cart.default && cart.default.items) {
      const updatedItems = { ...cart.default.items };
      delete updatedItems[productId];
      setCart({
        ...cart,
        default: {
          ...cart.default,
          items: updatedItems,
        },
      });
    }
  };

  const renderItem = (data: any) => (
    <View style={styles.cartItemContainer}>
      <CartProductTag
        productImg={data.item.data.productImg}
        productName={data.item.data.title}
        productQuantity={data.item.quantity}
        productPrice={data.item.data.basePrice}
      />
    </View>
  );
  const renderHiddenItem = (data: any) => (
    <View style={styles.rowBack}>
      <Pressable
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(data.item.data.productId)}
      >
        <Text style={styles.deleteButtonText}>Xóa</Text>
      </Pressable>
    </View>
  );

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
      <View style={{ flex: 1 }}>
        {cart && cart.default && (
          <SwipeListView
            data={Object.entries(cart.default.items).map(([key, item]) => ({
              key,
              ...item,
            }))}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-80}
            disableRightSwipe
            style={styles.listContainer}
            closeOnRowBeginSwipe
            closeOnRowPress
            closeOnScroll
            friction={10}
            tension={40}
            swipeToOpenPercent={20}
            useNativeDriver
            previewRowKey={Object.keys(cart.default.items)[0]}
            previewOpenValue={-40}
            previewOpenDelay={3000}
          />
        )}
      </View>
      <View style={styles.orderButtonContainer}>
        <ShareButton
          title="Tạo đơn hàng"
          onPress={() => router.navigate("/(staff)/order/placeOrder")}
          textStyle={{
            textTransform: "uppercase",
            color: APP_COLOR.WHITE,
            paddingVertical: 5,
            fontFamily: APP_FONT.MEDIUM,
          }}
          btnStyle={{
            justifyContent: "center",
            borderRadius: 30,
            marginTop: 10,
            paddingVertical: 10,
            backgroundColor: APP_COLOR.ORANGE,
            marginHorizontal: 70,
          }}
        />
      </View>
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
    justifyContent: "center",
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
  listContainer: {
    flex: 1,
  },
  cartItemContainer: {
    backgroundColor: APP_COLOR.WHITE,
    height: 100,
    justifyContent: "center",
    position: "relative",
    top: -7,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: APP_COLOR.CANCEL,
    flex: 0.8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteButton: {
    backgroundColor: APP_COLOR.CANCEL,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    position: "absolute",
    right: 0,
  },
  deleteButtonText: {
    color: APP_COLOR.WHITE,
    fontFamily: APP_FONT.MEDIUM,
    fontSize: 16,
  },
  orderButtonContainer: {
    alignItems: "center",
    backgroundColor: APP_COLOR.WHITE,
    ...Platform.select({
      android: {
        marginBottom: 75,
      },
    }),
  },
});

export default Sidebar;
