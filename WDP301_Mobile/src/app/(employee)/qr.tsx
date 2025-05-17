import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import { BarCodeScanner, BarCodeScannerResult } from "expo-barcode-scanner";
import tamtac from "@/assets/logo.png";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import { FONTS, typography } from "@/theme/typography";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-root-toast";
const { width } = Dimensions.get("window");

export default function QRScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanAnimation] = useState(new Animated.Value(0));
  const [scanResult, setScanResult] = useState("");
  const [decodeToken, setDecodeToken] = useState<any>("");
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getBarCodeScannerPermissions();
    const startScanAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnimation, {
            toValue: width,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startScanAnimation();
  }, [scanAnimation]);
  const handleBarCodeScanned = async (scanningResult: BarCodeScannerResult) => {
    setScanned(true);
    setScanResult(scanningResult.data);
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      const decoded = jwtDecode(token);
      const shipperId = decoded.id;
      const confirmStatus = await axios.put(
        `${BASE_URL}/orders/delivered/${scanningResult.data}?shipperId=${shipperId}`
      );

      if (confirmStatus.data.data) {
        Toast.show("Xác nhận đơn hàng thành công", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
      } else {
        Toast.show("Xác nhận đơn hàng không thành công", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: "red",
          opacity: 1,
        });
      }
    } else {
      console.log("No access token found.");
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={typography.bodyMedium}>
          Đang yêu cầu quyền truy cập camera...
        </Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={typography.bodyMedium}>
          Không có quyền truy cập camera
        </Text>
        <Button
          title="Yêu cầu quyền"
          onPress={() => BarCodeScanner.requestPermissionsAsync()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <Image source={tamtac} style={styles.image} />
        <Text style={[typography.h2, styles.title]}>Xác nhận đơn hàng</Text>
      </View>
      {!scanned && (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
          />
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.middleContainer}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.focusedContainer}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />
              </View>
              <View style={styles.unfocusedContainer}></View>
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <Animated.View
            style={[
              styles.scanningLine,
              { transform: [{ translateY: scanAnimation }] },
            ]}
          />
        </View>
      )}

      {scanned && (
        <View style={styles.reScanButtonContainer}>
          <Button
            title="Quét lại"
            onPress={() => {
              setScanned(false);
              setScanResult("");
            }}
            color={APP_COLOR.ORANGE}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    height: 100,
    position: "absolute",
    top: 40,
  },
  image: {
    width: 150,
    height: 150,
  },
  title: {
    marginBottom: 25,
    color: APP_COLOR.ORANGE,
    fontFamily: FONTS.regular,
  },
  scannerContainer: {
    width: width - 40,
    height: width - 40,
    position: "relative",
    overflow: "hidden",
    borderRadius: 50,
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "#EBD187",
    zIndex: 10,
  },
  middleContainer: {
    flexDirection: "row",
    flex: 2,
  },
  focusedContainer: {
    flex: 2,
    position: "relative",
  },
  cornerTopLeft: {
    position: "absolute",
    zIndex: 999,
    top: -10,
    left: -10,
    width: 40,
    height: 40,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: APP_COLOR.ORANGE,
  },
  cornerTopRight: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    zIndex: 999,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: APP_COLOR.ORANGE,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: -10,
    left: -10,
    zIndex: 999,
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: APP_COLOR.ORANGE,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: -10,
    right: -10,
    zIndex: 999,
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: APP_COLOR.ORANGE,
  },
  scanningLine: {
    position: "absolute",
    right: 70,
    width: 207,
    height: 2,
    backgroundColor: "rgba(219, 122, 12, 0.54)",
    top: 70,
    zIndex: 1,
  },
  bottomText: {
    position: "absolute",
    bottom: 90,
  },
  reScanButtonContainer: {
    position: "absolute",
    bottom: 30,
    width: "90%",
    paddingHorizontal: 20,
    zIndex: 100,
  },
});
