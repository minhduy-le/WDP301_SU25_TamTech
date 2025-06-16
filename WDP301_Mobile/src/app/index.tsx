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
        router.replace("/(tabs)");
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
