import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { APP_COLOR } from "@/utils/constant";

interface ScannedDataState {
  type: string;
  data: string;
}

const QRCodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedDataState | null>(null);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const [canOpenUrl, setCanOpenUrl] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission) {
      setHasPermission(permission.granted);
    }
  }, [permission]);
  useEffect(() => {
    if (scannedData?.data) {
      Linking.canOpenURL(scannedData.data)
        .then((supported) => {
          setCanOpenUrl(supported);
        })
        .catch((err) => {
          console.error("Error checking URL:", err);
          setCanOpenUrl(false);
        });
    } else {
      setCanOpenUrl(false);
    }
  }, [scannedData?.data]);

  const askForCameraPermission = async () => {
    const { status } = await requestPermission();
    setHasPermission(status === "granted");
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "You need to grant camera access to scan QR codes. Please go to settings to enable it.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  if (hasPermission === null && !permission?.status) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: APP_COLOR.BACKGROUND_ORANGE || "#FFA500" },
        ]}
      >
        <View style={styles.centeredMessage}>
          <Text style={styles.messageText}>
            Requesting for camera permission...
          </Text>
          <Button
            title={"Grant Permission"}
            onPress={askForCameraPermission}
            color={APP_COLOR.BROWN || "#A52A2A"}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: APP_COLOR.BACKGROUND_ORANGE || "#FFA500" },
        ]}
      >
        <View style={styles.centeredMessage}>
          <Text style={styles.messageText}>
            No access to camera. Please grant permission in settings.
          </Text>
          <Button
            title={"Grant Permission"}
            onPress={askForCameraPermission}
            color={APP_COLOR.BROWN || "#A52A2A"}
          />
        </View>
      </SafeAreaView>
    );
  }
  const handleBarCodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (scanningResult.data && scanningResult.type) {
      const { type, data } = scanningResult;
      setScanned(true);
      setScannedData({ type, data });
      console.log(
        `Bar code with type ${type} and data ${data} has been scanned!`
      );
    } else {
      console.log(
        "Scanned result did not contain data or type:",
        scanningResult
      );
    }
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: APP_COLOR.BACKGROUND_ORANGE || "#FFA500" },
      ]}
    >
      {!scanned ? (
        <CameraView
          style={styles.camera}
          facing={cameraType}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "code128", "pdf417"],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanMarkerContainer}>
              <View style={styles.scanMarker}></View>
            </View>
            <Text style={styles.instructions}>Scan a QR code or barcode</Text>
            <View style={styles.buttonContainer}>
              <Button
                title={`Switch to ${
                  cameraType === "back" ? "Front" : "Back"
                } Camera`}
                onPress={toggleCameraType}
                color={APP_COLOR.BROWN || "#007AFF"}
              />
            </View>
          </View>
        </CameraView>
      ) : (
        <View style={styles.scanResultContainer}>
          <Text style={styles.resultTitle}>Scan Result:</Text>
          <Text style={styles.resultText}>Type: {scannedData?.type}</Text>
          <Text style={styles.resultText}>Data: {scannedData?.data}</Text>
          {scannedData?.data && canOpenUrl && (
            <Button
              title="Open Link"
              onPress={() =>
                scannedData?.data && Linking.openURL(scannedData.data)
              }
              color={APP_COLOR.BROWN || "#A52A2A"}
            />
          )}
          <View style={{ marginTop: 20 }}>
            <Button
              title={"Scan Again"}
              onPress={() => {
                setScanned(false);
                setScannedData(null);
                setCanOpenUrl(false);
              }}
              color={APP_COLOR.BROWN || "#A52A2A"}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: APP_COLOR.WHITE || "#FFFFFF",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  scanMarkerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  scanMarker: {
    width: 250,
    height: 250,
    borderColor: APP_COLOR.WHITE || "white",
    borderWidth: 2,
    borderRadius: 10,
  },
  instructions: {
    fontSize: 16,
    color: APP_COLOR.WHITE || "white",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  scanResultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE || "#FFA500",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: APP_COLOR.WHITE || "#FFFFFF",
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
    color: APP_COLOR.WHITE || "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 10,
  },
});

export default QRCodeScannerScreen;
