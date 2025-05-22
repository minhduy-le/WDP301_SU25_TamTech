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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <View style={styles.container}>
        <View
          style={{
            paddingHorizontal: 20,
            backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
            flexDirection: "row",
          }}
        >
          <View>
            <Text style={[styles.text, { fontFamily: FONTS.bold }]}>
              0828 024 246
            </Text>
            <Text style={styles.text}>
              Nhà Văn hóa Sinh viên, Đông Hòa, Dĩ An, Bình Dương
            </Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
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
  text: {
    color: APP_COLOR.BROWN,
    fontSize: 17,
    fontFamily: FONTS.regular,
    width: 200,
  },
  img: {
    height: 100,
    width: 145,
    position: "relative",
    top: -20,
    left: 10,
  },
});

export default ChatList;
