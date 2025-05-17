import React, { useEffect, useState } from "react";
import { Text, View, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { APP_COLOR, BASE_URL } from "@/utils/constant";
import EmployeeHeader from "@/components/employee/topheader.employee";
import { FONTS } from "@/theme/typography";
import { string } from "yup";

const OrderPage = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [decodeToken, setDecodeToken] = useState<any>("");
  const [shipAddress, setShipAddress] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [mark, setMark] = useState<{ lat: number; lng: number }>();
  const [shipperInfo, setShipperInfo] = useState<{
    name: string;
    id: number;
    phone: number;
  } | null>(null);
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setDecodeToken(decoded.id);
          setShipperInfo(decoded);
          const shipAddressResponse = await axios.get(
            `${BASE_URL}/orders/shipper/${decodeToken}?page=0&size=10&statusId=2`
          );
          const shipAddress = shipAddressResponse.data.data.content[0].address;
          setShipAddress(shipAddress);
          const directionResponse = await axios.get(
            `https://maps.gomaps.pro/maps/api/directions/json?destination=${shipAddress}&mode=driving&origin=${address}&key=AlzaSyNOiNuM9dYaAZxahUvMvBOIjx4xyOSi3yr`
          );
          const directionsData = directionResponse.data.routes[0].legs[0].steps;
          const coordinates = directionsData.map((step: any) => ({
            latitude: step.end_location.lat,
            longitude: step.end_location.lng,
          }));
          setRouteCoordinates(coordinates);
          const shippingMark = await axios.get(
            `https://maps.gomaps.pro/maps/api/geocode/json?address=${shipAddress}&language=vi&region=vn&key=AlzaSyNOiNuM9dYaAZxahUvMvBOIjx4xyOSi3yr`
          );
          setMark(shippingMark.data.results[0].geometry.location);
        } else {
          console.log("No access token found.");
        }
      } catch (error) {
        console.error("Error retrieving access token:", error);
      }
    };
    getAccessToken();
  }, [decodeToken, address]);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      if (loc.coords) {
        getAddressFromCoords(loc.coords.latitude, loc.coords.longitude);
      }
      setIsLoading(false);
    };
    getLocation();
  }, []);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location?.coords) {
    text = JSON.stringify(location);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            Đang tải vị trí...
          </Text>
        ) : (
          <View style={{ flex: 1 }}>
            {shipperInfo ? (
              <EmployeeHeader
                employeeAddress={address}
                employeeName={shipperInfo.name}
                employeeCode={shipperInfo.id}
                employeePhone={shipperInfo.phone}
              />
            ) : null}
            <MapView
              style={{ flex: 1 }}
              region={{
                latitude: location?.coords.latitude ?? 0,
                longitude: location?.coords.longitude ?? 0,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location?.coords.latitude ?? 0,
                  longitude: location?.coords.longitude ?? 0,
                }}
                title="Vị trí của bạn"
                description={address}
              />
              {mark ? (
                <Marker
                  coordinate={{
                    latitude: mark?.lat ?? 0,
                    longitude: mark?.lng ?? 0,
                  }}
                  title="Vị trí giao hàng"
                  description={shipAddress}
                />
              ) : null}
              {routeCoordinates.length > 0 && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor={APP_COLOR.ORANGE}
                  strokeWidth={4}
                />
              )}
            </MapView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: "center",
  },
});

export default OrderPage;
