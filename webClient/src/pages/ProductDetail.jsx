import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Container, Grid, Box, Typography, Button, Chip, Stack, Divider } from "@mui/material";
import api from "../services/api";
import AddOnSelector from "../components/product/AddOnSelector";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState({});

  useEffect(() => {
    api.get(`/products/${slug}`).then(({ data }) => setProduct(data.data));
  }, [slug]);

  const handleAddToCart = async () => {
    const addOnsPayload = Object.entries(selectedAddOns).map(([product, quantity]) => ({ product, quantity }));
    await dispatch(addToCart({ productId: product._id, quantity: qty, addOns: addOnsPayload }));
    toast.success("Added to cart!");
  };

  if (!product) return null;

  return (
    <>
      <Helmet>
        <title>{product.seo?.metaTitle || `${product.title} | Mangalik`}</title>
        <meta name="description" content={product.seo?.metaDescription || product.shortDescription} />
        <link rel="canonical" href={product.seo?.canonicalUrl || `https://www.mangalik.store/products/${product.slug}`} />
      </Helmet>

      <Container sx={{ py: 5 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={product.images?.[0]?.url || "/placeholder-product.png"}
              alt={product.images?.[0]?.alt || product.title}
              sx={{ width: "100%", borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {product.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {product.poojaTypes?.map((t) => <Chip key={t} label={t} size="small" />)}
            </Stack>
            <Typography variant="h5" color="primary.main" fontWeight={700}>
              ₹{product.basePrice}{" "}
              {product.mrp && product.mrp > product.basePrice && (
                <Typography component="span" sx={{ textDecoration: "line-through", color: "text.secondary", fontSize: 16, ml: 1 }}>
                  ₹{product.mrp}
                </Typography>
              )}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              {product.description}
            </Typography>

            <AddOnSelector addOns={product.addOns} onChange={setSelectedAddOns} />

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</Button>
              <Typography>{qty}</Typography>
              <Button variant="outlined" onClick={() => setQty((q) => q + 1)}>+</Button>
              <Button variant="contained" size="large" onClick={handleAddToCart} disabled={product.stock === 0}>
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ProductDetail;
