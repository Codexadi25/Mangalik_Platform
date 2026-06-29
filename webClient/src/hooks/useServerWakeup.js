import { useEffect, useRef } from "react";
import api from "../services/api";

/**
 * useServerWakeup Hook
 * 
 * Prevents server cold-starts on PaaS platforms (Render, Heroku, etc.)
 * by firing lightweight health-check pings to the backend upon detecting
 * natural user interaction (scrolling, mouse movement, touch).
 * 
 * It heavily debounces this behavior to prevent spamming the backend,
 * ensuring it only fires a few requests per session when the user is active.
 */
const useServerWakeup = () => {
  const hasWokenUpRef = useRef(false);

  useEffect(() => {
    // If we've already done the wakeup routine in this session, do nothing.
    if (hasWokenUpRef.current) return;

    const handleUserActivity = () => {
      if (hasWokenUpRef.current) return;
      hasWokenUpRef.current = true;

      // Fire 2-3 quick requests to ensure load balancers route it and wake up instances.
      const pingServer = async () => {
        try {
          await Promise.all([
            api.get("/health"),
            new Promise((resolve) => setTimeout(resolve, 300)).then(() => api.get("/health")),
            new Promise((resolve) => setTimeout(resolve, 800)).then(() => api.get("/health"))
          ]);
        } catch (error) {
          // Silent catch: we don't care if it fails, it's just a wakeup ping.
        }
      };

      pingServer();

      // Clean up event listeners immediately after firing
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };

    // Attach passive event listeners
    window.addEventListener("scroll", handleUserActivity, { passive: true });
    window.addEventListener("mousemove", handleUserActivity, { passive: true });
    window.addEventListener("touchstart", handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, []);
};

export default useServerWakeup;
