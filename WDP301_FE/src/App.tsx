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
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import UserInformation from "./pages/UserInformation";
import ManagerSidebar from "./components/manager/ManagerSidebar";
import OrderManagement from "./pages/manager/orders/OrderManagement";
import ProductManagement from "./pages/manager/products/ProductManagement";
import PromotionManagement from "./pages/manager/promotions/PromotionManagement";
import EmployeeManagement from "./pages/manager/staffs/EmployeeManagement";
import ProductDetail from "./pages/ProductDetail";
import AdminSidebar from "./components/admin/AdminSidebar";
import UserManagement from "./pages/admin/UserManagement";
import SystemIssuesReport from "./pages/admin/SystemIssuesReport";
import Forbidden from "./pages/Forbidden";
import { AuthGuardProvider } from "./contexts/AuthGuardContext";
import Blog from "./pages/Blog";
import AdminProfile from "./pages/admin/AdminProfile";
import CustomerFeedbackManagement from "./pages/manager/feedbacks/CustomerFeedbackManagement";
import StaffSidebar from "./components/staff/StaffSidebar";
import StaffOrderManagement from "./pages/OrderManageStaff";
import StaffProfile from "./pages/StaffProfile";
import StaffChat from "./pages/StaffChat";
import ManagerChat from "./pages/ManagerChat";
import MaterialManagement from "./pages/manager/materials/MaterialManagement";
import ManagerProfile from "./pages/manager/ManagerProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ChatAdmin from "./pages/admin/ChatAdmin";
import BlogDetail from "./pages/BlogDetail";
import BlogManagement from "./pages/BlogManagement";
import { POSPage } from "./pages/POSPage";
import POSSuccess from "./components/pos/POSSuccess";
import ReportManagement from "./pages/admin/ReportManagement";
import CancelOrderSuccess from "./pages/CancelOrderSuccess";
import PaymentCancel from "./pages/PaymentCancel"; 
import MaterialProcessManagement from "./pages/manager/materials/MaterialProcessManagement";
import UserLayout from "./components/UserLayout";
import OrderTracking from "./pages/OrderTracking";
import Promotion from "./pages/Promotion";
import OrderHistorys from "./pages/OrderHistory";

const LayoutWithNavFooter = () => (
  <>
    <Navbar />
    <div style={{ paddingTop: "72px", overflow: "hidden" }}>
      <Outlet />
    </div>
    <Footer />
  </>
);

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

const LayoutWithSidebarStaff = () => (
  <>
    <StaffSidebar />
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
            <Route path="/payment-cancel" element={<CancelOrderSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            {/* <Route path="/user-information" element={<UserInfomation />} /> */}
            <Route path="/user" element={<UserLayout />}>
              <Route path="information" element={<UserInformation />} />
              <Route path="order-history" element={<OrderHistorys />} />
              <Route
                path="order-tracking/:orderId"
                element={<OrderTracking />}
              />
              <Route path="promotion" element={<Promotion />} />
            </Route>
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
          </Route>

          <Route element={<LayoutWithSidebarManager />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/orders" element={<OrderManagement />} />
            <Route path="/manager/materials" element={<MaterialManagement />} />
            <Route
              path="/manager/materials-process"
              element={<MaterialProcessManagement />}
            />
            <Route path="/manager/products" element={<ProductManagement />} />
            <Route path="/manager/profile" element={<ManagerProfile />} />
            <Route
              path="/manager/promotions"
              element={<PromotionManagement />}
            />
            <Route path="/manager/staffs" element={<EmployeeManagement />} />
            <Route
              path="/manager/feedback"
              element={<CustomerFeedbackManagement />}
            />
            <Route path="/manager/chat" element={<ManagerChat />} />
            <Route path="/manager/blog" element={<BlogManagement />} />
          </Route>
          <Route element={<LayoutWithSidebarAdmin />}>
            <Route path="/admin/dashboard" element={<ReportManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route
              path="/admin/system-issues"
              element={<SystemIssuesReport />}
            />
            <Route path="/admin/chat" element={<ChatAdmin />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          <Route element={<LayoutWithSidebarStaff />}>
            <Route path="/staff/orders" element={<StaffOrderManagement />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
            <Route path="/staff/chat" element={<StaffChat />} />
            <Route path="/staff/pos" element={<POSPage />} />
            <Route path="/staff/payment-success" element={<POSSuccess />} />
            
          </Route><Route path="/staff/pos/payment-cancel" element={<PaymentCancel />} />
        </Routes>
      </AuthGuardProvider>
    </Router>
  );
}

export default App;
