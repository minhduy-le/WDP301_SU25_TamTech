export {};

declare global {
  interface IBackendRes<T> {
    error?: string | string[];
    message: string | string[];
    statusCode: number | string;
    data?: T;
  }

  interface IModelPaginate<T> {
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    results: T[];
  }

  interface IRegister {
    _id: string;
  }

  interface IUserLogin {
    user: {
      email: string;
      _id: string;
      name: string;
      role: string;
      address: any;
      avatar: string;
      phone: string;
    };
    token: string;
  }

  interface ITopRestaurant {
    _id: string;
    name: string;
    phone: string;
    address: string;
    email: string;
    rating: number;
    image: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  interface IRestaurants {
    productId: string;
    description: string;
    productDescription: string;
    image: string;
    price: number;
    productType: string;
    productQuantity: number;
  }
  interface IRestaurant {
    longitude: number;
    latitude: number;
    _id: string;
    name: string;
    phone: string;
    address: string;
    email: string;
    rating: number;
    image: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    menu: IMenu[];
    isLike: boolean;
  }

  interface IMenu {
    _id: string;
    restaurant: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    menuItem: IMenuItem[];
  }

  interface IMenuItem {
    productImage: any;
    productId: number;
    _id: string;
    menu: string;
    title: string;
    name: string;
    description: string;
    basePrice: number;
    price: number;
    image: string;
    options: {
      title: string;
      description: string;
      additionalPrice: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
  }

  interface ICart {
    [key: string]: {
      sum: number;
      quantity: number;
      items: {
        [key: string]: {
          quantity: number;
          data: IMenuItem;
          extra?: {
            [key: string]: number;
          };
        };
      };
    };
  }
  interface IOrderHistory {
    _id: string;
    restaurant: IRestaurant;
    user: string;
    status: string;
    totalPrice: number;
    totalQuantity: number;
    orderTime: Date;
    detail: {
      image: string;
      title: string;
      option: string;
      price: number;
      quantity: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
  }
  interface IOrderHistoryCus {
    orderId: number;
    payment_time: string;
    order_create_at: string;
    order_address: string;
    status: string;
    fullName: string;
    phone_number: string;
    orderItems: [
      {
        productId: number;
        name: string;
        quantity: number;
        price: string;
      }
    ];
    order_shipping_fee: string;
    order_discount_value: string;
    order_amount: string;
    order_subtotal: string;
    invoiceUrl: string;
    order_point_earn: number;
    note: string;
    payment_method: string;
  }
  interface IOrderDetails {
    orderId: number;
    userId: number;
    payment_time: string;
    order_create_at: string;
    order_address: string;
    status: string;
    fullName: string;
    phone_number: string;
    orderItemsCount: number;
    orderItems: {
      productId: number;
      name: string;
      quantity: number;
      price: number;
    }[];
    order_shipping_fee: number;
    order_discount_value: number;
    order_amount: number;
    order_subtotal: number;
    invoiceUrl: string;
    order_point_earn: number;
    note: string;
    payment_method: string;
    isDatHo: boolean;
    tenNguoiDatHo: string | null;
    soDienThoaiNguoiDatHo: string | null;
    certificationOfDelivered: string | null;
    order_delivery_at: string | null;
  }
}
