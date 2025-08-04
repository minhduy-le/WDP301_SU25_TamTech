import { Stack } from "expo-router";
import { APP_COLOR } from "@/utils/constant";

export default function UserLayout() {
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
        name="product/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="product/create.modal"
        options={{
          headerShown: false,
          animation: "fade",
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen
        name="product/update.modal"
        options={{
          headerShown: false,
          animation: "fade",
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen
        name="product/place.order"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="product/checkout.webview"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="order/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="voucher/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account/info"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account/password"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="like/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="like/feedback.success"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
