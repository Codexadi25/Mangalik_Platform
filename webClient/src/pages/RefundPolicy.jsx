import { Container, Typography, Paper } from "@mui/material";
import { Helmet } from "react-helmet-async";

const RefundPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy | Mangalik</title>
      </Helmet>
      <Container sx={{ py: 6, maxWidth: "md" }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Refund & Cancellation Policy
        </Typography>
        
        <Paper elevation={0} sx={{ p: 4, mt: 4, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Cancellations</Typography>
          <Typography color="text.secondary" paragraph>
            Orders can be cancelled within 2 hours of placement. Once processed for shipping, cancellations are no longer permitted.
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>Refunds</Typography>
          <Typography color="text.secondary" paragraph>
            If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with photographic evidence. We will process a replacement or full refund to your original payment method within 5-7 business days.
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default RefundPolicy;
