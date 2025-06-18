import * as React from "react";
import { useCallback } from "react";
import { Dimensions, Image, Platform, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";

import bn1 from "@/assets/banner/bn1.png";
import bn2 from "@/assets/banner/bn2.png";
import bn3 from "@/assets/banner/bn3.jpg";

function BannerHome() {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const width = Dimensions.get("window").width;
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (ref.current) {
        const currentIndex = ref.current.getCurrentIndex();
        const nextIndex = (currentIndex + 1) % sliders.length;
        ref.current.scrollTo({ index: nextIndex, animated: true });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const onPressPagination = useCallback((index: number) => {
    if (ref.current) {
      ref.current.scrollTo({
        index: index,
        animated: true,
      });
    }
  }, []);

  const sliders = [
    { id: 1, source: bn1 },
    { id: 2, source: bn2 },
    { id: 3, source: bn3 },
  ];

  return (
    <View>
      <Carousel
        style={{ marginTop: Platform.OS === "android" ? 100 : 0 }}
        ref={ref}
        width={width}
        height={width / 2.5}
        data={sliders}
        onProgressChange={progress}
        renderItem={({ item, index }) => (
          <Image
            style={{
              width: width,
              height: width / 2.5,
              resizeMode: "cover",
              justifyContent: "flex-end",
            }}
            source={item.source}
          />
        )}
      />

      <Pagination.Basic
        progress={progress}
        data={sliders}
        dotStyle={{
          height: 5,
          width: 5,
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: 50,
        }}
        containerStyle={{ gap: 5, marginTop: 10 }}
        onPress={onPressPagination}
      />
    </View>
  );
}

export default BannerHome;
