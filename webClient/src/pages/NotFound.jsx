import { Container, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const NotFound = () => (
  <Container sx={{ py: 10, textAlign: "center" }}>
    <Typography variant="h2" fontWeight={800} color="primary.main">404</Typography>
    <Typography variant="h6" sx={{ mb: 3 }}>Page not found.</Typography>
    <Button component={RouterLink} to="/" variant="contained">Back to Home</Button>
  </Container>
);

export default NotFound;
