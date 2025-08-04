import { Stack } from "expo-router";
import { APP_COLOR } from "@/utils/constant";

export default function LikeLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: APP_COLOR.ORANGE,
        headerTitleStyle: {
          color: "black",
          fontFamily: "Montserrat-SemiBold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="like.detail"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
