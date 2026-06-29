import { Container, Typography, Box, Paper, Grid } from "@mui/material";
import { Helmet } from "react-helmet-async";

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Mangalik</title>
        <meta name="description" content="Learn about Mangalik, the authentic source for A-Z Poojan Samagri, bringing devotion to your doorstep." />
      </Helmet>
      <Box sx={{ bgcolor: "secondary.main", color: "#fff", py: 8, textAlign: "center" }}>
        <Container>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            About Mangalik
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, maxWidth: 600, mx: "auto" }}>
            Preserving Tradition in the Z+ ERA
          </Typography>
        </Container>
      </Box>
      <Container sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" color="primary.main" fontWeight={700} gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Mangalik was born out of a deep reverence for our rich spiritual heritage. In today's fast-paced world, finding pure, authentic, and complete samagri for poojas, yagnas, and hawans can be challenging. Our mission is to bridge this gap by delivering A-Z Poojan Samagri directly to your doorstep.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We ensure that every item you receive is sourced with purity and packed with devotion, so your spiritual practices remain unhindered and profoundly authentic.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, bgcolor: "rgba(235, 107, 34, 0.05)", borderRadius: 4, border: "1px solid rgba(235, 107, 34, 0.2)" }}>
              <Typography variant="h5" color="primary.main" fontWeight={700} gutterBottom>
                Why Choose Us?
              </Typography>
              <ul>
                <li><Typography color="text.secondary">100% Authentic and Pure Ingredients</Typography></li>
                <li><Typography color="text.secondary">Curated Kits for specific rituals (e.g., Rudrabhishek)</Typography></li>
                <li><Typography color="text.secondary">Fast, reliable, and secure delivery</Typography></li>
                <li><Typography color="text.secondary">Dedicated customer support for all your queries</Typography></li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AboutUs;
