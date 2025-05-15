// Popup.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { APP_COLOR } from "@/utils/constant";
import AntDesign from "@expo/vector-icons/AntDesign";
const { width: sWidth } = Dimensions.get("window");

interface PopupProps {
  visible: boolean;
  onClose: () => void;
  item: {
    name: string;
    description: string;
    image: string;
  } | null;
}

const Popup: React.FC<PopupProps> = ({ visible, onClose, item }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {item && (
            <>
              <AntDesign
                name="close"
                size={24}
                color="black"
                style={{ position: "absolute", right: 30, top: 5 }}
                onPress={onClose}
              />
              <Image
                source={{ uri: item.productImage }}
                style={styles.modalImage}
              />
              <Text style={styles.modalText}>{item.productName}</Text>
              <Text style={styles.modalDescription}>
                {item.productDescription}
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: sWidth - 40,
    alignItems: "center",
  },
  modalImage: {
    height: 150,
    width: 150,
    borderRadius: 10,
  },
  modalText: {
    marginTop: 10,
    fontWeight: "600",
    fontSize: 18,
  },
  modalDescription: {
    marginTop: 10,
    color: "#5a5a5a",
    fontSize: 14,
  },
  closeButton: {
    marginTop: 20,
  },
});

export default Popup;
