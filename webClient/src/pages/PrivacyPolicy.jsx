import { Container, Typography, Paper } from "@mui/material";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Mangalik</title>
      </Helmet>
      <Container sx={{ py: 6, maxWidth: "md" }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Privacy Policy
        </Typography>
        <Typography color="text.secondary" gutterBottom>Last updated: October 2026</Typography>
        
        <Paper elevation={0} sx={{ p: 4, mt: 4, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Information Collection</Typography>
          <Typography color="text.secondary" paragraph>
            We collect personal information necessary to process your orders, such as your name, email, and shipping address.
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>Data Security</Typography>
          <Typography color="text.secondary" paragraph>
            Mangalik uses industry-standard encryption to protect your data. We do not store full credit card details on our servers.
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default PrivacyPolicy;
