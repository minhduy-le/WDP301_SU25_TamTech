import ManageProducts from "@/components/btnComponent/manageProductCard";
import ManageStoreCard from "@/components/cardStaff/manageStoreCard";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Feather from "@expo/vector-icons/Feather";
import debounce from "debounce";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface IProduct {
  productName: string;
  productId: string;
  productType: string;
  productStatus: boolean;
}
const screenHeight = Dimensions.get("screen").height;
const ManageStore = () => {
  const [activeTab, setActiveTab] = useState<"customerInfor" | "voucher">(
    "customerInfor"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const fetchProducts = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setProducts([]);
        return;
      }
      try {
        // const res = await axios.get(
        //   `${BASE_URL}/products?page=0&size=10&keyword=${text}`
        // );
        // if (res.data?.data?.content) {
        //   setProducts(res.data.data.content);
        // } else {
        //   setProducts([]);
        // }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setProducts([]);
      }
    }, 500),
    []
  );
  const handleChangeText = (text: string) => {
    setSearchTerm(text);
    fetchProducts(text);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        style={styles.gradientContainer}
        colors={[APP_COLOR.BACKGROUND_ORANGE, APP_COLOR.WHITE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <StaffHeader />
        <View style={styles.componentsContent}>
          <ManageStoreCard title="Tổng sản phẩm" />
          <ManageStoreCard title="Còn hàng" />
        </View>
        <View style={styles.componentsContent}>
          <ManageStoreCard title="Sắp hết" />
          <ManageStoreCard title="Hết hàng" />
        </View>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: APP_COLOR.WHITE,
            height: screenHeight * 0.49,
            borderColor: "#E0E0E0",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.05,
            shadowRadius: 1.5,
            elevation: 2,
          }}
        >
          <View
            style={{
              marginTop: 10,
              marginHorizontal: 10,
              borderBottomColor: APP_COLOR.BROWN,
              borderBottomWidth: 0.5,
              paddingBottom: 5,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontFamily: APP_FONT.SEMIBOLD,
                color: APP_COLOR.BROWN,
                fontSize: 17,
              }}
            >
              Danh sách sản phẩm
            </Text>
            <Text
              style={{
                fontFamily: APP_FONT.REGULAR,
                color: APP_COLOR.BROWN,
                fontSize: 15,
              }}
            >
              Quản lí và cập nhật sản phẩm tồn kho
            </Text>
          </View>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "customerInfor" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("customerInfor")}
            >
              <Feather
                name="box"
                size={20}
                style={[
                  styles.icon,
                  activeTab === "customerInfor" && styles.activeIcon,
                ]}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "customerInfor" && styles.activeTabText,
                ]}
              >
                Sản phẩm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "voucher" && styles.activeTab]}
              onPress={() => setActiveTab("voucher")}
            >
              <AntDesign
                name="warning"
                size={18}
                style={[
                  styles.icon,
                  activeTab === "voucher" && styles.activeIcon,
                ]}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "voucher" && styles.activeTabText,
                ]}
              >
                Cảnh báo
              </Text>
            </TouchableOpacity>
          </View>
          {activeTab === "customerInfor" ? (
            <View>
              <View
                style={{
                  marginLeft: 5,
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Pressable
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderColor: APP_COLOR.BROWN,
                    borderWidth: 0.5,
                    borderRadius: 30,
                    paddingVertical: 3,
                    backgroundColor: APP_COLOR.WHITE,
                    marginTop: 10,
                    width: "75%",
                    paddingHorizontal: 5,
                  }}
                  onPress={() => console.log("hihi")}
                >
                  <EvilIcons name="search" size={20} color={APP_COLOR.BROWN} />
                  <TextInput
                    placeholder="Nhập tên/mã sản phẩm"
                    placeholderTextColor={APP_COLOR.BROWN}
                    onChangeText={handleChangeText}
                    value={searchTerm}
                  />
                </Pressable>
                <Pressable>
                  <View style={styles.filterBtn}>
                    <AntDesign
                      name="filter"
                      size={24}
                      color={APP_COLOR.WHITE}
                    />
                  </View>
                </Pressable>
              </View>
              <ScrollView
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              >
                <ManageProducts />
              </ScrollView>
            </View>
          ) : (
            <ScrollView
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <ManageProducts />
              <ManageProducts />
            </ScrollView>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  componentsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: APP_COLOR.WHITE,
    overflow: "hidden",
    width: "70%",
    marginHorizontal: 10,
    marginVertical: 10,
    borderColor: APP_COLOR.BROWN,
    borderWidth: 0.5,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  activeTab: {
    backgroundColor: APP_COLOR.BROWN,
  },
  icon: {
    color: APP_COLOR.BROWN,
  },
  activeIcon: { color: APP_COLOR.WHITE },
  tabText: {
    fontSize: 13,
    color: APP_COLOR.BROWN,
    fontFamily: APP_FONT.MEDIUM,
  },
  activeTabText: {
    color: APP_COLOR.WHITE,
    fontFamily: APP_FONT.MEDIUM,
  },
  filterBtn: {
    height: 50,
    width: 50,
    backgroundColor: APP_COLOR.BROWN,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
export default ManageStore;
