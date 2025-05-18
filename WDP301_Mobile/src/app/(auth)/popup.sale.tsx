import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import bannerImg from "@/assets/saleoff/banner.png";
import AntDesign from "@expo/vector-icons/AntDesign";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { APP_COLOR } from "@/utils/constant";

const PopupSalePage = () => {
  return (
    <Pressable
      style={{
        flex: 1,
      }}
    >
      <Animated.View
        entering={FadeIn}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <Animated.View
          entering={SlideInDown}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
              height: 26,
              width: 26,
              borderRadius: 26 / 2,
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              right: -120,
              top: 35,
              zIndex: 9999,
            }}
          >
            <AntDesign
              onPress={() => router.back()}
              name="close"
              size={25}
              color={APP_COLOR.BROWN}
            />
          </View>

          <Image
            source={bannerImg}
            style={{
              height: 700,
              width: 300,
              borderRadius: 30,
            }}
          />
          <Pressable
            style={({ pressed }) => ({
              backgroundColor:
                pressed === false ? APP_COLOR.BROWN : APP_COLOR.ORANGE,
              paddingVertical: 10,
              paddingHorizontal: 50,
              borderRadius: 15,
              position: "relative",
              top: -25,
            })}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "600",
              }}
            >
              ĐẶT NGAY
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default PopupSalePage;
