declare module "*.png" {
  const value: import("react-native").ImageSourcePropType;
  export default value;
}

declare module "*.jpg" {
  const value: import("react-native").ImageSourcePropType;
  export default value;
}

declare module "*.ttf";

declare module "jwt-decode" {
  export default function jwt_decode(token: string): any;
}
