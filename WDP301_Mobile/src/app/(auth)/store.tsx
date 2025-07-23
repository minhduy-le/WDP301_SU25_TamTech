import storeImg from "@/assets/cua-hang.jpg";
import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { Dimensions, Image, Text, View } from "react-native";
import { useState, useEffect } from "react";

const StorePage = () => {
  const screenWidth = Dimensions.get("screen").width;
  const screenHeight = Dimensions.get("screen").height;
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "Tụi mình là Tấm Tắc";
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 1000;

  useEffect(() => {
    let currentIndex = isTyping ? displayText.length : displayText.length - 1;
    let interval;

    if (isTyping) {
      interval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setTimeout(() => {
            setIsTyping(false);
          }, pauseTime);
        }
      }, typingSpeed);
    } else {
      interval = setInterval(() => {
        if (currentIndex >= 0) {
          setDisplayText(fullText.slice(0, currentIndex));
          currentIndex--;
        } else {
          setTimeout(() => {
            setIsTyping(true);
          }, pauseTime);
        }
      }, deletingSpeed);
    }
    return () => clearInterval(interval);
  }, [isTyping, displayText]);

  return (
    <View style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}>
      <View
        style={{
          width: screenWidth,
          height: 70,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 10,
        }}
      >
        <Text
          style={{
            color: APP_COLOR.BROWN,
            fontFamily: FONTS.medium,
            fontSize: 25,
          }}
        >
          Xin chào!
        </Text>
        <Text
          style={{
            color: APP_COLOR.BROWN,
            fontFamily: FONTS.bold,
            fontSize: 25,
          }}
        >
          {displayText.split("Tấm Tắc")[0]}
          {displayText.includes("Tấm Tắc") && (
            <Text style={{ color: APP_COLOR.ORANGE }}>Tấm Tắc</Text>
          )}
        </Text>
      </View>
      <Image
        source={storeImg}
        style={{
          resizeMode: "cover",
          width: screenWidth,
          height: screenHeight * 0.87,
        }}
      />
    </View>
  );
};

export default StorePage;
