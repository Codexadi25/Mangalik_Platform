import { createTheme } from "@mui/material/styles";

/**
 * Dashboard theme reuses the Mangalik brand palette (Bhagwa Saffron +
 * White + Z-Black) but is tuned for data-dense admin UI: tighter
 * spacing, a dark Z-Black sidebar for contrast against light content
 * panels, and a "templating engine" feel — every role's dashboard is
 * generated from the same shell + widget components, with sections
 * shown/hidden purely by the role's permission set.
 */
const saffron = { 400: "#FF8F2E", 500: "#FF6F1E", 600: "#E85D0F", 700: "#C44A08" };
const zBlack = { 700: "#202225", 800: "#16171A", 900: "#0D0E10" };

export const dashboardTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: saffron[500], dark: saffron[700] },
    secondary: { main: zBlack[800] },
    background: { default: "#F2F4F7", paper: "#FFFFFF" },
    text: { primary: zBlack[900] },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: { 
          backgroundColor: zBlack[900], 
          color: "#F5F1EC",
          boxShadow: "4px 0 16px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          border: "1px solid rgba(0,0,0,0.04)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${saffron[400]}, ${saffron[600]})`,
          boxShadow: "0 4px 12px rgba(255,111,30,0.2)",
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)"
        }
      }
    }
  },
});

export const dashboardBrand = { saffron, zBlack };
