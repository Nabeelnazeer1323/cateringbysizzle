
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import OrderFlow from "./pages/OrderFlow";
import MenuCustomization from "./pages/MenuCustomization";
import Cart from "./pages/Cart";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import Profile from "./pages/Profile";
import OrderHistory from "./pages/OrderHistory";
import CompanySettings from "./pages/CompanySettings";
import Admin from "./pages/Admin";
import CompanyRegistration from "./pages/CompanyRegistration";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected route component to redirect to order page if authenticated
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  
  // Show nothing while authentication is being checked
  if (loading) return null;
  
  // If user is logged in, redirect to order page, otherwise show Index page
  return user ? <Navigate to="/order" replace /> : <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/company-registration" element={<CompanyRegistration />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/order" element={<OrderFlow />} />
              <Route path="/menu/:id" element={<MenuCustomization />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/company-settings" element={<CompanySettings />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
