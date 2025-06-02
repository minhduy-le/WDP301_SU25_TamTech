import { useAuthStore } from "../hooks/usersApi";
import { createContext, useEffect, type PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";

type UserRole = "User" | "Shipper" | "Staff" | "Admin";

type AuthGuardContextType = Record<string, unknown>;

type AuthGuardProviderProps = PropsWithChildren;

const AuthGuardContext = createContext<AuthGuardContextType>({});

export function AuthGuardProvider(props: AuthGuardProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { children } = props;
  const { user, logout, token, setUser, setToken } = useAuthStore();

  useEffect(() => {
    if (!user || !token) {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    }

    if (token) {
      try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.exp < currentTime) {
          message.warning("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          logout();
          return;
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    }
  }, [token, user, setUser, setToken, logout]);

  useEffect(() => {
    const publicPages = [
      "/",
      "/login",
      "/register",
      "/verify-email",
      "/verify-otp",
    ];

    if (!user || !user.role) {
      if (!publicPages.includes(location.pathname)) {
        navigate("/login", { replace: true });
      }
      return;
    }

    const roleRedirects: Record<UserRole, string> = {
      User: "/",
      Staff: "/manager/dashboard",
      Shipper: "/",
      Admin: "/admin/dashboard",
    };

    if (location.pathname === "/") {
      navigate(roleRedirects[user.role as UserRole], { replace: true });
      return;
    }

    const restrictedPages: Record<UserRole, string[]> = {
      Staff: [
        "/manager/dashboard",
        "/manager/orders",
        "/manager/orders/confirm-orders",
        "/manager/products",
        "/manager/promotions",
        "/manager/staffs",
        "/manager/feedbacks",
      ],
      User: [
        "/menu",
        "/checkout",
        "/api/orders/success",
        "/user-information",
        "/product/:productId",
      ],
      Shipper: [],
      Admin: ["/admin/dashboard", "/admin/users", "/admin/system-issues"],
    };

    // const currentPage = location.pathname;

    // if (
    //   !publicPages.includes(currentPage) &&
    //   restrictedPages[user.role as UserRole]?.length
    // ) {
    //   const allowedPages = restrictedPages[user.role as UserRole] || [];

    //   if (!allowedPages.includes(currentPage)) {
    //     navigate("/forbidden", { replace: true });
    //   }
    // }
    const matchDynamicRoute = (route: string, path: string) => {
      const dynamicRoutePattern = route.replace(/:productId/, "[0-9]+");
      const regex = new RegExp(`^${dynamicRoutePattern}$`);
      return regex.test(path);
    };

    // Check if the current path is allowed for the user's role
    const userRole = user.role as UserRole;
    const allowedPages = restrictedPages[userRole] || [];
    const isAllowed =
      publicPages.includes(location.pathname) ||
      allowedPages.some((route) => {
        if (route.includes(":productId")) {
          return matchDynamicRoute(route, location.pathname);
        }
        return route === location.pathname;
      });

    if (!isAllowed) {
      navigate("/forbidden", { replace: true });
    }
  }, [user, location, navigate]);

  return (
    <AuthGuardContext.Provider value={{}}>{children}</AuthGuardContext.Provider>
  );
}

export default AuthGuardContext;
