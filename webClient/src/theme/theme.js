import { createTheme } from "@mui/material/styles";

/**
 * ============================================================
 *  MANGALIK BRAND THEME
 *  Bhagwa (Saffron) — auspicious, spiritual, warm
 *  White — clean, eye-friendly, high readability
 *  Z-Black (deep charcoal, not pure #000) — premium contrast,
 *           used for dark-mode and accents, never harsh on eyes
 * ============================================================
 */

const saffron = {
  50: "#FFF4E8",
  100: "#FFE3C2",
  200: "#FFCB8F",
  300: "#FFA94D",
  400: "#FF8F2E",
  500: "#FF6F1E", // primary brand saffron
  600: "#E85D0F",
  700: "#C44A08",
  800: "#9C3A07",
  900: "#7A2D05",
};

const zBlack = {
  50: "#F2F2F3",
  100: "#D9DADC",
  300: "#86888C",
  500: "#3A3C40",
  700: "#202225",
  800: "#16171A",
  900: "#0D0E10", // Z-Black — soft deep charcoal, never pure black
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: saffron[500], light: saffron[300], dark: saffron[700], contrastText: "#fff" },
    secondary: { main: zBlack[800], contrastText: "#fff" },
    background: { default: "#FFFFFF", paper: "#FFFBF7" },
    text: { primary: zBlack[800], secondary: zBlack[500] },
    divider: saffron[100],
  },
  typography: {
    fontFamily: "'Poppins', 'Noto Sans Devanagari', 'Inter', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          transition: "all 0.3s ease",
          "&:hover": { transform: "translateY(-2px)" }
        },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${saffron[400]}, ${saffron[600]})`,
          boxShadow: "0 8px 20px rgba(255,111,30,0.3)",
          "&:hover": {
            boxShadow: "0 12px 25px rgba(255,111,30,0.4)",
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: { 
          backgroundColor: "rgba(255, 255, 255, 0.8)", 
          backdropFilter: "blur(16px)",
          color: zBlack[800], 
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)" 
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: saffron[400], light: saffron[300], dark: saffron[700], contrastText: zBlack[900] },
    secondary: { main: saffron[200] },
    background: { default: zBlack[900], paper: zBlack[800] },
    text: { primary: "#F5F1EC", secondary: zBlack[100] },
    divider: zBlack[700],
  },
  typography: {
    fontFamily: "'Poppins', 'Noto Sans Devanagari', 'Inter', sans-serif",
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: zBlack[800], color: "#F5F1EC" } },
    },
  },
});

export const brandColors = { saffron, zBlack };
