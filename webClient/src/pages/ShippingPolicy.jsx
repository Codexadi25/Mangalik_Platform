import { Container, Typography, Paper } from "@mui/material";
import { Helmet } from "react-helmet-async";

const ShippingPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Shipping Policy | Mangalik</title>
      </Helmet>
      <Container sx={{ py: 6, maxWidth: "md" }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Shipping Policy
        </Typography>
        
        <Paper elevation={0} sx={{ p: 4, mt: 4, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Processing Time</Typography>
          <Typography color="text.secondary" paragraph>
            All standard pooja kits are processed within 24 hours. Custom kits or bulk orders may take 48-72 hours to prepare.
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>Delivery Times</Typography>
          <Typography color="text.secondary" paragraph>
            Standard delivery takes 3-5 business days across India. Expedited delivery (1-2 days) is available for select pin codes at an additional charge.
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default ShippingPolicy;
