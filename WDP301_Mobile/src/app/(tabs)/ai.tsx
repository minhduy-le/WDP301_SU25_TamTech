import { useCurrentApp } from "@/context/app.context";
import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { Image, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import logo from "@/assets/logo.png";
const chatbotUrl = "https://udify.app/chatbot/W5v0fU363xTJIw5f";
const AIPage = () => {
  const { appState } = useCurrentApp();
  return (
    <View style={styles.container}>
      <Image
        source={logo}
        style={{
          width: 150,
          height: 100,
          alignSelf: "center",
        }}
      />
      <Text style={styles.text}>Có thắc mắc? Tấm Tắc xin nghe.</Text>
      {appState ? (
        <WebView
          source={{ uri: chatbotUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      ) : (
        <View>
          <Text
            style={{
              color: APP_COLOR.BROWN,
              fontFamily: FONTS.regular,
              alignSelf: "center",
            }}
          >
            Vui lòng đăng nhập để sử dụng tính năng này.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  webview: {
    flex: 1,
    position: "relative",
    bottom: -20,
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: APP_COLOR.BROWN,
    alignSelf: "center",
  },
});

export default AIPage;
