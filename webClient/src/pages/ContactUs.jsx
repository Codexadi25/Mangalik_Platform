import { Container, Typography, Box, Paper, TextField, Button, Grid } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";

const ContactUs = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Your message has been sent. We will get back to you shortly!");
    e.target.reset();
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Mangalik</title>
        <meta name="description" content="Get in touch with Mangalik for support, inquiries, or bulk orders of Poojan Samagri." />
      </Helmet>
      <Box sx={{ bgcolor: "secondary.main", color: "#fff", py: 8, textAlign: "center" }}>
        <Container>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, maxWidth: 600, mx: "auto" }}>
            We're here to help you with your spiritual journey.
          </Typography>
        </Container>
      </Box>
      <Container sx={{ py: 6, maxWidth: "md" }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                Office Address
              </Typography>
              <Typography color="text.secondary">
                Mangalik Spiritual Store<br />
                Varanasi, Uttar Pradesh, India
              </Typography>
            </Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                Email & Phone
              </Typography>
              <Typography color="text.secondary">
                support@mangalik.store<br />
                +91 98765 43210
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 4, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4 }}>
              <form onSubmit={handleSubmit}>
                <TextField fullWidth label="Full Name" required sx={{ mb: 3 }} />
                <TextField fullWidth label="Email Address" type="email" required sx={{ mb: 3 }} />
                <TextField fullWidth label="Subject" required sx={{ mb: 3 }} />
                <TextField fullWidth label="Message" multiline rows={4} required sx={{ mb: 3 }} />
                <Button type="submit" variant="contained" size="large" fullWidth>
                  Send Message
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ContactUs;
