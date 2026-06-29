import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Button, TextField, Divider, Tabs, Tab } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { toast } from "react-toastify";
import {
  loginWithGoogle,
  loginWithEmail,
  signupWithEmail,
  setupRecaptcha,
  loginWithPhone,
} from "../services/firebase";
import { firebaseLoginThunk, localLoginThunk, localRegisterThunk } from "../redux/slices/authSlice";

/**
 * Unified login screen supporting:
 *  - Continue with Google (Firebase popup)
 *  - Email + Password (sign in / sign up)
 *  - Phone number + OTP (Firebase invisible reCAPTCHA)
 * On success, the Firebase ID token is exchanged for a Mangalik
 * session via /api/auth/firebase-login.
 */
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  
  useEffect(() => {
    if (user) {
      navigate("/account");
    }
  }, [user, navigate]);

  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const completeLogin = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    await dispatch(firebaseLoginThunk(idToken)).unwrap();
    toast.success("Welcome to Mangalik!");
    navigate("/");
  };

  const handleGoogle = async () => {
    try {
      const result = await loginWithGoogle();
      await completeLogin(result.user);
    } catch (err) {
      toast.error("Google sign-in failed.");
    }
  };

  const handleLocalAuth = async (isSignup) => {
    try {
      if (isSignup) {
        await dispatch(localRegisterThunk({ name: name || "New User", email, password })).unwrap();
      } else {
        await dispatch(localLoginThunk({ email, password })).unwrap();
      }
      toast.success("Logged in via local server!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || err);
    }
  };

  const handleEmailAuth = async (isSignup) => {
    try {
      const result = isSignup
        ? await signupWithEmail(email, password)
        : await loginWithEmail(email, password);
      await completeLogin(result.user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const sendOtp = async () => {
    try {
      const verifier = setupRecaptcha("recaptcha-container");
      const result = await loginWithPhone(phone, verifier);
      setConfirmationResult(result);
      toast.info("OTP sent.");
    } catch (err) {
      toast.error("Failed to send OTP.");
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await confirmationResult.confirm(otp);
      await completeLogin(result.user);
    } catch (err) {
      toast.error("Invalid OTP.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
        Sign in to Mangalik
      </Typography>

      <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogle} sx={{ mb: 2 }}>
        Continue with Google
      </Button>

      <Divider sx={{ my: 2 }}>or</Divider>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
        <Tab label="Email (Firebase)" />
        <Tab label="Phone (Firebase)" />
        <Tab label="Local Server" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth type="password" label="Password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={() => handleEmailAuth(false)}>Sign In</Button>
          <Button fullWidth sx={{ mt: 1 }} onClick={() => handleEmailAuth(true)}>Create Account</Button>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <TextField fullWidth label="Phone Number (+91...)" margin="normal" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={sendOtp}>Send OTP</Button>
          {confirmationResult && (
            <>
              <TextField fullWidth label="Enter OTP" margin="normal" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={verifyOtp}>Verify & Sign In</Button>
            </>
          )}
          <div id="recaptcha-container" />
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
            Direct backend login (bypasses Firebase)
          </Typography>
          <TextField fullWidth label="Name (for Signup)" margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth type="password" label="Password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={() => handleLocalAuth(false)}>Login</Button>
          <Button fullWidth sx={{ mt: 1 }} onClick={() => handleLocalAuth(true)}>Register</Button>
        </Box>
      )}
    </Container>
  );
};

export default LoginPage;
