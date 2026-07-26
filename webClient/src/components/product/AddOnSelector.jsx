import { useState } from "react";
import { Box, Typography, Checkbox, FormControlLabel, Stack, Chip, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

/**
 * AddOnSelector — lets a customer attach related items to a primary
 * product. e.g. "Rudra Abhishek Poojan Samagri Kit" → optional
 * Kalawa, Bhaan, Dhatura, Flowers, Panchamrit Samagri, Charna Amrit
 * Samagri, Mishri, Batasha, etc. Each add-on can be a default-included
 * (free, pre-checked) item or an optional paid extra with its own
 * quantity stepper, up to the catalog-defined maxQuantity.
 */
const AddOnSelector = ({ addOns = [], onChange }) => {
  const [selected, setSelected] = useState(
    addOns.reduce((acc, a) => {
      if (a.isDefaultIncluded) acc[a.product._id] = 1;
      return acc;
    }, {})
  );

  const toggle = (addOn) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[addOn.product._id]) delete next[addOn.product._id];
      else next[addOn.product._id] = 1;
      onChange?.(next);
      return next;
    });
  };

  const updateQty = (addOn, delta) => {
    setSelected((prev) => {
      const current = prev[addOn.product._id] || 1;
      const next = Math.max(1, Math.min(addOn.maxQuantity || 5, current + delta));
      const updated = { ...prev, [addOn.product._id]: next };
      onChange?.(updated);
      return updated;
    });
  };

  if (!addOns.length) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Add Poojan Essentials
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Complete your ritual with these commonly required items.
      </Typography>

      <Stack spacing={1}>
        {addOns.map((a) => {
          const isSelected = !!selected[a.product._id];
          return (
            <Box
              key={a.product._id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid",
                borderColor: isSelected ? "primary.main" : "divider",
                borderRadius: 2,
                px: 1.5,
                py: 1,
              }}
            >
              <FormControlLabel
                control={<Checkbox checked={isSelected} onChange={() => toggle(a)} color="primary" />}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">{a.product.title}</Typography>
                    {a.isDefaultIncluded && <Chip size="small" label="Included" color="success" />}
                    <Typography variant="caption" color="text.secondary">
                      ₹{a.product.basePrice}
                    </Typography>
                  </Stack>
                }
              />
              {isSelected && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <IconButton size="small" onClick={() => updateQty(a, -1)}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography>{selected[a.product._id]}</Typography>
                  <IconButton size="small" onClick={() => updateQty(a, 1)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default AddOnSelector;
