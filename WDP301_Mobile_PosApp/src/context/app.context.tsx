import { createContext, useContext, useState } from "react";

interface AppContextType {
  appState: IUserLogin | null;
  setAppState: (v: any) => void;
  cart: ICart | Record<string, never>;
  setCart: (v: any) => void;
  counter: ICounter | null;
  setCounter: (v: any) => void;
}
const AppContext = createContext<AppContextType | null>(null);

interface IProps {
  children: React.ReactNode;
}

const AppProvider = (props: IProps) => {
  const [appState, setAppState] = useState<IUserLogin | null>(null);
  const [cart, setCart] = useState<ICart | Record<string, never>>({});
  const [counter, setCounter] = useState<ICounter | null>(null);
  return (
    <AppContext.Provider
      value={{
        appState,
        setAppState,
        cart,
        setCart,
        counter,
        setCounter,
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
