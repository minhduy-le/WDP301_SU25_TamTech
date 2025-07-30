/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Layout,
  Row,
  Col,
  Input,
  Select,
  Radio,
  Button,
  Card,
  Typography,
  Space,
  Checkbox,
  Divider,
  message,
  Spin,
  Modal,
} from "antd";
import "../style/Checkout.css";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useDistricts, useWardByDistrictId } from "../hooks/locationsApi";
import { useCalculateShipping, useCreateOrder } from "../hooks/ordersApi";
import { useAuthStore } from "../hooks/usersApi";
import { useGetProfileUser } from "../hooks/profileApi";
import { useCartStore } from "../store/cart.store";
import {
  useGetPromotionByCode,
  useGetPromotionUser,
  type Promotion,
} from "../hooks/promotionApi";
import { StandaloneSearchBox, useJsApiLoader } from "@react-google-maps/api";

const { Option } = Select;
const { Title, Text } = Typography;

interface AddOn {
  productId: number;
  productTypeName: string;
  quantity: number;
  price: number;
}

interface CartItem {
  userId: string;
  productId: number;
  productName: string;
  addOns: AddOn[];
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

const Checkout = () => {
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("now");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );
  const [detailedAddress, setDetailedAddress] = useState("");
  const [isDatHo, setIsDatHo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<number>(4);
  const [note, setNote] = useState("");
  const [detailedAddressProxy, setDetailedAddressProxy] = useState("");
  const [nguoiDatHo, setNguoiDatHo] = useState("");
  const [sdtNguoiDatHo, setSdtNguoiDatHo] = useState("");
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const { cartItems, updateCartItems } = useCartStore();
  const { user } = useAuthStore();
  const userId = user?.id;
  const inputrefUser = useRef<google.maps.places.SearchBox | null>(null);
  const inputrefProxy = useRef<google.maps.places.SearchBox | null>(null);
  const [isAddressFromPlacesUser, setIsAddressFromPlacesUser] = useState(false);
  const [isAddressFromPlacesProxy, setIsAddressFromPlacesProxy] =
    useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUserPromo, setSelectedUserPromo] = useState<Promotion | null>(
    null
  );
  const [manualPromoCode, setManualPromoCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: userPromotions, isLoading } = useGetPromotionUser(userId ?? 0);
  const { data: userProfile } = useGetProfileUser(userId || 0);

  const {
    data: districts = [],
    isLoading: isDistrictsLoading,
    isError: isDistrictsError,
  } = useDistricts();
  const {
    data: wards = [],
    isLoading: isWardsLoading,
    isError: isWardsError,
  } = useWardByDistrictId(selectedDistrictId);

  const {
    data: promotion,
    refetch: refetchPromotion,
    isError: isPromotionError,
  } = useGetPromotionByCode(manualPromoCode);
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(
    null
  );

  const location = useLocation();
  const { selectedItems: initialSelectedItems = [] } = (location.state ||
    {}) as {
    selectedItems: CartItem[];
  };

  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAwSwTDdF00hbh21k7LsX-4Htuwqm9MlPg",
    libraries: ["places"],
  });

  const tphcmBounds = {
    north: 10.8657, // Vĩ độ bắc
    south: 10.6958, // Vĩ độ nam
    east: 106.8393, // Kinh độ đông
    west: 106.584, // Kinh độ tây
  };

  const isWithinTPHCMBounds = (lat: number, lng: number) => {
    return (
      lat >= tphcmBounds.south &&
      lat <= tphcmBounds.north &&
      lng >= tphcmBounds.west &&
      lng <= tphcmBounds.east
    );
  };

  const handleOnPlacesChangedUser = () => {
    if (inputrefUser.current && isLoaded) {
      const places = inputrefUser.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          if (!isWithinTPHCMBounds(lat, lng)) {
            message.error("Vui lòng chọn địa chỉ trong Thành phố Hồ Chí Minh.");
            return;
          }
          if (place.formatted_address) {
            let cleanedAddress = place.formatted_address;
            cleanedAddress = cleanedAddress.replace(/, Vietnam$/i, "").trim();
            const hoChiMinhIndex = cleanedAddress.indexOf("Hồ Chí Minh");
            if (hoChiMinhIndex !== -1) {
              cleanedAddress = cleanedAddress
                .substring(0, hoChiMinhIndex + "Hồ Chí Minh".length)
                .trim();
            }
            setDetailedAddress(cleanedAddress);
            setIsAddressFromPlacesUser(true);
            const deliverAddress = cleanedAddress.trim();
            calculateShipping(
              { deliver_address: deliverAddress },
              {
                onSuccess: (data: any) => {
                  setDeliveryFee(data.fee || 0);
                  message.success("Phí giao hàng đã được cập nhật.");
                },
                onError: (error: any) => {
                  if (
                    error.response.data?.message ===
                    "Delivery address must be in the format: street name, ward, district, city"
                  ) {
                    message.error(
                      "Địa chỉ giao hàng phải được nhập theo định dạng : số nhà tên đường, phường, quận, thành phố"
                    );
                  } else {
                    message.error(error.response.data?.message);
                  }
                  setDeliveryFee(22000);
                },
              }
            );
          } else {
            message.error("Không thể lấy địa chỉ từ Google Maps.");
          }
        } else {
          message.error("Không thể xác định tọa độ của địa chỉ.");
        }
      } else {
        message.error("Không tìm thấy địa chỉ nào.");
      }
    } else {
      message.error(
        "Google Maps API chưa được tải. Vui lòng kiểm tra khóa API."
      );
    }
  };

  const handleOnPlacesChangedProxy = () => {
    if (inputrefProxy.current && isLoaded) {
      const places = inputrefProxy.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          if (!isWithinTPHCMBounds(lat, lng)) {
            message.error("Vui lòng chọn địa chỉ trong Thành phố Hồ Chí Minh.");
            return;
          }
          if (place.formatted_address) {
            let cleanedAddress = place.formatted_address;
            cleanedAddress = cleanedAddress.replace(/, Vietnam$/i, "").trim();
            const hoChiMinhIndex = cleanedAddress.indexOf("Hồ Chí Minh");
            if (hoChiMinhIndex !== -1) {
              cleanedAddress = cleanedAddress
                .substring(0, hoChiMinhIndex + "Hồ Chí Minh".length)
                .trim();
            }
            setDetailedAddressProxy(cleanedAddress);
            setIsAddressFromPlacesProxy(true);
            const deliverAddress = cleanedAddress.trim();
            if (selectedDistrictId && selectedWard) {
              const selectedDistrict = districts.find(
                (district) => district.districtId === selectedDistrictId
              );
              calculateShipping(
                {
                  deliver_address:
                    `${deliverAddress}, ${selectedWard}, ${selectedDistrict?.name}, TPHCM`.trim(),
                },
                {
                  onSuccess: (data: any) => {
                    setDeliveryFee(data.fee || 0);
                    message.success("Phí giao hàng đã được cập nhật.");
                  },
                  onError: (error: any) => {
                    if (
                      error.response.data?.message ===
                      "Delivery address must be in the format: street name, ward, district, city"
                    ) {
                      message.error(
                        "Địa chỉ giao hàng phải được nhập theo định dạng : số nhà tên đường, phường, quận, thành phố"
                      );
                    } else {
                      message.error(error.response.data?.message);
                    }
                    setDeliveryFee(22000);
                  },
                }
              );
            } else {
              calculateShipping(
                { deliver_address: deliverAddress },
                {
                  onSuccess: (data: any) => {
                    setDeliveryFee(data.fee || 0);
                    message.success("Phí giao hàng đã được cập nhật.");
                  },
                  onError: (error: any) => {
                    if (
                      error.response.data?.message ===
                      "Delivery address must be in the format: street name, ward, district, city"
                    ) {
                      message.error(
                        "Địa chỉ giao hàng phải được nhập theo định dạng : số nhà tên đường, phường, quận, thành phố"
                      );
                    } else {
                      message.error(error.response.data?.message);
                    }
                    setDeliveryFee(22000);
                  },
                }
              );
            }
          } else {
            message.error("Không thể lấy địa chỉ từ Google Maps.");
          }
        } else {
          message.error("Không thể xác định tọa độ của địa chỉ.");
        }
      } else {
        message.error("Không tìm thấy địa chỉ nào.");
      }
    } else {
      message.error(
        "Google Maps API chưa được tải. Vui lòng kiểm tra khóa API."
      );
    }
  };

  const handleAddressBlurUser = () => {
    if (detailedAddress.trim() && !isAddressFromPlacesUser) {
      let deliverAddress = detailedAddress.trim();
      const hoChiMinhIndex = deliverAddress.indexOf("Hồ Chí Minh");
      if (hoChiMinhIndex !== -1) {
        deliverAddress = deliverAddress
          .substring(0, hoChiMinhIndex + "Hồ Chí Minh".length)
          .trim();
      }
      calculateShipping(
        { deliver_address: deliverAddress },
        {
          onSuccess: (data: any) => {
            setDeliveryFee(data.fee || 0);
            message.success("Phí giao hàng đã được cập nhật.");
          },
          // onError: (error: any) => {
          //   if (
          //     error.response.data?.message ===
          //     "Delivery address must be in the format: street name, ward, district, city"
          //   ) {
          //     message.error(
          //       "Địa chỉ giao hàng phải được nhập theo định dạng : số nhà tên đường, phường, quận, thành phố"
          //     );
          //   } else {
          //     message.error(error.response.data?.message);
          //   }
          //   setDeliveryFee(22000);
          // },
        }
      );
    }
  };

  const handleAddressBlurProxy = () => {
    if (detailedAddressProxy.trim() && !isAddressFromPlacesProxy) {
      let deliverAddress = detailedAddressProxy.trim();
      const hoChiMinhIndex = deliverAddress.indexOf("Hồ Chí Minh");
      if (hoChiMinhIndex !== -1) {
        deliverAddress = deliverAddress
          .substring(0, hoChiMinhIndex + "Hồ Chí Minh".length)
          .trim();
      }
      if (selectedDistrictId && selectedWard) {
        const selectedDistrict = districts.find(
          (district) => district.districtId === selectedDistrictId
        );
        calculateShipping(
          {
            deliver_address:
              `${deliverAddress}, ${selectedWard}, ${selectedDistrict?.name}, TPHCM`.trim(),
          },
          {
            onSuccess: (data: any) => {
              setDeliveryFee(data.fee || 0);
              message.success("Phí giao hàng đã được cập nhật.");
            },
            // onError: (error: any) => {
            //   if (
            //     error.response.data?.message ===
            //     "Delivery address must be in the format: street name, ward, district, city"
            //   ) {
            //     message.error(
            //       "Địa chỉ giao hàng phải được nhập theo định dạng : số nhà tên đường, phường, quận, thành phố"
            //     );
            //   } else {
            //     message.error(error.response.data?.message);
            //   }
            //   setDeliveryFee(22000);
            // },
          }
        );
      } else {
        calculateShipping(
          { deliver_address: deliverAddress },
          {
            onSuccess: (data: any) => {
              setDeliveryFee(data.fee || 0);
              message.success("Phí giao hàng đã được cập nhật.");
            },
            // onError: (error: any) => {
            //   if (
            //     error.response.data?.message ===
            //     "Delivery address must be in the format: street name, ward, district, city"
            //   ) {
            //     message.error(
            //       "Địa chỉ giao hàng phải được nhập theo định dạng : số nhà tên đường, phường, quận, thành phố"
            //     );
            //   } else {
            //     message.error(error.response.data?.message);
            //   }
            //   setDeliveryFee(22000);
            // },
          }
        );
      }
    }
  };

  useEffect(() => {
    setSelectedItems(initialSelectedItems);
  }, [initialSelectedItems]);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const discountOnItems = 0;
  const promoDiscount = appliedPromotion ? appliedPromotion.discountAmount : 0;
  const [deliveryFee, setDeliveryFee] = useState(0);
  const total = subtotal - discountOnItems - promoDiscount + deliveryFee;

  const handleDistrictChange = (value: number) => {
    setSelectedDistrictId(value);
    setSelectedWard(null);
  };

  const handleWardChange = (value: string) => {
    setSelectedWard(value);
  };

  const { mutate: calculateShipping } = useCalculateShipping();
  const { mutate: createOrder } = useCreateOrder();

  const handleApplyPromotion = () => {
    if (!manualPromoCode) {
      setErrorMessage("Vui lòng nhập mã khuyến mãi.");
      return;
    }
    setErrorMessage(null);
    refetchPromotion().then(() => {
      if (isPromotionError) {
        setErrorMessage("Mã giảm giá không hợp lệ.");
        return;
      }
      if (promotion) {
        if (subtotal >= promotion.minOrderAmount) {
          message.success("Mã giảm giá hợp lệ.");
          setAppliedPromotion(promotion);
          setErrorMessage(null);
          setIsModalVisible(false);
        } else {
          setErrorMessage(
            `Mã giảm giá không hợp lệ. Tổng đơn hàng phải tối thiểu ${promotion.minOrderAmount.toLocaleString()}đ.`
          );
        }
      }
    });
  };

  const handleApplyUserPromotion = () => {
    if (selectedUserPromo) {
      if (subtotal >= selectedUserPromo.minOrderAmount) {
        message.success("Khuyến mãi từ tài khoản đã được áp dụng.");
        setAppliedPromotion(selectedUserPromo);
        // Bỏ chọn checkbox và hủy áp dụng khuyến mãi
        setSelectedUserPromo(null);
        setIsModalVisible(false);
      } else {
        message.error(
          `Khuyến mãi không hợp lệ. Tổng đơn hàng phải tối thiểu ${selectedUserPromo.minOrderAmount.toLocaleString()}đ.`
        );
      }
    } else {
      // Nếu không có khuyến mãi nào được chọn, hủy áp dụng khuyến mãi hiện tại
      setAppliedPromotion(null);
      setIsModalVisible(false);
      message.info("Đã hủy áp dụng khuyến mãi.");
    }
  };

  const handleOrderSubmit = () => {
    const orderItems: OrderItem[] = [];

    selectedItems.forEach((item) => {
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });

      if (item.addOns && item.addOns.length > 0) {
        item.addOns.forEach((addOn) => {
          if (addOn.quantity > 0) {
            orderItems.push({
              productId: addOn.productId,
              quantity: addOn.quantity,
              price: addOn.price,
            });
          }
        });
      }
    });

    const paymentMethodId = paymentMethod ?? 0;

    const selectedDistrict = districts.find(
      (district) => district.districtId === selectedDistrictId
    );

    let orderAddress = detailedAddress.trim();
    if (isDatHo && detailedAddressProxy) {
      orderAddress =
        `${detailedAddressProxy}, ${selectedWard}, ${selectedDistrict?.name}, TPHCM`.trim();
    }

    const orderData = {
      orderItems,
      order_discount_value: appliedPromotion
        ? appliedPromotion.discountAmount
        : 0,
      order_shipping_fee: deliveryFee,
      payment_method_id: paymentMethodId,
      order_address: orderAddress,
      platform: "Web",
      note: note || "",
      promotion_code: appliedPromotion
        ? appliedPromotion.code || manualPromoCode
        : "",
      ...(isDatHo && {
        isDatHo: true,
        tenNguoiDatHo: nguoiDatHo,
        soDienThoaiNguoiDatHo: sdtNguoiDatHo,
      }),
    };

    setIsLoadingButton(true);

    createOrder(orderData, {
      onSuccess: (data: any) => {
        message.success("Đặt hàng thành công!");
        window.location.href = data.checkoutUrl;
        const updatedCartItems = cartItems.filter((cartItem) => {
          return !selectedItems.some(
            (selectedItem) => selectedItem.productId === cartItem.productId
          );
        });
        updateCartItems(updatedCartItems);
        setIsLoadingButton(false);
      },
      onError: (error) => {
        const errorMessage = error.response.data;
        if (errorMessage === "Order address is required") {
          message.error("Địa chỉ chi tiết chưa được nhập");
        } else if (
          errorMessage === "Valid payment method ID is required (1-4)"
        ) {
          message.error("Vui lòng chọn phương thức thanh toán");
        } else if (
          errorMessage ===
          "Order can only be placed during store operating hours"
        ) {
          message.error(
            "Đơn hàng chỉ có thể được đặt trong giờ hoạt động của cửa hàng"
          );
        } else {
          message.error(errorMessage);
        }
        setIsLoadingButton(false);
      },
    });
  };

  const handleIncrement = (productId: number) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && item.quantity < 10) {
          const newQuantity = item.quantity + 1;
          const addOnTotalPrice = item.addOns.reduce(
            (sum, addOn) => sum + addOn.price * addOn.quantity,
            0
          );
          const newTotalPrice = item.price * newQuantity + addOnTotalPrice;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: newTotalPrice,
          };
        }
        return item;
      })
    );
  };

  const handleDecrement = (productId: number) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && item.quantity > 1) {
          const newQuantity = item.quantity - 1;
          const addOnTotalPrice = item.addOns.reduce(
            (sum, addOn) => sum + addOn.price * addOn.quantity,
            0
          );
          const newTotalPrice = item.price * newQuantity + addOnTotalPrice;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: newTotalPrice,
          };
        }
        return item;
      })
    );
  };

  return (
    <Layout className="layout">
      <div className="header">
        <Title level={3} className="checkout-title">
          Xác nhận đơn hàng
        </Title>
      </div>
      <Row gutter={16}>
        <Col span={12}>
          <Card className="section-card" style={{ marginBottom: 0 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title
                level={3}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Thông tin khách hàng
              </Title>
              <Input
                placeholder="Tên khách hàng"
                style={{
                  background: "transparent",
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#da7339",
                }}
                value={userProfile?.user.fullName}
                disabled
              />
              <Input
                placeholder="Số điện thoại"
                style={{
                  background: "transparent",
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#da7339",
                }}
                value={userProfile?.user.phone_number}
                disabled
              />
              <Input
                placeholder="Email"
                style={{
                  background: "transparent",
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#da7339",
                }}
                value={userProfile?.user.email}
                disabled
              />
              {!isDatHo && (
                <>
                  {isLoaded ? (
                    <StandaloneSearchBox
                      onLoad={(ref) => (inputrefUser.current = ref)}
                      onPlacesChanged={handleOnPlacesChangedUser}
                      options={{
                        bounds: tphcmBounds,
                      }}
                    >
                      <Input
                        placeholder="Địa chỉ chi tiết"
                        style={{
                          background: "transparent",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                        value={detailedAddress}
                        onChange={(e) => {
                          setDetailedAddress(e.target.value);
                          setIsAddressFromPlacesUser(false);
                        }}
                        onBlur={handleAddressBlurUser}
                      />
                    </StandaloneSearchBox>
                  ) : (
                    <Input
                      placeholder="Địa chỉ chi tiết (Đang tải Google Maps...)"
                      style={{
                        background: "transparent",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                      value={detailedAddress}
                      onChange={(e) => {
                        setDetailedAddress(e.target.value);
                        setIsAddressFromPlacesUser(false);
                      }}
                      disabled
                    />
                  )}
                </>
              )}
              <Row>
                <Title
                  level={3}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Thông tin giao hàng
                </Title>
                <div className="checkbox-label">
                  <Checkbox
                    checked={isDatHo}
                    onChange={(e) => setIsDatHo(e.target.checked)}
                  />
                  <Text style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Đặt hộ
                  </Text>
                </div>
              </Row>
              {isDatHo && (
                <>
                  <Input
                    placeholder="Tên người nhận"
                    style={{
                      background: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                    value={nguoiDatHo}
                    onChange={(e) => setNguoiDatHo(e.target.value)}
                  />
                  <Input
                    placeholder="Số điện thoại người nhận"
                    style={{
                      background: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                    value={sdtNguoiDatHo}
                    onChange={(e) => setSdtNguoiDatHo(e.target.value)}
                  />
                  <Row style={{ justifyContent: "space-between" }}>
                    <Col span={11}>
                      <Select
                        defaultValue={null}
                        style={{
                          width: "100%",
                          background: "transparent",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                        placeholder="Quận huyện"
                        loading={isDistrictsLoading}
                        disabled={isDistrictsError}
                        onChange={handleDistrictChange}
                        value={selectedDistrictId || undefined}
                      >
                        {districts.map((district) => (
                          <Option
                            key={district.districtId}
                            value={district.districtId}
                          >
                            {district.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={11}>
                      <Select
                        value={selectedWard}
                        onChange={handleWardChange}
                        placeholder="Phường xã"
                        style={{
                          width: "100%",
                          background: "transparent",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                        loading={isWardsLoading}
                        disabled={isWardsError || !selectedDistrictId}
                      >
                        {wards.map((ward, index) => (
                          <Option key={index} value={ward.name}>
                            {ward.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                  {isLoaded ? (
                    <StandaloneSearchBox
                      onLoad={(ref) => (inputrefProxy.current = ref)}
                      onPlacesChanged={handleOnPlacesChangedProxy}
                      options={{
                        bounds: tphcmBounds,
                      }}
                    >
                      <Input
                        placeholder="Địa chỉ chi tiết"
                        style={{
                          background: "transparent",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                        value={detailedAddressProxy}
                        onChange={(e) => {
                          setDetailedAddressProxy(e.target.value);
                          setIsAddressFromPlacesProxy(false);
                        }}
                        onBlur={handleAddressBlurProxy}
                      />
                    </StandaloneSearchBox>
                  ) : (
                    <Input
                      placeholder="Địa chỉ chi tiết (Đang tải Google Maps...)"
                      style={{
                        background: "transparent",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                      value={detailedAddressProxy}
                      onChange={(e) => {
                        setDetailedAddressProxy(e.target.value);
                        setIsAddressFromPlacesProxy(false);
                      }}
                      disabled
                    />
                  )}
                  <div className="delivery-info">
                    <Radio.Group
                      value={deliveryTimeOption}
                      onChange={(e) => setDeliveryTimeOption(e.target.value)}
                    >
                      <Radio
                        value="now"
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          marginBottom: 6,
                        }}
                      >
                        Giao ngay
                      </Radio>
                    </Radio.Group>
                  </div>
                </>
              )}
            </Space>
          </Card>

          <Divider className="divider" />

          <Card className="section-card payment-method">
            <Title
              level={3}
              style={{ fontFamily: "'Montserrat', sans-serif", marginTop: 0 }}
            >
              Phương thức thanh toán
            </Title>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <Space direction="vertical">
                <Radio
                  value={4}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Quét mã QR
                </Radio>
              </Space>
            </Radio.Group>
          </Card>
        </Col>

        <Col span={12}>
          <Card className="confirm-card section-card order-details">
            <Title
              className="title-card"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              TẤM TẮC LÀNG ĐẠI HỌC
            </Title>
            <Text style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia TP. Hồ Chí Minh
            </Text>
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <div
                  className="order-item"
                  style={{ marginTop: 16 }}
                  key={item.productId}
                >
                  <Row style={{ justifyContent: "space-between" }}>
                    <Col span={17}>
                      <Text
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: 17,
                          display: "block",
                          height: 30,
                        }}
                      >
                        {item.productName}
                      </Text>
                      {item.addOns.length > 0 && (
                        <>
                          {item.addOns.map((addOn, index) => (
                            <Row style={{ flexWrap: "nowrap" }}>
                              <Text
                                key={index}
                                className="sub-item"
                                style={{
                                  fontFamily: "'Montserrat', sans-serif",
                                  width: "-webkit-fill-available",
                                }}
                              >
                                • {addOn.productTypeName} x{addOn.quantity}
                              </Text>
                            </Row>
                          ))}
                        </>
                      )}
                    </Col>
                    <Col span={7}>
                      <Row>
                        <div className="order-price">
                          <Text
                            style={{
                              fontFamily: "'Montserrat', sans-serif",
                              color: "#DA7339",
                              fontSize: 15,
                              fontWeight: 700,
                              marginRight: 13,
                            }}
                          >
                            {item.price.toLocaleString()}đ
                          </Text>
                          <div className="quantity-controls">
                            <Button
                              disabled={item.quantity === 1}
                              onClick={() => handleDecrement(item.productId)}
                            >
                              -
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              onClick={() => handleIncrement(item.productId)}
                              disabled={item.quantity === 10}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </Row>
                      {item.addOns.length > 0 && (
                        <Col>
                          {item.addOns.map((addOn, index) => (
                            <Row style={{ flexWrap: "nowrap" }}>
                              <Text
                                key={index}
                                className="sub-item"
                                style={{
                                  fontFamily: "'Montserrat', sans-serif",
                                  color: "#DA7339",
                                  fontSize: 15,
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                  margin: 0,
                                }}
                              >
                                {(
                                  addOn.price * addOn.quantity
                                ).toLocaleString()}
                                đ
                              </Text>
                            </Row>
                          ))}
                        </Col>
                      )}
                    </Col>
                  </Row>
                </div>
              ))
            ) : (
              <Text
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  marginTop: 16,
                }}
              >
                Không có món nào được chọn.
              </Text>
            )}
          </Card>
          <Card className="confirm-card section-card order-details">
            <Row style={{ justifyContent: "space-between" }}>
              <Col span={20}>
                <Button
                  type="primary"
                  className="apply-promo"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    height: 40,
                  }}
                  onClick={() => setIsModalVisible(true)}
                >
                  Chọn hoặc nhập mã
                </Button>
              </Col>
            </Row>
            <Input
              placeholder="Ghi chú cho cửa hàng"
              style={{
                marginTop: "8px",
                background: "#efe6db",
                fontFamily: "'Montserrat', sans-serif",
              }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Card>
          <Card className="confirm-card section-card order-details">
            <div className="order-summary">
              <div className="summary-item">
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  Giá gốc
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#DA7339",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {subtotal.toLocaleString()}đ
                </Text>
              </div>
              <div className="summary-item">
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  Giảm giá trên món
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#DA7339",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  -{discountOnItems.toLocaleString()}đ
                </Text>
              </div>
              <div className="summary-item">
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  Giảm giá từ khuyến mãi
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#DA7339",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  -{promoDiscount.toLocaleString()}đ
                </Text>
              </div>
              <div className="summary-item">
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  Phí giao hàng
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#DA7339",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {deliveryFee.toLocaleString()}đ
                </Text>
              </div>
              <Divider style={{ border: "1px solid black" }} />
              <div className="summary-item total">
                <Text style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  TỔNG CỘNG
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  {total.toLocaleString()}đ
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              block
              className="submit-button"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              onClick={handleOrderSubmit}
              disabled={isLoadingButton}
            >
              {isLoadingButton ? (
                <>
                  <Spin />
                  Đặt hàng
                </>
              ) : (
                "Đặt hàng"
              )}
            </Button>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Chọn hoặc nhập mã khuyến mãi"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        footer={[
          <Button
            key="back"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            onClick={() => setIsModalVisible(false)}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            style={{
              backgroundColor: "#78a243",
              border: "none",
              color: "white",
              outline: "none",
              fontFamily: "'Montserrat', sans-serif",
            }}
            onClick={handleApplyUserPromotion}
          >
            Chọn
          </Button>,
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text
              style={{
                whiteSpace: "nowrap",
                alignContent: "center",
                marginRight: 11,
              }}
            >
              Mã khuyến mãi
            </Text>
            <Input
              placeholder="Nhập mã khuyến mãi"
              style={{
                background: "#ebd187",
                fontFamily: "'Montserrat', sans-serif",
                flex: 1,
              }}
              value={manualPromoCode}
              onChange={(e) => {
                setManualPromoCode(e.target.value);
                setErrorMessage(null);
              }}
            />
            <Button
              type="primary"
              className="apply-promo"
              style={{
                marginLeft: 11,
                fontFamily: "'Montserrat', sans-serif",
              }}
              onClick={handleApplyPromotion}
            >
              Áp dụng
            </Button>
          </div>
          {errorMessage && (
            <Text
              style={{
                color: "red",
                fontSize: 14,
                marginTop: 4,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {errorMessage}
            </Text>
          )}
        </div>
        <div style={{ marginBottom: 16, marginTop: 15 }}>
          <Text>Chọn khuyến mãi từ tài khoản:</Text>
          {isLoading ? (
            <Spin />
          ) : userPromotions && userPromotions.length > 0 ? (
            userPromotions.map((promo) => (
              <Card
                key={promo.promotionId}
                hoverable
                className="promotion-for-user"
              >
                <Row gutter={16} align="middle">
                  <Col span={7}>
                    <div
                      style={{
                        background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
                        height: 80,
                        borderRadius: "8px 0 0 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 18,
                          fontWeight: 600,
                          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {promo.code}
                      </Text>
                    </div>
                  </Col>
                  <Col span={13}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#333",
                          fontWeight: 500,
                        }}
                      >
                        Giảm: {promo.discountAmount.toLocaleString()}đ
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#666",
                          marginBottom: 2,
                        }}
                      >
                        Tối thiểu: {promo.minOrderAmount.toLocaleString()}đ
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#999",
                          fontStyle: "italic",
                        }}
                      >
                        Hạn dùng: {dayjs(promo.endDate).format("DD/MM/YYYY")}
                      </Text>
                    </div>
                  </Col>
                  <Col
                    span={4}
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <Checkbox
                      checked={
                        selectedUserPromo?.promotionId === promo.promotionId
                      }
                      onChange={(e) =>
                        setSelectedUserPromo(e.target.checked ? promo : null)
                      }
                    />
                  </Col>
                </Row>
              </Card>
            ))
          ) : (
            <Text>Không có khuyến mãi nào từ tài khoản.</Text>
          )}
        </div>
      </Modal>
    </Layout>
  );
};

export default Checkout;
