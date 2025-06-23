import VoucherComponent from "@/components/account/user.voucher";
import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
const Voucher = () => {
  const sampleData = [
    {
      id: 1,
      code: "SUMMER25",
      description: "Giảm giá 25%",
      date: "01/06/2023",
    },
    {
      id: 2,
      code: "WINTER15",
      description: "Giảm giá 15%",
      date: "05/06/2023",
    },
    {
      id: 3,
      code: "SPRING10",
      description: "Giảm giá 10%",
      date: "10/06/2023",
    },
  ];
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 10,
        }}
      >
        <Pressable
          onPress={() => router.navigate("/(tabs)")}
          style={{ flex: 0.5 }}
        >
          <AntDesign name="arrowleft" size={24} color={APP_COLOR.BROWN} />
        </Pressable>
        <Text style={styles.text}>Mã ưu đãi của tôi</Text>
      </View>
      <FlatList
        data={sampleData}
        renderItem={({ item }) => (
          <VoucherComponent
            code={item.code}
            description={item.description}
            date={item.date}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  text: {
    alignSelf: "center",
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: APP_COLOR.BROWN,
    marginVertical: 20,
  },
});
export default Voucher;
