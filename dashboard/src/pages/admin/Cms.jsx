import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, MenuItem, Select } from "@mui/material";
import { toast } from "react-toastify";
import api from "../../services/api";

const PAGES = ["about_us", "contact_us", "help_support", "terms_and_conditions", "privacy_policy", "refund_policy", "shipping_policy"];

const Cms = () => {
  const [key, setKey] = useState("about_us");
  const [page, setPage] = useState({ title: "", content: "" });

  useEffect(() => {
    api.get(`/cms/${key}`).then(({ data }) => setPage(data.data)).catch(() => setPage({ title: "", content: "" }));
  }, [key]);

  const save = async () => {
    try {
      await api.patch(`/cms/${key}`, { title: page.title, content: page.content });
      toast.success("Page updated.");
    } catch {
      toast.error("Failed to update page.");
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Content (CMS)</Typography>
      <Select value={key} onChange={(e) => setKey(e.target.value)} sx={{ mb: 2, minWidth: 240 }}>
        {PAGES.map((p) => <MenuItem key={p} value={p}>{p.replace(/_/g, " ")}</MenuItem>)}
      </Select>
      <TextField fullWidth label="Title" value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} sx={{ mb: 2 }} />
      <TextField fullWidth multiline rows={10} label="Content (HTML)" value={page.content} onChange={(e) => setPage({ ...page, content: e.target.value })} sx={{ mb: 2 }} />
      <Button variant="contained" onClick={save}>Save</Button>
    </Box>
  );
};

export default Cms;
