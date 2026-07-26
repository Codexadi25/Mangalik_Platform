import { createTheme } from "@mui/material/styles";

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

export const dashboardTheme = createTheme({
  palette: {
    mode: "light",
    primary: mangalikRed,
    secondary: mangalikNavy,
    background: { default: "#F7F9FC", paper: "#FFFFFF" },
    text: { primary: mangalikNavy.main, secondary: mangalikNavy.light },
    divider: "#EAEAEE",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h2: { fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h3: { fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h4: { fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h5: { fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    h6: { fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: mangalikNavy.main },
    button: { fontWeight: 600, textTransform: "none", fontFamily: "'Inter', sans-serif" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: { 
          backgroundColor: "#FFFFFF", 
          color: mangalikNavy.main,
          boxShadow: "4px 0 24px rgba(14,17,51,0.06)",
          borderRight: "none"
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
            transform: "translateY(-4px)",
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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px", // Pill shape from Mangalik sample
          padding: "8px 24px",
          transition: "all 0.3s ease",
          "&:hover": { transform: "translateY(-2px)" }
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #E33C24 0%, #F7543E 100%)",
          boxShadow: "0 4px 15px rgba(227, 60, 36, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #C62B16 0%, #E33C24 100%)",
            boxShadow: "0 8px 25px rgba(227, 60, 36, 0.4)",
          }
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          color: mangalikNavy.main,
          boxShadow: "0 1px 12px rgba(14,17,51,0.06)",
          borderBottom: "none"
        }
      }
    }
  },
});

export const dashboardBrand = { mangalikRed, mangalikNavy };
