import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Provider, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { store } from "./redux/store/store";
import { dashboardTheme } from "./theme/theme";
import { fetchMeThunk } from "./redux/slices/authSlice";

import DashboardLayout from "./components/layout/DashboardLayout";
import RoleGuard from "./components/common/RoleGuard";
import Login from "./pages/Login";

import SuperadminOverview from "./pages/superadmin/Overview";
import PlatformControl from "./pages/superadmin/PlatformControl";
import Billing from "./pages/superadmin/Billing";
import AdsControl from "./pages/superadmin/AdsControl";
import FeatureFlags from "./pages/superadmin/FeatureFlags";
import UserManagement from "./pages/superadmin/UserManagement";
import AuditLogs from "./pages/superadmin/AuditLogs";

import AdminOverview from "./pages/admin/Overview";
import Catalog from "./pages/admin/Catalog";
import Orders from "./pages/admin/Orders";
import Vendors from "./pages/admin/Vendors";
import Staff from "./pages/admin/Staff";
import Cms from "./pages/admin/Cms";
import Coupons from "./pages/admin/Coupons";

import ManagerOverview from "./pages/manager/Overview";
import VendorCatalog from "./pages/vendor/MyCatalog";
import VendorOrders from "./pages/vendor/MyOrders";
import AgentTickets from "./pages/agent/Tickets";
import DeliveryOrders from "./pages/deliveryPartner/Orders";
import SalesReferrals from "./pages/salesPartner/Referrals";
import SalesCommissions from "./pages/salesPartner/Commissions";

const ALL_STAFF = ["superadmin", "admin", "manager", "vendor", "agent", "deliveryPartner", "salesPartner"];

const Bootstrap = ({ children }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={dashboardTheme}>
        <CssBaseline />
        <BrowserRouter>
          <Bootstrap>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* ---------------- SUPERADMIN-EXCLUSIVE ---------------- */}
              <Route path="/superadmin/overview" element={<RoleGuard allow={["superadmin"]}><DashboardLayout><SuperadminOverview /></DashboardLayout></RoleGuard>} />
              <Route path="/superadmin/platform-control" element={<RoleGuard allow={["superadmin"]}><DashboardLayout><PlatformControl /></DashboardLayout></RoleGuard>} />
              <Route path="/superadmin/billing" element={<RoleGuard allow={["superadmin"]}><DashboardLayout><Billing /></DashboardLayout></RoleGuard>} />
              <Route path="/superadmin/ads" element={<RoleGuard allow={["superadmin"]}><DashboardLayout><AdsControl /></DashboardLayout></RoleGuard>} />
              <Route path="/superadmin/feature-flags" element={<RoleGuard allow={["superadmin"]}><DashboardLayout><FeatureFlags /></DashboardLayout></RoleGuard>} />
              <Route path="/superadmin/users" element={<RoleGuard allow={["superadmin"]}><DashboardLayout><UserManagement /></DashboardLayout></RoleGuard>} />
              <Route path="/superadmin/audit-logs" element={<RoleGuard allow={["superadmin"]}><DashboardLayout><AuditLogs /></DashboardLayout></RoleGuard>} />

              {/* ---------------- ADMIN (Business Owner) + SUPERADMIN ---------------- */}
              <Route path="/admin/overview" element={<RoleGuard allow={["admin", "superadmin"]}><DashboardLayout><AdminOverview /></DashboardLayout></RoleGuard>} />
              <Route path="/admin/catalog" element={<RoleGuard allow={["admin", "superadmin"]}><DashboardLayout><Catalog /></DashboardLayout></RoleGuard>} />
              <Route path="/admin/orders" element={<RoleGuard allow={["admin", "superadmin"]}><DashboardLayout><Orders /></DashboardLayout></RoleGuard>} />
              <Route path="/admin/vendors" element={<RoleGuard allow={["admin", "superadmin"]}><DashboardLayout><Vendors /></DashboardLayout></RoleGuard>} />
              <Route path="/admin/staff" element={<RoleGuard allow={["admin", "superadmin"]}><DashboardLayout><Staff /></DashboardLayout></RoleGuard>} />
              <Route path="/admin/cms" element={<RoleGuard allow={["admin", "superadmin"]}><DashboardLayout><Cms /></DashboardLayout></RoleGuard>} />
              <Route path="/admin/coupons" element={<RoleGuard allow={["admin", "superadmin"]}><DashboardLayout><Coupons /></DashboardLayout></RoleGuard>} />

              {/* ---------------- MANAGER ---------------- */}
              <Route path="/manager/overview" element={<RoleGuard allow={["manager", "admin", "superadmin"]}><DashboardLayout><ManagerOverview /></DashboardLayout></RoleGuard>} />
              <Route path="/manager/orders" element={<RoleGuard allow={["manager", "admin", "superadmin"]}><DashboardLayout><Orders /></DashboardLayout></RoleGuard>} />

              {/* ---------------- VENDOR ---------------- */}
              <Route path="/vendor/catalog" element={<RoleGuard allow={["vendor"]}><DashboardLayout><VendorCatalog /></DashboardLayout></RoleGuard>} />
              <Route path="/vendor/orders" element={<RoleGuard allow={["vendor"]}><DashboardLayout><VendorOrders /></DashboardLayout></RoleGuard>} />

              {/* ---------------- AGENT ---------------- */}
              <Route path="/agent/tickets" element={<RoleGuard allow={["agent", "manager", "admin", "superadmin"]}><DashboardLayout><AgentTickets /></DashboardLayout></RoleGuard>} />

              {/* ---------------- DELIVERY PARTNER ---------------- */}
              <Route path="/delivery/orders" element={<RoleGuard allow={["deliveryPartner", "manager", "admin", "superadmin"]}><DashboardLayout><DeliveryOrders /></DashboardLayout></RoleGuard>} />

              {/* ---------------- SALES PARTNER ---------------- */}
              <Route path="/sales-partner/referrals" element={<RoleGuard allow={["salesPartner"]}><DashboardLayout><SalesReferrals /></DashboardLayout></RoleGuard>} />
              <Route path="/sales-partner/commissions" element={<RoleGuard allow={["salesPartner"]}><DashboardLayout><SalesCommissions /></DashboardLayout></RoleGuard>} />

              <Route path="/" element={<RoleGuard allow={ALL_STAFF}><DashboardLayout><AdminOverview /></DashboardLayout></RoleGuard>} />
            </Routes>
          </Bootstrap>
          <ToastContainer position="top-center" autoClose={2500} />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
