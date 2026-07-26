import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { fetchCoupons, createCoupon, toggleCoupon } from "../../redux/slices/couponSlice";

const Coupons = () => {
  const dispatch = useDispatch();
  const { coupons, isLoading } = useSelector((s) => s.coupon);
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ code: "", type: "percentage", value: "", minOrderValue: "" });

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const handleSubmit = () => {
    dispatch(createCoupon(formData));
    setOpen(false);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h5" fontWeight={700}>Promo Codes</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Create Coupon</Button>
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Min Order</TableCell>
              <TableCell>Used</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c._id}>
                <TableCell fontWeight={600}>{c.code}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell>{c.type === "flat" ? "₹" : ""}{c.value}{c.type === "percentage" ? "%" : ""}</TableCell>
                <TableCell>₹{c.minOrderValue}</TableCell>
                <TableCell>{c.usedCount}</TableCell>
                <TableCell>
                  <Switch checked={c.isActive} onChange={() => dispatch(toggleCoupon(c._id))} color="primary" />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No coupons found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Promo Code</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField label="Coupon Code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
          <TextField select label="Discount Type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <MenuItem value="percentage">Percentage (%)</MenuItem>
            <MenuItem value="flat">Flat Amount (₹)</MenuItem>
          </TextField>
          <TextField type="number" label="Discount Value" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} />
          <TextField type="number" label="Min Order Value" value={formData.minOrderValue} onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Coupons;
