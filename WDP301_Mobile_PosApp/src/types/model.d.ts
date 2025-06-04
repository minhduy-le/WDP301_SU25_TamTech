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
