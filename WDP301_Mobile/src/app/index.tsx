import { Redirect, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useCurrentApp } from "@/context/app.context";
import * as SplashScreen from "expo-splash-screen";
import { BASE_URL } from "@/utils/constant";
import axios from "axios";
SplashScreen.preventAutoHideAsync();

const RootPage = () => {
  const { setAppState } = useCurrentApp();
  const [state, setState] = useState<any>();
  useEffect(() => {
    async function prepare() {
      try {
        const refresh_token = await AsyncStorage.getItem("refresh_token");
        const res = await axios.post(
          `${BASE_URL}/token/refresh?token=${refresh_token}`
        );
        if (res.data) {
          await AsyncStorage.setItem("access_token", res.data.access_token);
          setAppState({
            access_token: await AsyncStorage.getItem("access_token"),
          });
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/welcome");
        }
      } catch (e) {
        setState(() => {
          throw new Error("Không thể kết tới API Backend...");
        });
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);
  if (true) {
    return <Redirect href={"/(auth)/welcome"} />;
  }
  return <></>;
};

export default RootPage;
