import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import LoginOTP from "./pages/LoginOTP";
import Login1 from "./pages/Login1";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";

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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-otp" element={<LoginOTP />} />
          <Route path="/login1" element={<Login1 />} />
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
