import { Container, Typography, Box, Paper } from "@mui/material";
import { Helmet } from "react-helmet-async";

const TermsAndConditions = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Mangalik</title>
      </Helmet>
      <Container sx={{ py: 6, maxWidth: "md" }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Terms and Conditions
        </Typography>
        <Typography color="text.secondary" gutterBottom>Last updated: October 2026</Typography>
        
        <Paper elevation={0} sx={{ p: 4, mt: 4, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>1. Introduction</Typography>
          <Typography color="text.secondary" paragraph>
            Welcome to Mangalik. By accessing www.mangalik.store, you agree to be bound by these terms and conditions.
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>2. Use of the Platform</Typography>
          <Typography color="text.secondary" paragraph>
            You must be at least 18 years old to use our services. The platform is intended for the purchase of religious goods and related services.
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>3. Product Descriptions</Typography>
          <Typography color="text.secondary" paragraph>
            We attempt to be as accurate as possible regarding product descriptions, but do not warrant that descriptions are error-free. Authentic pooja items may vary slightly in physical appearance due to natural variations.
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>4. Limitation of Liability</Typography>
          <Typography color="text.secondary" paragraph>
            Mangalik shall not be liable for any indirect, incidental, or consequential damages arising out of the use of our services or products.
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default TermsAndConditions;
