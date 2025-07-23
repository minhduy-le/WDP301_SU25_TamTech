import { useLocalSearchParams, router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

export default function CheckoutWebView() {
  const { url } = useLocalSearchParams();
  if (!url || typeof url !== "string") return null;

  const handleNavigationStateChange = (navState: any) => {
    if (navState.url && navState.url.includes("payment-success")) {
      router.replace("/(auth)/order.success");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: url }}
        startInLoadingState
        onNavigationStateChange={handleNavigationStateChange}
        renderLoading={() => (
          <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B00" />
        )}
      />
    </View>
  );
}
