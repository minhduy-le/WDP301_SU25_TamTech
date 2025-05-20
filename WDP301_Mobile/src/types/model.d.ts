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
    access_token: string;
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
    productName: string;
    productDescription: string;
    productImage: string;
    productPrice: number;
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
    description: string;
    basePrice: number;
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

  // cart: {
  //     "id-cua-hang-1": {
  //         sum: 123,
  //         quantity: 10,
  //         items: {
  //             "san-pham-1": {
  //                 quantity: 2,
  //                 data: {},
  //                 extra: {
  //                    "size L":  1,
  //                    "size M":  1
  //                 }
  //             }
  //         }
  //     }
  // }

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
    id: number;
    subTotal: number;
    promotionCode: string;
    discountValue: number;
    discountPercent: number;
    amount: number;
    shipping_fee: number;
    isPickUp: boolean;
    delivery_at: string;
    note: string;
    payment_code: string;
    address: string;
    phone: number;
    pointUsed: number;
    pointEarned: number;
    orderStatus: string;
    createdAt: string;
    orderItems: [
      {
        productId: number;
        orderId: number;
        quantity: number;
        price: number;
        note: string;
        feedback: string | null;
        feedbackPoint: number;
        expiredFeedbackTime: string | null;
        feedBackYet: boolean;
      }
    ];
  }
  interface IOrderDetails {
    id: string;
    customerName: string | null;
    subTotal: number;
    promotionCode: string | null;
    discountValue: number;
    discountPercent: number;
    amount: number;
    shipping_fee: number | null;
    isPickUp: boolean;
    delivery_at: string | null;
    orderStatus: string;
    note: string;
    payment_code: string | null;
    payment_methods: string | null;
    address: string;
    phone: string;
    pointUsed: number;
    pointEarned: number;
    createdAt: string;
    orderItems: {
      productName: string;
      productImg: string;
      productId: number;
      orderId: number;
      quantity: number;
      price: number;
      note: string;
      feedback: string | null;
      feedbackPoint: number;
      expiredFeedbackTime: string | null;
      feedBackYet: boolean;
    }[];
  }
}
