import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * RoleGuard — client-side convenience gate (UX only). The REAL
 * authorization boundary is server-side via `authorize()` /
 * `requirePermission()` middleware on every /api route; this guard
 * just prevents an unauthorized role from seeing dashboard UI shells
 * for screens their API calls would reject anyway.
 */
const RoleGuard = ({ allow, children }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};
export default RoleGuard;
