import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

const AuthGuard = ({ children }) => {
  const { user, status } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (status !== "loading" && status !== "idle" && !user) {
      navigate(`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
    }
  }, [user, status, navigate, location]);

  if (status === "loading" || status === "idle") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return null; // Wait for redirect

  return children;
};

export default AuthGuard;
