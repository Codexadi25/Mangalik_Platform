import { Helmet } from "react-helmet-async";
import { Container, Box, Typography, Grid, Button, Card, CardContent } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AdsBanner from "../components/common/AdsBanner";

const featureCategories = [
  { name: "Pooja Samagri Kits", slug: "pooja-samagri-kits" },
  { name: "Hawan & Yagna Items", slug: "hawan-yagna-items" },
  { name: "Idols & Murtis", slug: "idols-murtis" },
  { name: "Incense & Dhoop", slug: "incense-dhoop" },
  { name: "Festival Specials", slug: "festival-specials" },
  { name: "Add-On Essentials", slug: "add-on-essentials" },
];

const Home = () => (
  <>
    <Helmet>
      <title>Mangalik — A-Z Poojan Samagri Online | Hawan, Yagna & Pooja Kits</title>
      <meta
        name="description"
        content="Shop authentic poojan samagri online at Mangalik — Rudra Abhishek kits, hawan items, idols, incense, and festival specials. Fast, trusted, doorstep delivery across India."
      />
      <link rel="canonical" href="https://www.mangalik.store/" />
    </Helmet>

    {/* ---------- Hero ---------- */}
    <Box
      sx={{
        position: "relative",
        background: "linear-gradient(135deg, #FFF8F0 0%, #FFE8D1 100%)",
        py: { xs: 8, md: 14 },
        overflow: "hidden",
      }}
    >
      <Container sx={{ position: "relative", zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                animation: "fade-in-up 0.8s ease-out forwards",
                "@keyframes fade-in-up": {
                  "0%": { opacity: 0, transform: "translateY(20px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" }
                }
              }}
            >
              <Typography variant="h2" fontWeight={800} gutterBottom sx={{ lineHeight: 1.2 }}>
                A-Z Poojan Samagri, <br/>
                <Box component="span" sx={{ 
                  background: "-webkit-linear-gradient(45deg, #FF6F1E, #E85D0F)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>Delivered with Devotion</Box>
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: "600px", lineHeight: 1.6 }}>
                From Rudra Abhishek to Griha Pravesh — every sacred item for every ritual,
                sourced with purity and shipped across India.
              </Typography>
              <Button component={RouterLink} to="/products" variant="contained" size="large" sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}>
                Shop Poojan Samagri
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: { xs: "none", md: "block" } }}>
             <Box
               component="img"
               src="https://images.unsplash.com/photo-1594240722302-3c4ba73c4f74?q=80&w=800&auto=format&fit=crop"
               alt="Pooja Samagri"
               sx={{
                 width: "100%",
                 borderRadius: "24px",
                 boxShadow: "0 20px 50px rgba(255,111,30,0.15)",
                 animation: "float 6s ease-in-out infinite",
                 "@keyframes float": {
                   "0%": { transform: "translateY(0px)" },
                   "50%": { transform: "translateY(-15px)" },
                   "100%": { transform: "translateY(0px)" }
                 }
               }}
             />
          </Grid>
        </Grid>
      </Container>
      
      {/* Decorative Blur Circles */}
      <Box sx={{
        position: "absolute", top: "-10%", right: "-5%", width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(255,111,30,0.1) 0%, rgba(255,255,255,0) 70%)", zIndex: 1
      }} />
    </Box>

    <Container sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom align="center" sx={{ mb: 5 }}>
        Shop by Category
      </Typography>
      <Grid container spacing={3}>
        {featureCategories.map((c, i) => (
          <Grid item xs={6} sm={4} md={4} key={c.slug}>
            <Card
              component={RouterLink}
              to={`/products?category=${c.slug}`}
              sx={{ 
                textDecoration: "none", 
                textAlign: "center",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                p: 3,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: `fade-in-up 0.5s ease-out ${(i * 0.1)}s both`,
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {c.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>

    <Container sx={{ pb: 6 }}>
      <AdsBanner slotKey="home_mid" />
    </Container>
  </>
);

export default Home;
