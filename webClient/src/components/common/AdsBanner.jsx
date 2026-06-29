import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import { fetchAdsConfig } from "../../redux/slices/adsSlice";

/**
 * AdsBanner — renders either:
 *  1. A superadmin-defined CUSTOM banner image/link for this slot, OR
 *  2. A Google AdSense unit (the platform DEFAULT), OR
 *  3. Nothing, if the slot/feature has been disabled by superadmin
 *     (e.g. client dues unpaid → entire ad layer or specific slots
 *     can be cut instantly without a code deploy).
 *
 * Every key (AdSense client ID, ad unit IDs, custom banner URLs) is
 * controlled entirely from the backend — nothing is hard-coded here.
 */
const AdsBanner = ({ slotKey, style = {} }) => {
  const dispatch = useDispatch();
  const { config, status } = useSelector((s) => s.ads);

  useEffect(() => {
    if (status === "idle") dispatch(fetchAdsConfig());
  }, [status, dispatch]);

  useEffect(() => {
    if (config?.googleAdsenseEnabled && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (e) {
        // AdSense script not yet ready — safe to ignore.
      }
    }
  }, [config]);

  if (!config) return null;

  const slot = config.adSlots?.[slotKey];

  // Slot explicitly disabled by superadmin.
  if (slot && slot.enabled === false) return null;

  // Custom banner override for this slot.
  if (slot && slot.type === "custom" && config.customBannersEnabled) {
    return (
      <Box sx={{ width: "100%", textAlign: "center", ...style }}>
        <a href={slot.customLinkUrl} target="_blank" rel="noopener noreferrer sponsored">
          <img
            src={slot.customImageUrl}
            alt="Mangalik sponsored banner"
            style={{ maxWidth: "100%", borderRadius: 8 }}
          />
        </a>
      </Box>
    );
  }

  // Default: Google AdSense.
  if (config.googleAdsenseEnabled) {
    return (
      <Box sx={{ width: "100%", textAlign: "center", ...style }}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={config.adsenseClientId}
          data-ad-slot={slot?.adUnitId || ""}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </Box>
    );
  }

  return null;
};

export default AdsBanner;
