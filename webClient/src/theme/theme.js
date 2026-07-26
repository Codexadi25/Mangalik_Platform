import { createTheme } from "@mui/material/styles";

/**
 * ============================================================
 *  MANGALIK BRAND THEME (From UI Sample)
 *  Primary — #E33C24 (Vibrant Red/Orange)
 *  Secondary / Text — #0E1133 (Deep Navy)
 *  Background — #F7F9FC
 * ============================================================
 */

const mangalikRed = {
  main: "#E33C24",
  light: "#F7543E",
  dark: "#C62B16",
  contrastText: "#FFFFFF",
};

const mangalikNavy = {
  main: "#0E1133",
  light: "#5E6282", // muted text
  dark: "#05071A",
  contrastText: "#FFFFFF",
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: mangalikRed,
    secondary: mangalikNavy,
    background: { default: "#FFFFFF", paper: "#F7F9FC" },
    text: { primary: mangalikNavy.main, secondary: mangalikNavy.light },
    divider: "#EAEAEE",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    button: { fontWeight: 600, textTransform: "none", fontFamily: "'Inter', sans-serif" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px", // Pill shape from Mangalik sample
          padding: "10px 28px",
          transition: "all 0.3s ease",
          "&:hover": { transform: "translateY(-2px)" }
        },
        containedPrimary: {
          boxShadow: "0 4px 15px rgba(227, 60, 36, 0.3)",
          "&:hover": {
            boxShadow: "0 8px 25px rgba(227, 60, 36, 0.4)",
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "24px",
          background: "#FFFFFF",
          boxShadow: "0 10px 30px rgba(14, 17, 51, 0.05)",
          transition: "all 0.3s ease",
          border: "none",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 15px 40px rgba(14, 17, 51, 0.08)",
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 8px 25px rgba(14, 17, 51, 0.04)",
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: { 
          backgroundColor: "rgba(255, 255, 255, 0.9)", 
          backdropFilter: "blur(16px)",
          color: mangalikNavy.main, 
          boxShadow: "0 1px 8px rgba(14,17,51,0.06)" 
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: mangalikRed,
    secondary: { main: "#FFFFFF", contrastText: mangalikNavy.main },
    background: { default: mangalikNavy.dark, paper: mangalikNavy.main },
    text: { primary: "#FFFFFF", secondary: "#A0A4B8" },
    divider: "rgba(255,255,255,0.1)",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    button: { fontWeight: 600, textTransform: "none", fontFamily: "'Inter', sans-serif" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: "50px", padding: "10px 28px", transition: "all 0.3s ease" }
      }
    },
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: mangalikNavy.main, color: "#FFFFFF" } },
    },
  },
});

export const brandColors = { mangalikRed, mangalikNavy };
