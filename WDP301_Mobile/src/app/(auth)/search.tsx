import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { APP_COLOR } from "@/utils/constant";
import { TextInput } from "react-native-gesture-handler";
import { router } from "expo-router";
import { useState, useCallback } from "react";
import debounce from "debounce";
import Entypo from "@expo/vector-icons/Entypo";
import axios from "axios";
import { useCurrentApp } from "@/context/app.context";
import ShareButton from "@/components/button/share.button";
interface IAddress {
  place_id: string;
  description: string;
}
const data = [
  {
    key: 1,
    name: "Quán Tiền Bối",
    source: require("@/assets/icons/noodles.png"),
  },
  {
    key: 2,
    name: "Bún, Mì, Phở",
    source: require("@/assets/icons/bun-pho.png"),
  },
  { key: 3, name: "Fast Food", source: require("@/assets/icons/fastfood.png") },
  { key: 4, name: "Pizza", source: require("@/assets/icons/pizza.png") },
  { key: 5, name: "Burger", source: require("@/assets/icons/burger.png") },
  {
    key: 6,
    name: "Sống Khỏe",
    source: require("@/assets/icons/egg-cucmber.png"),
  },
  { key: 7, name: "Giảm 50k", source: require("@/assets/icons/moi-moi.png") },
  { key: 8, name: "Milk Tea", source: require("@/assets/icons/salad.png") },
];
const SearchPage = () => {
  const { setLocationReal } = useCurrentApp();
  const [restaurants, setRestaurants] = useState<IAddress[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const handleCreateOrderLocation = (description: string) => {
    setSearchTerm(description);
    setLocationReal(description);
    setRestaurants([]);
  };
  const handleChooseLocation = () => {
    router.push("/(tabs)/");
  };
  const handleSearch = useCallback(
    debounce(async (text: string) => {
      setSearchTerm(text);
      if (!text) return;
      const res = await axios.get(
        `https://maps.gomaps.pro/maps/api/place/queryautocomplete/json?input=${text}&language=vi&key=AlzaSyNOiNuM9dYaAZxahUvMvBOIjx4xyOSi3yr`
      );
      if (res.data) {
        setRestaurants(res.data.predictions);
      }
    }, 500),
    []
  );
  const DefaultResult = () => {
    return (
      <View
        style={{
          backgroundColor: "white",
          padding: 10,
          gap: 10,
        }}
      >
        <Text>Phổ biến</Text>
        <FlatList
          data={data}
          numColumns={2}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  flex: 1,
                  borderColor: "#eee",
                  borderTopWidth: index === 0 || index === 1 ? 1 : 0,
                  borderBottomWidth: 1,
                  borderLeftWidth: 1,
                  borderRightWidth: index % 2 === 1 ? 1 : 0,
                }}
              >
                <Text>{item.name}</Text>
                <Image
                  source={item.source}
                  style={{
                    height: 35,
                    width: 35,
                  }}
                />
              </View>
            );
          }}
        />
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 5,
          alignItems: "center",
          padding: 10,
        }}
      >
        <MaterialIcons
          onPress={() => router.back()}
          name="arrow-back"
          size={24}
          color={APP_COLOR.ORANGE}
        />
        <TextInput
          placeholder="Địa chỉ giao hàng"
          onChangeText={(text: string) => {
            setSearchTerm(text);
            handleSearch(text);
          }}
          value={searchTerm}
          autoFocus
          style={{
            flex: 1,
            backgroundColor: "#eee",
            paddingVertical: 3,
            paddingHorizontal: 10,
            borderRadius: 3,
          }}
        />
        <ShareButton
          title="Chọn địa chỉ giao hàng"
          onPress={handleChooseLocation}
        />
      </View>
      <Pressable style={{ backgroundColor: "#eee", flex: 1 }}>
        {searchTerm.length === 0 ? (
          <DefaultResult />
        ) : (
          <Pressable style={{ backgroundColor: "white", gap: 10 }}>
            {restaurants?.map((item) => {
              return (
                <Pressable
                  key={item.place_id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                    gap: 10,
                    borderBottomColor: "#eee",
                    borderBottomWidth: 1,
                  }}
                  onPress={() => handleCreateOrderLocation(item.description)}
                >
                  <Entypo
                    name="location-pin"
                    size={20}
                    color={APP_COLOR.ORANGE}
                    style={{
                      marginRight: 10,
                    }}
                  />
                  <Text>{item.description}</Text>
                </Pressable>
              );
            })}
          </Pressable>
        )}
      </Pressable>
    </SafeAreaView>
  );
};
export default SearchPage;
