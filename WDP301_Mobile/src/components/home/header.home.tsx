import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Modal,
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
    marginTop: 30,
    paddingTop: 5,
    gap: 3,
    height: 50,

    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  location: {
    flexDirection: "row",
    alignItems: "flex-end",
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
      <View style={styles.location}>
        <Text
          style={{
            fontFamily: FONTS.medium,
            fontSize: 15,
            marginLeft: 5,
          }}
        >
          Giao đến:
        </Text>
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
            width: "50%",
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
        <Image
          source={logo}
          style={{
            height: 70,
            width: 100,
            position: "absolute",
            top: 5,
            right: 10,
            transform: [{ translateY: -25 }],
          }}
        />
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.branchModalContent}>
            <Text style={styles.modalHeader}>Chọn chi nhánh</Text>
            <FlatList
              data={branchesInfo}
              renderItem={({ item }: { item: IPropsBranches }) => (
                <Pressable onPress={() => handleBranchSelect(item)}>
                  <Text style={styles.branchItemHeader}>
                    {item.branch.name} {"     "}
                    {(item.distance / 1000).toFixed(1)} Km
                  </Text>
                  <Text style={styles.branchItem}>{item.branch.address}</Text>
                </Pressable>
              )}
              keyExtractor={(item: any) => item.id}
            />
            <Pressable onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButton}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HeaderHome;
