import EmployeeHeader from "@/components/employee/topheader.employee";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import demo from "@/assets/demo.jpg";
import { APP_COLOR } from "@/utils/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface User {
  id: string;
  name: string;
  status: string;
  avatar: any;
  time: string;
}
import { jwtDecode } from "jwt-decode";
import { FONTS } from "@/theme/typography";
import logo from "@/assets/logo.png";

const ChatList = () => {
  const [decodeToken, setDecodeToken] = useState<any>("");

  const users: User[] = [
    {
      id: "1",
      name: "An đẹp chai",
      status: "Chiều mới lên",
      avatar: demo,
      time: "5 giờ",
    },
    {
      id: "2",
      name: "An And The Besties",
      status: "Thư đã bình chọn cho 'Cố'...",
      avatar: demo,
      time: "16 phút",
    },
    {
      id: "3",
      name: "An SanSan",
      status: "Đã bày tỏ cảm xúc 😆 về tin nhắn...",
      avatar: demo,
      time: "20 phút",
    },
    {
      id: "4",
      name: "An BE",
      status: "Bạn đã gửi một video.",
      avatar: demo,
      time: "21 phút",
    },
    {
      id: "5",
      name: "...",
      status: "Đã bày tỏ cảm xúc ❤️ về tin nhắn...",
      avatar: demo,
      time: "22 phút",
    },
    {
      id: "6",
      name: "SWD",
      status: "Phúc: 🤘",
      avatar: demo,
      time: "23 phút",
    },
    {
      id: "7",
      name: "Trung Trương",
      status: "Đơnn =>> : 1 ngày",
      avatar: demo,
      time: "1 ngày",
    },
  ];

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setDecodeToken(decoded);
        } else {
          console.log("No access token found.");
        }
      } catch (error) {
        console.error("Error retrieving access token:", error);
      }
    };
    getAccessToken();
  }, []);

  const handleSubmit = (id: string) => {
    router.navigate({ pathname: "/chat/[id]", params: { id: id } });
  };

  const renderItem = ({ item }: { item: User }) => {
    return (
      <Pressable onPress={() => handleSubmit(item.id)}>
        <View style={styles.userContainer}>
          <Image source={item.avatar} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: APP_COLOR.YELLOW,
          flexDirection: "row",
        }}
      >
        <View>
          <Text style={styles.text}>{decodeToken.name}</Text>
          <Text style={styles.text}>{decodeToken.phone}</Text>
          <Text style={styles.text}>{decodeToken.address}</Text>
        </View>
        <Image source={logo} style={styles.img} />
      </View>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 10,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  status: {
    color: "#777",
    fontSize: 14,
  },
  time: {
    color: "#777",
    fontSize: 12,
  },
  text: { color: APP_COLOR.ORANGE, fontSize: 20, fontFamily: FONTS.regular },
  img: {
    height: 100,
    width: 100,
    position: "absolute",
    right: 10,
  },
});

export default ChatList;
