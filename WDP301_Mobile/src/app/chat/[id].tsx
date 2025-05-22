import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, FlatList, StyleSheet, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
}

const ChatPage = () => {
  const { id } = useLocalSearchParams();
  const messages: Message[] = [
    { id: "1", text: "Chào bạn!", sender: "user" },
    { id: "2", text: "Chào bạn, bạn khỏe không?", sender: "other" },
    { id: "3", text: "Mình khỏe, cảm ơn!", sender: "user" },
    { id: "4", text: "Tốt quá, có gì vui không?", sender: "other" },
    { id: "5", text: "Mình đang học React Native!", sender: "user" },
    { id: "6", text: "Chào bạn!", sender: "user" },
    { id: "7", text: "Chào bạn, bạn khỏe không?", sender: "other" },
    { id: "8", text: "Mình khỏe, cảm ơn!", sender: "user" },
    { id: "9", text: "Tốt quá, có gì vui không?", sender: "other" },
    { id: "10", text: "Mình đang học React Native!", sender: "user" },
    { id: "11", text: "Chào bạn!", sender: "user" },
    { id: "12", text: "Chào bạn, bạn khỏe không?", sender: "other" },
    { id: "13", text: "Mình khỏe, cảm ơn!", sender: "user" },
    { id: "14", text: "Tốt quá, có gì vui không?", sender: "other" },
    { id: "15", text: "Mình đang học React Native!", sender: "user" },
  ];
  const handleChat = (text: string) => {
    console.log(text);
  };
  const renderItem = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View>
      <View style={styles.message}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.chatContainer}
        />
      </View>
      <View style={styles.messageView}>
        <TextInput
          placeholder="Nhập tin nhắn..."
          onChangeText={(text: string) => handleChat(text)}
          placeholderTextColor={APP_COLOR.BROWN}
          style={styles.inputContainer}
        />
        <Ionicons
          name="send"
          size={30}
          color={APP_COLOR.BROWN}
          style={{ position: "absolute", bottom: 60, right: 20 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    paddingBottom: 100,
  },
  chatContainer: {
    padding: 10,
    paddingBottom: 70,
    marginBottom: 30,
  },
  messageContainer: {
    maxWidth: "90%",
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: APP_COLOR.BROWN,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(81, 80, 80, 0.7)",
  },
  messageText: {
    color: APP_COLOR.WHITE,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  messageView: {
    flexDirection: "row",
  },
  inputContainer: {
    position: "absolute",
    bottom: 50,
    left: 10,
    right: 10,
    backgroundColor: APP_COLOR.WHITE,
    padding: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: FONTS.regular,
    width: "80%",
  },
});

export default ChatPage;
