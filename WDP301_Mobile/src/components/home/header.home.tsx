import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Modal,
  Platform,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import * as Location from "expo-location";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import logo from "@/assets/logo.png";
import { FONTS } from "@/theme/typography";
import axios from "axios";
import { useCurrentApp } from "@/context/app.context";
interface HeaderHomeProps {
  onBranchSelect: (id: string) => void;
}
interface IPropsBranches {
  distance: number;
  branch: any;
  id: number;
  name: string;
}
const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "ios" ? 30 : 20,
    marginBottom: Platform.OS === "ios" ? 20 : 0,
    paddingTop: 20,
    gap: 3,
    height: 50,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  branchModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
  branchItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontFamily: FONTS.medium,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: APP_COLOR.BLACK,
    borderBottomColor: APP_COLOR.GREY,
    borderBottomWidth: 1,
  },
  branchItemHeader: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    textAlign: "center",
    color: APP_COLOR.ORANGE,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalHeader: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    marginBottom: 15,
    color: APP_COLOR.BLACK,
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 8,
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
});

const HeaderHome: React.FC<HeaderHomeProps> = ({ onBranchSelect }) => {
  const [location, setLocation] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [branchesInfo, setBranchInfo] = useState([]);
  const { locationReal } = useCurrentApp();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/branches/distance?destination=${locationReal}`
        );
        setBranchInfo(res.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const handleBranchSelect = (branch: any) => {
    onBranchSelect(branch.branch.id);
    setIsModalVisible(false);
  };
  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const locationData = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = locationData.coords;

        const address = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (address.length > 0) {
          const { city, region, subregion, district } = address[0];
          const parts = [];
          if (city) parts.push(city);
          if (region) parts.push(region);
          if (subregion || district) parts.push(district || subregion);
          const fullAddress = parts.join(", ");
          setLocation(fullAddress || "Không tìm thấy địa chỉ");
        } else {
          setLocation("Không tìm thấy địa chỉ");
        }
      }
    };

    getLocation();
  }, []);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontFamily: FONTS.bold,
          fontSize: 15,
          marginLeft: 5,
          color: APP_COLOR.BROWN,
        }}
      >
        Giao đến:
      </Text>
      <View style={{ flexDirection: "row" }}>
        <Entypo
          name="location-pin"
          size={20}
          color={APP_COLOR.ORANGE}
          style={{
            marginLeft: 10,
            marginBottom: 5,
          }}
        />
        <Text
          style={{
            fontFamily: FONTS.medium,
            fontSize: 15,
            width: Platform.OS === "android" ? "70%" : "60%",
            zIndex: 999,
            color: APP_COLOR.BROWN,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {locationReal
            ? locationReal
            : location
            ? location
            : "Đang lấy vị trí..."}{" "}
          hoặc
        </Text>
      </View>
      <Image
        source={logo}
        style={{
          height: 80,
          width: 120,
          position: "absolute",
          top: 30,
          right: 10,
          transform: [{ translateY: -25 }],
        }}
      />
    </View>
  );
};

export default HeaderHome;
