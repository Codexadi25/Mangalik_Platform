import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Container, Grid, Box, Typography, Button, Chip, Stack, Divider } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import api from "../services/api";
import AddOnSelector from "../components/product/AddOnSelector";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist } from "../redux/slices/userSlice";
import { toast } from "react-toastify";
import { getProductImageUrl } from "../utils/imageHelper";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wishlist } = useSelector((s) => s.user);
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

  const handleBuyNow = async () => {
    const addOnsPayload = Object.entries(selectedAddOns).map(([product, quantity]) => ({ product, quantity }));
    await dispatch(addToCart({ productId: product._id, quantity: qty, addOns: addOnsPayload }));
    navigate("/checkout");
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
              src={getProductImageUrl(product.images?.[0]?.url)}
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

            {product.whatsInTheBox && product.whatsInTheBox.length > 0 && (
              <Box sx={{ mt: 3, border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "#fafafa" }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  📦 What's in the Box (Included Items):
                </Typography>
                <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse", marginTop: "8px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e0e0e0", textAlign: "left", color: "#666" }}>
                      <th style={{ padding: "6px 0" }}>Item Description</th>
                      <th style={{ padding: "6px 0", textAlign: "center" }}>Qty</th>
                      <th style={{ padding: "6px 0", textAlign: "right" }}>GST Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.whatsInTheBox.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "6px 0", fontWeight: 500 }}>{item.itemName}</td>
                        <td style={{ padding: "6px 0", textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ padding: "6px 0", textAlign: "right" }}>{item.gstRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}

            <AddOnSelector addOns={product.addOns} onChange={setSelectedAddOns} />

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</Button>
              <Typography>{qty}</Typography>
              <Button variant="outlined" onClick={() => setQty((q) => q + 1)}>+</Button>
              <Button variant="contained" size="large" onClick={handleAddToCart} disabled={product.stock === 0}>
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button variant="contained" color="secondary" size="large" onClick={handleBuyNow} disabled={product.stock === 0}>
                {product.stock === 0 ? "Out of Stock" : "Buy Now"}
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => dispatch(toggleWishlist(product._id))}
                sx={{ minWidth: 56, px: 0 }}
              >
                {wishlist?.some(item => (item._id || item) === product._id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ProductDetail;
