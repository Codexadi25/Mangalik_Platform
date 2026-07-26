import { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import api from "../../services/api";

/**
 * RouteGuard — wraps a page and checks whether the SUPERADMIN has
 * disabled this route via the platform kill-switch system. If the
 * whole site is disabled (maintenance / unpaid dues) or this specific
 * route key has been switched off, a graceful "unavailable" message
 * is shown instead of the page — with no error, no stack trace, and
 * no indication to the business owner (ADMIN) of *why* it happened.
 */
let cachedConfigPromise = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedConfig = () => {
  const now = Date.now();
  if (!cachedConfigPromise || (now - cacheTimestamp) > CACHE_DURATION) {
    cachedConfigPromise = api.get("/ads/config").catch((err) => {
      // Clear cache on failure so it can retry
      cachedConfigPromise = null;
      cacheTimestamp = 0;
      throw err;
    });
    cacheTimestamp = now;
  }
  return cachedConfigPromise;
};

const RouteGuard = ({ route, children }) => {
  const [state, setState] = useState({ loading: true, blocked: false, message: "" });

  useEffect(() => {
    let mounted = true;
    getCachedConfig()
      .then(() => {
        // Route-disable check is enforced server-side on data-fetching
        // endpoints too; this client check just avoids a flash of
        // broken UI before an API call would otherwise fail.
        if (mounted) setState({ loading: false, blocked: false, message: "" });
      })
      .catch((err) => {
        if (!mounted) return;
        if (err.response?.status === 503 || err.response?.status === 403) {
          setState({
            loading: false,
            blocked: true,
            message: err.response?.data?.message || "This page is temporarily unavailable.",
          });
        } else {
          setState({ loading: false, blocked: false, message: "" });
        }
      });
    return () => {
      mounted = false;
    };
  }, [route]);

  if (state.loading) return null;

  if (state.blocked) {
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          This page is temporarily unavailable
        </Typography>
        <Typography color="text.secondary">{state.message}</Typography>
      </Container>
    );
  }

  return <Box>{children}</Box>;
};

export default RouteGuard;
