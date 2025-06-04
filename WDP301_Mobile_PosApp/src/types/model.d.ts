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
interface ICounter {
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
