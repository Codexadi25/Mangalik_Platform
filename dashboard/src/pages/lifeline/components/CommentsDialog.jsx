import React from "react";
import { Dialog, DialogTitle, DialogContent, Stack, Box, Typography, TextField, Button, IconButton } from "@mui/material";

const CommentsDialog = ({
  open,
  onClose,
  orderComments,
  comment,
  setComment,
  handleAddComment
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <span style={{ fontWeight: 700 }}>Comments</span>
        <IconButton size="small" onClick={onClose}>✕</IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          {orderComments.map((c, idx) => (
            <Box key={idx} sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2, border: "1px solid #f0f0f0" }}>
              <Typography fontSize={13} fontWeight={600} mb={0.5} sx={{ color: "#333" }}>{c.text}</Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontSize={11} color="text.secondary">{c.author}</Typography>
                <Typography fontSize={11} color="text.secondary">{c.date}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <Box sx={{ borderTop: "1px solid #e8e8e8", pt: 2 }}>
          <TextField
            fullWidth multiline rows={2} size="small"
            placeholder="Start typing your comments..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { fontSize: 13 } }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" color="error" onClick={handleAddComment} sx={{ textTransform: "none", fontSize: 13 }}>
              Add Comment
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsDialog;
