import { useAuthStore } from "../hooks/usersApi";
import { createContext, useEffect, type PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";

type UserRole = "User" | "Shipper" | "Staff" | "Admin" | "Manager";

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
      "/menu",
      "/blog",
    ];

    if (!user || !user.role) {
      if (!publicPages.includes(location.pathname)) {
        navigate("/login", { replace: true });
        // message.error("Bạn phải đăng nhập để chuyển tới trang này");
      }
      return;
    }

    const roleRedirects: Record<UserRole, string> = {
      User: "/",
      Staff: "/staff/orders",
      Shipper: "/",
      Admin: "/admin/dashboard",
      Manager: "/manager/dashboard",
    };

    if (location.pathname === "/") {
      navigate(roleRedirects[user.role as UserRole], { replace: true });
      return;
    }

    const restrictedPages: Record<UserRole, string[]> = {
      Staff: [
        "/staff/orders",
        "/staff/orders/confirm-orders",
        "/staff/profile",
      ],
      User: [
        "/checkout",
        "/api/orders/success",
        "/user-information",
        "/product/:productId",
      ],
      Shipper: [],
      Manager: [
        "/manager/dashboard",
        "/manager/orders",
        "/manager/orders/confirm-orders",
        "/manager/products",
        "/manager/promotions",
        "/manager/staffs",
        "/manager/staffs/staffId"
      ],
      Admin: [
        "/admin/dashboard",
        "/admin/users",
        "/admin/system-issues",
        "/admin/profile",
      ],
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
