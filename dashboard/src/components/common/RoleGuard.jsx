import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * RoleGuard — client-side convenience gate (UX only). The REAL
 * authorization boundary is server-side via `authorize()` /
 * `requirePermission()` middleware on every /api route; this guard
 * just prevents an unauthorized role from seeing dashboard UI shells
 * for screens their API calls would reject anyway.
 */
import { Box, CircularProgress } from "@mui/material";

const RoleGuard = ({ allow, children }) => {
  const { user, status } = useSelector((s) => s.auth);
  
  if (status === "idle" || status === "loading") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};
export default RoleGuard;
