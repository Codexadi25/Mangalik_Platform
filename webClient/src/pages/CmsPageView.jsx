import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Container, Typography, Box } from "@mui/material";
import api from "../services/api";

/**
 * Generic CMS-driven page renderer. Powers Terms & Conditions,
 * Privacy Policy, Refund Policy, Shipping Policy, About Us — all
 * content is editable by the ADMIN from the dashboard and can be
 * route-disabled by SUPERADMIN without a frontend code change.
 */
const CmsPageView = ({ pageKey }) => {
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get(`/cms/${pageKey}`).then(({ data }) => setPage(data.data)).catch(() => setPage(null));
  }, [pageKey]);

  if (!page) return null;

  return (
    <>
      <Helmet>
        <title>{page.seo?.metaTitle || `${page.title} | Mangalik`}</title>
        <meta name="description" content={page.seo?.metaDescription || page.title} />
      </Helmet>
      <Container sx={{ py: 5, maxWidth: 800 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>{page.title}</Typography>
        <Box sx={{ "& p": { mb: 2, lineHeight: 1.8 } }} dangerouslySetInnerHTML={{ __html: page.content }} />
      </Container>
    </>
  );
};

export default CmsPageView;
