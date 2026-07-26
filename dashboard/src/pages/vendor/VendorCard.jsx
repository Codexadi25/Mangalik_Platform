import { Box, Card, Typography, Chip, IconButton } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState, useRef } from "react";
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import api from "../../services/api";
import mangalikLogo from "../../assets/Mangalik.png";

const VendorCard = ({ vendor, onEdit, forceSide }) => {
  const qrContainerRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [coupons, setCoupons] = useState([]);

  // Fetch Coupons linked to this vendor for the back of the card
  useEffect(() => {
    if (vendor && vendor._id) {
      api.get(`/vendors/${vendor._id}/coupons`)
        .then(res => setCoupons(res.data.data || []))
        .catch(err => console.error("Failed to load vendor coupons", err));
    }
  }, [vendor]);

  if (!vendor) return null;

  // Front side premium metallic and saffron/red gradients
  const planGradients = {
    Blaze: "linear-gradient(135deg, #ffcc00 0%, #ff6600 50%, #ff3300 100%)", // Yellowish, Saffron, RedOrange
    Platinum: "linear-gradient(135deg, #4b4b4b 0%, #1e1e1e 50%, #000000 100%)", // Metallic Platinum Dark
    Gold: "linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)", // Premium metallic Gold
    Silver: "linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)", // Silver
    default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  };

  // Back side darker shades of the same theme with metallic effects
  const planBackGradients = {
    Blaze: "linear-gradient(135deg, #7a5c00 0%, #662200 50%, #4d1000 100%)", // Dark Saffron/Red-Orange metallic
    Platinum: "linear-gradient(135deg, #2b2b2b 0%, #111111 50%, #000000 100%)", // Dark metallic Platinum
    Gold: "linear-gradient(135deg, #664d1a 0%, #8c6a23 50%, #40300f 100%)", // Dark metallic Gold
    Silver: "linear-gradient(135deg, #4d575e 0%, #78858c 100%)", // Dark Silver
    default: "linear-gradient(135deg, #333f75 0%, #301f44 100%)"
  };

  const planTextColors = {
    Blaze: "#ffffff",
    Platinum: "#ffffff",
    Gold: "#000000",
    Silver: "#000000",
    default: "#ffffff"
  };

  const currentGradient = planGradients[vendor.membershipPlan] || planGradients.default;
  const currentBackGradient = planBackGradients[vendor.membershipPlan] || planBackGradients.default;
  const currentTextColor = planTextColors[vendor.membershipPlan] || planTextColors.default;

  // For back side, text color should be white/light because it uses darker metallic gradients
  const backTextColor = "#ffffff";

  const wavePattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.15' d='M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,165.3C672,160,768,96,864,80C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`;

  const activeSide = forceSide || (isFlipped ? "back" : "front");

  return (
    <Box sx={{ height: 280, position: "relative" }}>
      {activeSide === "front" ? (
        /* Front Side Card */
        <Card
          className="vendor-card-front"
          sx={{
            width: "100%",
            height: "100%",
            p: 3,
            pb: 2, // slightly less padding bottom to accommodate the full-width strip
            backgroundImage: `${wavePattern}, ${currentGradient}`,
            backgroundSize: "cover",
            backgroundPosition: "bottom",
            backgroundRepeat: "no-repeat",
            color: currentTextColor,
            boxShadow: "0 10px 30px rgba(14, 17, 51, 0.2)",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            position: "relative",
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 8, right: 8, bottom: 8, left: 8,
              border: `1px solid ${currentTextColor}30`,
              borderRadius: 2.2,
              pointerEvents: 'none',
              zIndex: 2
            }
          }}
        >
          {/* Background Logo - positioned to be clearly visible in background and centered without text overlapping directly on top */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '50%',
              height: '50%',
              backgroundImage: `url(${mangalikLogo})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: (vendor.membershipPlan === "Blaze" || vendor.membershipPlan === "Platinum") ? 0.8 : 0.85,
              zIndex: 0,
              pointerEvents: 'none',
              mixBlendMode: (vendor.membershipPlan === "Blaze" || vendor.membershipPlan === "Platinum") ? 'normal' : (currentTextColor === "#ffffff" ? 'overlay' : 'multiply'),
              filter: (vendor.membershipPlan === "Blaze" || vendor.membershipPlan === "Platinum") ? 'none' : (currentTextColor === "#ffffff" ? "brightness(0) invert(1)" : "none") 
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 0.5, mb: 0.5, fontFamily: "'Poppins', sans-serif" }}>
                {vendor.user?.name || "Card Holder"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {vendor.businessName}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                label={`${vendor.membershipPlan} Member`} 
                size="small" 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: currentTextColor === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                  color: currentTextColor,
                  border: `1px solid ${currentTextColor}40`,
                }} 
              />
              {!forceSide && (
                <IconButton onClick={() => setIsFlipped(true)} sx={{ color: currentTextColor }} title="Flip Card">
                  <FlipCameraAndroidIcon />
                </IconButton>
              )}
            </Box>
          </Box>
          
          {/* Inverse footer text at the bottom */}
          <Box sx={{ position: 'relative', zIndex: 1, mt: 'auto' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={0.2} sx={{ px: 0.5 }}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>MEMBER ID</Typography>
                <Typography variant="body2" fontWeight={700}>{vendor.referralCode || "PENDING"}</Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>STATUS</Typography>
                <Typography variant="body2" fontWeight={800}>
                  {vendor.isApproved ? "VERIFIED" : "PENDING"}
                </Typography>
              </Box>
            </Box>
            
            {/* White strip below the member's referral code / footer details, filling entire bottom width */}
            <Box 
              sx={{ 
                mx: 0.5, 
                mb: -1.5, 
                pt: 0.5,
                pb: 0.5,
                bgcolor: "transparent", 
                color: currentTextColor === "#ffffff" ? "#ffffff" : "#000000",
                textAlign: "center",
                borderTop: `1px solid ${currentTextColor}30`
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                www.mangalik.store · DHAN LAXMI ENTERPRISES
              </Typography>
            </Box>
          </Box>
        </Card>
      ) : (
        /* Back Side Card - Dark shade with metallic effect */
        <Card
          className="vendor-card-back"
          sx={{
            width: "100%",
            height: "100%",
            p: 2.5,
            backgroundImage: `${wavePattern}, ${currentBackGradient}`,
            backgroundSize: "cover",
            backgroundPosition: "bottom",
            backgroundRepeat: "no-repeat",
            boxShadow: "0 10px 30px rgba(14, 17, 51, 0.2)",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: backTextColor,
            overflow: "hidden",
            position: "relative",
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 12, right: 12, bottom: 12, left: 12,
              border: `1px solid ${backTextColor}20`,
              borderRadius: 2,
              pointerEvents: 'none',
              zIndex: 2
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" gap={1.5} flexGrow={1} sx={{ overflow: "hidden", position: 'relative', zIndex: 1 }}>
            <Box flex={1.3} display="flex" flexDirection="column" sx={{ height: "100%" }}>
              <Typography variant="caption" fontWeight={800} sx={{ mb: 0.5, color: backTextColor, opacity: 0.9, letterSpacing: 0.5 }}>
                ASSIGNED PROMO COUPONS
              </Typography>
              <Box sx={{ flexGrow: 1, overflowY: "auto", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 1.5, bgcolor: "rgba(0,0,0,0.4)", p: 0.5 }}>
                {coupons.length > 0 ? (
                  <table style={{ width: "100%", fontSize: "0.65rem", borderCollapse: "collapse", color: backTextColor }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", opacity: 0.7 }}>
                        <th style={{ padding: "3px" }}>Code</th>
                        <th style={{ padding: "3px" }}>Value</th>
                        <th style={{ padding: "3px" }}>Min Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.slice(0, 5).map((c) => (
                        <tr key={c._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "3px", fontWeight: "bold" }}>{c.code}</td>
                          <td style={{ padding: "3px" }}>{c.type === "flat" ? `₹${c.value}` : `${c.value}%`}</td>
                          <td style={{ padding: "3px" }}>₹{c.minOrderValue || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="caption" sx={{ color: backTextColor, opacity: 0.5 }}>No Coupons Assigned</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box 
              ref={qrContainerRef}
              display="flex" 
              flexDirection="column" 
              alignItems="center"
              justifyContent="center"
              sx={{ bgcolor: "rgba(255,255,255,0.9)", p: 1, borderRadius: 2, border: "1px solid rgba(255,255,255,0.2)", width: 105, height: "100%", color: "#000000" }}
            >
              <Typography sx={{ fontSize: "0.6rem", fontWeight: "bold", mb: 0.5, color: "#000" }}>SCAN TO VISIT</Typography>
              <Box sx={{ width: 75, height: 75, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <QRCodeSVG 
                  value={vendor.referralCode ? `https://mangalik.store/signup?ref=${vendor.referralCode}` : "PENDING"} 
                  size={75} 
                  level={"H"} 
                />
              </Box>
              <Typography variant="caption" fontWeight={800} color="primary.main" sx={{ mt: 0.5, fontSize: "0.7rem" }}>
                {vendor.referralCode || "PENDING"}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1, borderTop: "1px solid rgba(255,255,255,0.1)", pt: 0.8, position: 'relative', zIndex: 1 }}>
            <Typography sx={{ fontSize: "0.6rem", color: backTextColor, opacity: 0.7 }}>
              *Attributed sales automatically calculate commission.
            </Typography>
            {!forceSide && (
              <IconButton onClick={() => setIsFlipped(false)} title="Flip Card" size="small" sx={{ color: backTextColor }}>
                <FlipCameraAndroidIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default VendorCard;
