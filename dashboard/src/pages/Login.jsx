import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Button, TextField } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { toast } from "react-toastify";
import { loginWithGoogle, loginWithEmail } from "../services/firebase";
import { firebaseLoginThunk, localLoginThunk } from "../redux/slices/authSlice";

/**
 * Dashboard login — staff/admin/superadmin only. Phone-OTP and
 * public sign-up are intentionally NOT offered here (dashboard
 * accounts are provisioned by admin/superadmin via Staff Management).
 */
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const completeLogin = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    await dispatch(firebaseLoginThunk(idToken)).unwrap();
    navigate("/");
  };

  const handleGoogle = async () => {
    try {
      const result = await loginWithGoogle();
      await completeLogin(result.user);
    } catch {
      toast.error("Google sign-in failed.");
    }
  };

  const handleLocalAuth = async () => {
    try {
      await dispatch(localLoginThunk({ email, password })).unwrap();
      navigate("/");
    } catch (err) {
      toast.error(err.message || err);
    }
  };

  const handleEmail = async () => {
    try {
      const result = await loginWithEmail(email, password);
      await completeLogin(result.user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Typography variant="h5" fontWeight={800} align="center" gutterBottom>
        Mangalik Dashboard
      </Typography>
      <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogle} sx={{ mb: 2 }}>
        Continue with Google
      </Button>
      <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #eee' }}>
        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
          Or login directly via Mangalik Server (Fallback)
        </Typography>
        <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField fullWidth type="password" label="Password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button fullWidth variant="contained" color="secondary" sx={{ mt: 1 }} onClick={handleLocalAuth}>Server Sign In</Button>
      </Box>
    </Container>
  );
};
export default Login;
