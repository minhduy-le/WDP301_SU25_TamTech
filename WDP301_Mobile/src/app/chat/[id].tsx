import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, FlatList, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={styles.container}>
      <View style={styles.message}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.chatContainer}
        />
      </View>
      <View>
        <TextInput
          placeholder="Nhập tin nhắn..."
          onChangeText={(text: string) => handleChat(text)}
          style={styles.inputContainer}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  message: {
    marginBottom: 40,
  },
  chatContainer: {
    padding: 10,
    paddingBottom: 80,
    marginBottom: 30,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0078ff",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e1e1e1",
  },
  messageText: {
    color: "white",
    fontSize: 16,
  },
  inputContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default ChatPage;
