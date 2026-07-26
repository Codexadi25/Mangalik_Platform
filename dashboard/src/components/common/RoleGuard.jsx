import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

/**
 * RoleGuard — client-side convenience gate (UX only). The REAL
 * authorization boundary is server-side via `authorize()` /
 * `requirePermission()` middleware on every /api route; this guard
 * just prevents an unauthorized role from seeing dashboard UI shells
 * for screens their API calls would reject anyway.
 */
const RoleGuard = ({ allow, children }) => {
  const { user, status } = useSelector((s) => s.auth);
  const location = useLocation();
  
  if (status === "idle" || status === "loading") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    if (location.pathname !== '/login') {
      sessionStorage.setItem('returnUrl', location.pathname + location.search);
    }
    return <Navigate to="/login" replace />;
  }
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};
export default RoleGuard;
