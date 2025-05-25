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

const LayoutWithNavFooter = () => (
  <>
    <Navbar />
    <Outlet />
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

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<LayoutWithNavFooter />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/user-information" element={<UserInfomation />} />
        </Route>
        {/* <Route element={<LayoutWithSidebar />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route> */}
        <Route element={<LayoutWithSidebarManager />}>
          <Route path="/manager/dashboard" element={<Dashboard />} />
          <Route path="/manager/orders" element={<OrderManagement />} />
          <Route path="/manager/orders/confirm-orders" element={<ConfirmOrders />} />
          <Route path="/manager/products" element={<ProductManagement />} />
          <Route path="/manager/promotions" element={<PromotionManagement />} />
          <Route path="/manager/staffs" element={<EmployeeManagement/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
