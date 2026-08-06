import React from "react";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PhoneIcon from "@mui/icons-material/Phone";

const CopyChip = ({ text }) => (
  <Tooltip title="Copy">
    <IconButton
      size="small"
      sx={{ ml: 0.5 }}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
      }}
    >
      <ContentCopyIcon sx={{ fontSize: 13, color: "#888" }} />
    </IconButton>
  </Tooltip>
);

const EntityCard = ({ icon, type, id, name, phone, badge, extraLine, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      p: 2,
      borderRight: "1px solid #f0f0f0",
      cursor: onClick ? "pointer" : "default",
      "&:hover": onClick ? { bgcolor: "#fafffe" } : {}
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
      {icon}
      <Typography fontSize={10} color="#888" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
        {type}
      </Typography>
      {id && <Typography fontSize={10} color="#bbb" ml={0.5}>#{id}</Typography>}
      {id && <CopyChip text={id} />}
    </Box>
    <Typography fontWeight={700} fontSize={14} mb={0.5}>{name || "—"}</Typography>
    {phone && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <PhoneIcon sx={{ fontSize: 12, color: "#888" }} />
        <Typography fontSize={12} color="#666" sx={{ letterSpacing: 0.5 }}>
          {phone}
        </Typography>
      </Box>
    )}
    {badge && <Box mt={0.5}>{badge}</Box>}
    {extraLine}
  </Box>
);

export default EntityCard;
export { CopyChip };
