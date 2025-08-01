import SearchCustomerInfo from "@/components/cardStaff/searchCustomerInfo";
import SearchVoucher from "@/components/cardStaff/searchVoucher";
import StaffHeader from "@/components/staffComponent/staffHeader";
import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import debounce from "debounce";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ICustomers {
  cusName?: string;
  cusPhone?: string;
  cusEmail: string;
}
const SearchInfor = () => {
  const [activeTab, setActiveTab] = useState<"customerInfor" | "voucher">(
    "customerInfor"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<ICustomers[]>([]);
  const fetchCustomers = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setCustomers([]);
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
        setCustomers([]);
      }
    }, 500),
    []
  );
  const handleChangeText = (text: string) => {
    setSearchTerm(text);
    fetchCustomers(text);
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
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "customerInfor" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("customerInfor")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "customerInfor" && styles.activeTabText,
              ]}
            >
              Thông tin khách hàng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "voucher" && styles.activeTab]}
            onPress={() => setActiveTab("voucher")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "voucher" && styles.activeTabText,
              ]}
            >
              Tra cứu ưu đãi
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: APP_COLOR.WHITE }}>
          {activeTab === "customerInfor" ? (
            <>
              <Pressable
                style={styles.pressable}
                onPress={() => console.log("hihi")}
              >
                <EvilIcons name="search" size={20} color={APP_COLOR.BROWN} />
                <TextInput
                  placeholder="Nhập số điện thoại/email của khách hàng"
                  placeholderTextColor={APP_COLOR.BROWN}
                  onChangeText={handleChangeText}
                  value={searchTerm}
                />
              </Pressable>
              <SearchCustomerInfo />
            </>
          ) : (
            <>
              <View>
                <Pressable
                  style={styles.pressable}
                  onPress={() => console.log("hihi")}
                >
                  <EvilIcons name="search" size={20} color={APP_COLOR.BROWN} />
                  <TextInput
                    placeholder="Nhập mã giảm giá"
                    placeholderTextColor={APP_COLOR.BROWN}
                    onChangeText={handleChangeText}
                    value={searchTerm}
                  />
                </Pressable>
                <SearchVoucher />
              </View>
            </>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: APP_COLOR.WHITE,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignSelf: "center",
    overflow: "hidden",
    marginTop: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: APP_COLOR.BROWN,
  },
  tabText: {
    fontSize: 16,
    color: APP_COLOR.BROWN,
    fontWeight: "bold",
  },
  activeTabText: {
    color: APP_COLOR.WHITE,
    fontWeight: "bold",
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: APP_COLOR.BROWN,
    borderWidth: 0.5,
    borderRadius: 30,
    paddingVertical: 3,
    ...Platform.select({
      ios: {
        paddingVertical: 15,
      },
    }),
    backgroundColor: APP_COLOR.WHITE,
    marginTop: 10,
    width: "95%",
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  walletCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    fontSize: 15,
    fontFamily: APP_FONT.REGULAR,
    color: "#D82D88",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default SearchInfor;
