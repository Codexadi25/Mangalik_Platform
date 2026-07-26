import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, TextField, IconButton, Fade } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";

export default function LaxmiWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi, I'm Laxmi, your AI assistant. How can I help you manage orders today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 800); // 800ms threshold for scroll stop
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // AI Logic Simulation
    setTimeout(() => {
      let response = "I have raised a ticket for your query. Our team will respond within 24-48 hrs.";

      // Basic Regex pattern to detect order ID
      const orderMatch = newMsg.text.match(/(?:order\s*id|#)?(\d{8,12})/i);
      if (orderMatch) {
        response = `I checked the details for Order #${orderMatch[1]}. The status is currently Delivered.`;
      } else if (newMsg.text.toLowerCase().includes("ticket")) {
        response = "Your active tickets are currently being processed by the Support Agents.";
      }

      setMessages((prev) => [...prev, { text: response, sender: "bot" }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button (Shifted upward on mobile to bottom: 100px, hides on scroll as sleek bar) */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          bottom: { xs: 100, md: 24 }, // Shifted upward on mobile to prevent overlapping bottom nav
          right: { xs: isScrolling ? -24 : 16, md: 24 }, // Sleek bar hiding off-screen when scrolling
          opacity: { xs: isScrolling ? 0.3 : 1, md: 1 }, // Fades slightly when scrolling
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          backgroundColor: "primary.main",
          color: "white",
          boxShadow: 3,
          "&:hover": { backgroundColor: "primary.dark" },
          display: open ? "none" : "flex",
          zIndex: 9998,
        }}
        size="large"
      >
        <SmartToyIcon />
      </IconButton>

      {/* Chat Window */}
      <Fade in={open}>
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: { xs: 100, md: 24 }, // Shifted upward on mobile to prevent overlap
            right: { xs: 16, md: 24 },
            width: { xs: "calc(100% - 32px)", sm: 350 },
            height: 500,
            display: open ? "flex" : "none",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, backgroundColor: "primary.main", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box display="flex" alignItems="center" gap={1}>
              <SmartToyIcon />
              <Typography variant="subtitle1" fontWeight="bold">
                Laxmi AI Assistant
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "white" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1, backgroundColor: "#f9f9f9" }}>
            {messages.map((msg, i) => (
              <Box
                key={i}
                alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
                sx={{
                  backgroundColor: msg.sender === "user" ? "primary.light" : "white",
                  color: msg.sender === "user" ? "primary.contrastText" : "text.primary",
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: "80%",
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            ))}
          </Box>

          {/* Input */}
          <Box sx={{ p: 1.5, borderTop: "1px solid #eee", display: "flex", gap: 1, backgroundColor: "white" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask Laxmi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <IconButton color="primary" onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
