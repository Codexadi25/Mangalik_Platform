import { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import api from "../../services/api";

const Referrals = () => {
  const [partner, setPartner] = useState(null);
  useEffect(() => { api.get("/sales-partners/me").then(({ data }) => setPartner(data.data)); }, []);
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Referral Links</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Your referral code: <b>{partner?.referralCode || "—"}</b></Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Share: https://www.mangalik.store/?ref={partner?.referralCode}
        </Typography>
      </Paper>
    </Box>
  );
};
export default Referrals;
