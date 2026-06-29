import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button, Box } from "@mui/material";
import { fetchProducts } from "../redux/slices/productSlice";
import AdsBanner from "../components/common/AdsBanner";

const ProductListing = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { items, status } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ category: searchParams.get("category"), q: searchParams.get("q") }));
  }, [dispatch, searchParams]);

  return (
    <>
      <Helmet>
        <title>Shop Poojan Samagri Online | Mangalik</title>
        <meta name="description" content="Browse the full Mangalik catalog of pooja, hawan, and yagna samagri — kits, idols, incense, and ritual add-ons." />
      </Helmet>

      <Box sx={{ background: "linear-gradient(135deg, #FFF8F0 0%, #FFE8D1 100%)", py: 6, mb: 4, textAlign: "center" }}>
        <Container>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Sacred Catalog
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Explore our complete collection of authentic pooja, hawan, and yagna samagri.
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 2 }}>

        {status === "loading" && <Typography color="text.secondary">Loading products…</Typography>}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {items.map((p) => (
            <Grid item xs={12} sm={6} md={3} key={p._id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={p.images?.[0]?.url || "/placeholder-product.png"}
                  alt={p.images?.[0]?.alt || p.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {p.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {p.shortDescription}
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    ₹{p.basePrice}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={`/products/${p.slug}`}
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 1.5 }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {items.length === 0 && status === "succeeded" && (
          <Typography color="text.secondary" sx={{ mt: 4 }}>
            No products found.
          </Typography>
        )}

        <Box sx={{ mt: 4 }}>
          <AdsBanner slotKey="listing_bottom" />
        </Box>
      </Container>
    </>
  );
};

export default ProductListing;
