import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native"
import saleoffImg from '@/assets/saleoff/saleoff.png';
import AntDesign from '@expo/vector-icons/AntDesign';
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";

const PopupSalePage = () => {

    return (
        <Pressable
            style={{
                flex: 1,
            }}>
            <Animated.View
                entering={FadeIn}
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)"
                }}>

                <Animated.View
                    entering={SlideInDown}
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",

                    }}>
                    <View style={{
                        backgroundColor: "white",
                        height: 26,
                        width: 26,
                        borderRadius: 26 / 2,
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                        right: -150
                    }}>
                        <AntDesign
                            onPress={() => router.back()}
                            name="close" size={22} color="grey"
                        />
                    </View>

                    <Image
                        source={saleoffImg}
                        style={{
                            height: 400,
                            width: 350
                        }}
                    />
                    <Pressable
                        style={({ pressed }) => ({
                            backgroundColor: pressed === false ? "#f04054" : "#d85b6a",
                            paddingVertical: 5,
                            paddingHorizontal: 35,
                            borderRadius: 15,
                            position: "relative",
                            top: -25,
                        })}
                    >
                        <Text style={{
                            color: "white",
                            fontWeight: "600"
                        }}>ĐẶT NGAY</Text>
                    </Pressable>

                </Animated.View>
            </Animated.View>
        </Pressable>
    )
}

export default PopupSalePage;
