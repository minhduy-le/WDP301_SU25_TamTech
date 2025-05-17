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
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";

const LayoutWithNavFooter = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

const LayoutWithSidebar = () => (
  <>
    <Sidebar />
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
        </Route>
        <Route element={<LayoutWithSidebar />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
