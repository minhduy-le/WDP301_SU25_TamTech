import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { useCurrentApp } from "@/context/app.context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

interface AddToCartProps {
  product?: {
    productId: string;
    productName: string;
    productPrice: number;
    productImg: any;
  };
}

const AddToCart = ({ product }: AddToCartProps) => {
  const { cart, setCart, counter } = useCurrentApp();
  const [quantity, setQuantity] = useState(0);

  const handleQuantityChange = (action: "MINUS" | "PLUS") => {
    if (!counter?._id || !product) return;

    const total = action === "MINUS" ? -1 : 1;
    const newQuantity = quantity + total;

    if (newQuantity < 0) return;

    setQuantity(newQuantity);
    const priceChange = total * product.productPrice;

    const newCart = { ...cart };
    if (!newCart[counter._id]) {
      newCart[counter._id] = {
        sum: 0,
        quantity: 0,
        items: {},
      };
    }

    newCart[counter._id].sum = (newCart[counter._id].sum || 0) + priceChange;
    newCart[counter._id].quantity =
      (newCart[counter._id].quantity || 0) + total;

    if (!newCart[counter._id].items[product.productId]) {
      newCart[counter._id].items[product.productId] = {
        data: {
          ...product,
          basePrice: product.productPrice,
          title: product.productName,
        },
        quantity: 0,
      };
    }

    const currentQuantity =
      (newCart[counter._id].items[product.productId].quantity || 0) + total;

    if (currentQuantity <= 0) {
      delete newCart[counter._id].items[product.productId];
      if (Object.keys(newCart[counter._id].items).length === 0) {
        delete newCart[counter._id];
      }
    } else {
      newCart[counter._id].items[product.productId] = {
        data: {
          ...product,
          basePrice: product.productPrice,
          title: product.productName,
        },
        quantity: currentQuantity,
      };
    }
    setCart(newCart);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 3,
        paddingHorizontal: 5,
        borderRadius: 50,
        marginBottom: 7,
        borderWidth: 0.5,
        borderColor: APP_COLOR.BROWN,
        marginHorizontal: "auto",
      }}
    >
      <Pressable onPress={() => handleQuantityChange("MINUS")}>
        <AntDesign name="minuscircle" size={24} color={APP_COLOR.BROWN} />
      </Pressable>

      <Text
        style={{
          minWidth: 25,
          textAlign: "center",
          fontFamily: APP_FONT.MEDIUM,
          color: APP_COLOR.BROWN,
        }}
      >
        {quantity}
      </Text>

      <Pressable
        onPress={() => handleQuantityChange("PLUS")}
        style={({ pressed }) => ({
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <AntDesign
          name="pluscircle"
          size={24}
          color={APP_COLOR.BUTTON_YELLOW}
        />
      </Pressable>
    </View>
  );
};

export default AddToCart;
