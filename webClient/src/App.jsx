import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Provider, useDispatch } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from "react-toastify";

import { store } from "./redux/store/store";
import { lightTheme } from "./theme/theme";
import { fetchMeThunk } from "./redux/slices/authSlice";

import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import HelpSupport from "./pages/HelpSupport";
import FAQs from "./pages/FAQs";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import MyOrders from "./pages/MyOrders";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import RouteGuard from "./components/common/RouteGuard";

const Bootstrap = ({ children }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);
  return children;
};

/**
 * Every storefront route is wrapped in <RouteGuard> which checks the
 * superadmin's `disabledRoutes` list (fetched from /api/ads/config-like
 * platform settings) and renders a "currently unavailable" state if
 * the route has been switched off — without any code change/deploy.
 */
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <HelmetProvider>
          <BrowserRouter>
            <Bootstrap>
              <MainLayout>
                <Routes>
                <Route path="/" element={<RouteGuard route="/"><Home /></RouteGuard>} />
                <Route path="/products" element={<RouteGuard route="/products"><ProductListing /></RouteGuard>} />
                <Route path="/products/:slug" element={<RouteGuard route="/products"><ProductDetail /></RouteGuard>} />
                <Route path="/cart" element={<RouteGuard route="/cart"><CartPage /></RouteGuard>} />
                <Route path="/checkout" element={<RouteGuard route="/checkout"><CheckoutPage /></RouteGuard>} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/login" element={<LoginPage />} />

                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/help-support" element={<HelpSupport />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
            </Bootstrap>
            <ToastContainer position="top-center" autoClose={2500} />
          </BrowserRouter>
        </HelmetProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
