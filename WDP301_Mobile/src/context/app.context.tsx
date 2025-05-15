import { createContext, useContext, useState } from "react";

interface AppContextType {
  theme: string;
  setTheme: (v: string) => void;
  appState: IUserLogin | null;
  setAppState: (v: any) => void;
  cart: ICart | Record<string, never>;
  setCart: (v: any) => void;
  restaurant: IRestaurant | null;
  setRestaurant: (v: any) => void;
  branchId: number | null;
  setBranchId: (v: any) => void;
  locationReal: string;
  setLocationReal: (v: any) => void;
}
const AppContext = createContext<AppContextType | null>(null);

interface IProps {
  children: React.ReactNode;
}

const AppProvider = (props: IProps) => {
  const [theme, setTheme] = useState<string>("eric-light");
  const [appState, setAppState] = useState<IUserLogin | null>(null);
  const [cart, setCart] = useState<ICart | Record<string, never>>({});
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [branchId, setBranchId] = useState<number | null>(1);
  const [locationReal, setLocationReal] = useState("");
  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        appState,
        setAppState,
        cart,
        setCart,
        restaurant,
        setRestaurant,
        branchId,
        setBranchId,
        locationReal,
        setLocationReal,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export const useCurrentApp = () => {
  const currentTheme = useContext(AppContext);
  if (!currentTheme) {
    throw new Error(
      "useCurrentApp has to be used within <AppContext.Provider>"
    );
  }

  return currentTheme;
};

export default AppProvider;
