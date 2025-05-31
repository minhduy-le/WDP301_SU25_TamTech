import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyOTP from "./pages/VerifyOTP";
// import Sidebar from "./components/Sidebar";np
import Dashboard from "./pages/manager/Dashboard";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import UserInfomation from "./pages/UserInformation";
import ManagerSidebar from "./components/manager/ManagerSidebar";
import OrderManagement from "./pages/manager/orders/OrderManagement";
import ConfirmOrders from "./pages/manager/orders/ConfirmOrders";
import ProductManagement from "./pages/manager/products/ProductManagement";
import PromotionManagement from "./pages/manager/promotions/PromotionManagement";
import EmployeeManagement from "./pages/manager/staffs/EmployeeManagement";
import ProductDetail from "./pages/ProductDetail";
import AdminSidebar from "./components/admin/AdminSidebar";
import UserManagement from "./pages/admin/UserManagement";
import ReportManagement from "./pages/admin/ReportManagement";
import SystemIssuesReport from "./pages/admin/SystemIssuesReport";
import Forbidden from "./pages/Forbidden";
import { AuthGuardProvider } from "./contexts/AuthGuardContext";

const LayoutWithNavFooter = () => (
  <>
    <Navbar />
    <div style={{ paddingTop: "80px" }}>
      <Outlet />
    </div>
    <Footer />
  </>
);

// const LayoutWithSidebar = () => (
//   <>
//     <Sidebar />
//   </>
// );
const LayoutWithSidebarManager = () => (
  <>
    <ManagerSidebar />
  </>
);
const LayoutWithSidebarAdmin = () => (
  <>
    <AdminSidebar />
  </>
);
function App() {
  return (
    <Router>
      <AuthGuardProvider>
        <Routes>
          <Route path="/forbidden" element={<Forbidden />} />
          <Route element={<LayoutWithNavFooter />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/api/orders/success" element={<PaymentSuccess />} />
            <Route path="/user-information" element={<UserInfomation />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
          </Route>
          {/* <Route element={<LayoutWithSidebar />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route> */}
          <Route element={<LayoutWithSidebarManager />}>
            <Route path="/manager/dashboard" element={<Dashboard />} />
            <Route path="/manager/orders" element={<OrderManagement />} />
            <Route
              path="/manager/orders/confirm-orders"
              element={<ConfirmOrders />}
            />
            <Route path="/manager/products" element={<ProductManagement />} />
            <Route path="/manager/promotions" element={<PromotionManagement />} />
            <Route path="/manager/staffs" element={<EmployeeManagement />} />
          </Route>
          <Route element={<LayoutWithSidebarAdmin />}>
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/dashboard" element={<ReportManagement />} />
            <Route path="/admin/system-issues" element={<SystemIssuesReport />} />
          </Route>
        </Routes>
      </AuthGuardProvider>
    </Router>
  );
}

export default App;
