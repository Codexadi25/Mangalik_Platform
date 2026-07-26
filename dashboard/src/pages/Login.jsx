import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Button, TextField, Paper } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { toast } from "react-toastify";
import { loginWithGoogle, loginWithEmail } from "../services/firebase";
import { firebaseLoginThunk, localLoginThunk } from "../redux/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const completeLogin = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    await dispatch(firebaseLoginThunk(idToken)).unwrap();
    const returnUrl = sessionStorage.getItem("returnUrl") || "/";
    sessionStorage.removeItem("returnUrl");
    navigate(returnUrl);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      await completeLogin(result.user);
      toast.success("Welcome back!");
    } catch {
      toast.error("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalAuth = async () => {
    if (!email || !password) {
      toast.warning("Please fill in email and password");
      return;
    }
    setLoading(true);
    try {
      await dispatch(localLoginThunk({ email, password })).unwrap();
      const returnUrl = sessionStorage.getItem("returnUrl") || "/";
      sessionStorage.removeItem("returnUrl");
      navigate(returnUrl);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0E1133 0%, #1c215e 50%, #E33C24 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientFlow 15s ease infinite",
        py: 4,
        px: 2,
        "@keyframes gradientFlow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: "28px",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.01)",
            },
          }}
        >
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                fontFamily: "'Fredoka', sans-serif",
                background: "linear-gradient(135deg, #E33C24 0%, #0E1133 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              मंगलिक
            </Typography>
            <Typography variant="h5" fontWeight={700} color="secondary.main" sx={{ mb: 1 }}>
              Dashboard Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Secure role-based management dashboard
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogle}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: "16px",
              borderColor: "rgba(14, 17, 51, 0.2)",
              color: "secondary.main",
              fontWeight: 700,
              fontSize: "0.95rem",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "secondary.main",
                background: "rgba(14, 17, 51, 0.04)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Continue with Google
          </Button>

          <Box
            sx={{
              my: 4,
              display: "flex",
              alignItems: "center",
              "&::before, &::after": {
                content: '""',
                flex: 1,
                borderBottom: "1px solid rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography variant="body2" sx={{ px: 2, color: "text.secondary", fontWeight: 500 }}>
              Or use local server credentials
            </Typography>
          </Box>

          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                sx: { borderRadius: "16px" },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                sx: { borderRadius: "16px" },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={handleLocalAuth}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.8,
                borderRadius: "16px",
                fontSize: "1rem",
                fontWeight: 700,
                textTransform: "none",
                background: "linear-gradient(135deg, #E33C24 0%, #F7543E 100%)",
                boxShadow: "0 8px 25px rgba(227, 60, 36, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #C62B16 0%, #E33C24 100%)",
                  boxShadow: "0 10px 30px rgba(227, 60, 36, 0.4)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Sign In to Server
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
