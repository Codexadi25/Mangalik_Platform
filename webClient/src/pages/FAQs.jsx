import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Helmet } from "react-helmet-async";

const FAQs = () => {
  const faqData = [
    {
      q: "What is Mangalik?",
      a: "Mangalik is an e-commerce platform dedicated to providing authentic A-Z Poojan Samagri for all Hindu rituals, yagnas, and hawans directly to your doorstep."
    },
    {
      q: "How can I track my order?",
      a: "Once your order is shipped, you will receive a tracking link via email and SMS. You can also view the status in the 'My Orders' section."
    },
    {
      q: "Are the pooja items authentic?",
      a: "Absolutely. We source our materials directly from trusted suppliers and authentic locations like Varanasi to ensure 100% purity."
    },
    {
      q: "Can I customize a Poojan Kit?",
      a: "Yes! Many of our products allow you to select add-ons (like extra Kalawa, Bhaan, or Dhatura) to tailor the kit to your specific ritual needs."
    }
  ];

  return (
    <>
      <Helmet>
        <title>FAQs | Mangalik</title>
        <meta name="description" content="Frequently Asked Questions about Mangalik orders, delivery, and authentic pooja samagri." />
      </Helmet>
      <Box sx={{ bgcolor: "secondary.main", color: "#fff", py: 8, textAlign: "center" }}>
        <Container>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Frequently Asked Questions
          </Typography>
        </Container>
      </Box>
      <Container sx={{ py: 6, maxWidth: "md" }}>
        {faqData.map((faq, i) => (
          <Accordion key={i} sx={{ mb: 2, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "none" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{faq.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </>
  );
};

export default FAQs;
