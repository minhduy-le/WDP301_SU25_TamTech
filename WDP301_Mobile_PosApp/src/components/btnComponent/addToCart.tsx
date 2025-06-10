import { APP_COLOR, APP_FONT } from "@/constants/Colors";
import { currencyFormatter } from "@/constants/Function";
import { useCurrentApp } from "@/context/app.context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";

interface AddToCartProps {
  product?: {
    productId: string;
    productName: string;
    productPrice: number;
    productImg: any;
    productQuantity: number;
  };
}

const AddToCart = ({ product }: AddToCartProps) => {
  const { cart, setCart } = useCurrentApp();
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (product) {
      const defaultCounterId = "default";
      const currentQuantity =
        cart[defaultCounterId]?.items[product.productId]?.quantity || 0;
      setQuantity(currentQuantity);
    }
  }, [product, cart]);

  const handleQuantityChange = (action: "MINUS" | "PLUS") => {
    if (!product) return;

    const total = action === "MINUS" ? -1 : 1;
    const newQuantity = quantity + total;

    if (newQuantity < 0) return;

    setQuantity(newQuantity);
    const priceChange = total * product.productPrice;

    const newCart = { ...cart };
    const defaultCounterId = "default";

    if (!newCart[defaultCounterId]) {
      newCart[defaultCounterId] = {
        sum: 0,
        quantity: 0,
        items: {},
      };
    }

    newCart[defaultCounterId].sum =
      (newCart[defaultCounterId].sum || 0) + priceChange;
    newCart[defaultCounterId].quantity =
      (newCart[defaultCounterId].quantity || 0) + total;

    if (!newCart[defaultCounterId].items[product.productId]) {
      newCart[defaultCounterId].items[product.productId] = {
        data: {
          ...product,
          basePrice: product.productPrice,
          title: product.productName,
        },
        quantity: 0,
      };
    }

    const currentQuantity =
      (newCart[defaultCounterId].items[product.productId].quantity || 0) +
      total;

    if (currentQuantity <= 0) {
      delete newCart[defaultCounterId].items[product.productId];
      if (Object.keys(newCart[defaultCounterId].items).length === 0) {
        delete newCart[defaultCounterId];
      }
    } else {
      newCart[defaultCounterId].items[product.productId] = {
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
  const screenWidth = Dimensions.get("screen").width;
  return (
    <View>
      <Text
        style={{
          color: APP_COLOR.BROWN,
          fontFamily: APP_FONT.SEMIBOLD,
          fontSize: 17,
        }}
      >
        Món chính
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: screenWidth * 0.9,
        }}
      >
        <Text
          style={{
            color: APP_COLOR.BROWN,
            fontFamily: APP_FONT.MEDIUM,
            fontSize: 17,
          }}
        >
          Cơm tấm chả
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Text
            style={{
              fontFamily: APP_FONT.REGULAR,
              color: APP_COLOR.GREY,
              opacity: 0.7,
            }}
          >
            + {currencyFormatter(5000)}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 3,
              paddingHorizontal: 5,
              borderRadius: 50,
              borderWidth: 0.5,
              borderColor: APP_COLOR.BROWN,
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
        </View>
      </View>
    </View>
  );
};

export default AddToCart;
