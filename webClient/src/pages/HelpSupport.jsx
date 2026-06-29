import { Container, Typography, Box, Paper, Button } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";

const HelpSupport = () => {
  return (
    <>
      <Helmet>
        <title>Help & Support | Mangalik</title>
      </Helmet>
      <Box sx={{ bgcolor: "secondary.main", color: "#fff", py: 8, textAlign: "center" }}>
        <Container>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Help & Support
          </Typography>
        </Container>
      </Box>
      <Container sx={{ py: 6, maxWidth: "md", textAlign: "center" }}>
        <Paper elevation={0} sx={{ p: 6, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            How can we assist you today?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Our support team is available 24/7 to help you with your orders, custom pooja kits, or any other inquiries.
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button variant="contained" component={RouterLink} to="/contact" size="large">
              Contact Support
            </Button>
            <Button variant="outlined" component={RouterLink} to="/faqs" size="large">
              Read FAQs
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default HelpSupport;
