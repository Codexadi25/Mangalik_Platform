import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import GoogleIcon from "@mui/icons-material/Google";
import "./LoginPage.css";

import {
  loginWithGoogle,
  setupRecaptcha,
  loginWithPhone,
} from "../services/firebase";
import { firebaseLoginThunk, localLoginThunk, localRegisterThunk } from "../redux/slices/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get("returnUrl") || "/account";

  useEffect(() => {
    if (location.pathname === "/signup") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (user) navigate(returnUrl, { replace: true });
  }, [user, navigate, returnUrl]);

  // Auth Modes
  const [isLogin, setIsLogin] = useState(location.pathname !== "/signup");
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Detect Phone vs Email on identifier (for Login Mode)
  const isPhone = /^\+?[0-9]{10,15}$/.test(identifier.replace(/[\s-]/g, ""));

  // Reset flows when switching modes
  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setShowOTP(false);
    setShowPassword(false);
  };

  const completeLogin = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      await dispatch(firebaseLoginThunk(idToken)).unwrap();
      toast.success("Welcome to Mangalik!");
      navigate(returnUrl);
    } catch (err) {
      toast.error(err.message || "Failed to finalize login.");
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await loginWithGoogle();
      await completeLogin(result.user);
    } catch (err) {
      toast.error("Google sign-in failed.");
    }
  };

  // --- SUBMIT: First Step ---
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      // SIGN UP FLOW
      if (!firstName || !identifier || !password) return toast.error("Please fill required fields.");
      const fullName = lastName ? `${firstName} ${lastName}`.trim() : firstName;
      
      const referralCodeFromUrl = queryParams.get("ref") || "";

      // Attempt Local Registration
      try {
        await dispatch(localRegisterThunk({ 
          name: fullName, 
          identifier, 
          password, 
          referralCode: referralCodeFromUrl 
        })).unwrap();
        toast.success("Account created successfully!");
        navigate(returnUrl);
      } catch (err) {
        toast.error(err.message || "Registration failed");
      }
      return;
    }

    // LOGIN FLOW
    if (!identifier) return toast.error("Please enter Email or Mobile Number");

    // If it's a Phone Number, we show options: OTP or Password
    if (isPhone) {
      setShowOTP(false);
      setShowPassword(true);
    } else {
      // If Email, just show Password field
      setShowPassword(true);
    }
  };

  const handlePasswordLogin = async () => {
    if (!password) return toast.error("Please enter your password");
    try {
      await dispatch(localLoginThunk({ identifier, password })).unwrap();
      toast.success("Welcome back!");
      navigate(returnUrl);
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  };

  const sendOtp = async () => {
    try {
      let formattedPhone = identifier.replace(/[\s-]/g, "");
      if (formattedPhone.length === 10 && !formattedPhone.startsWith("+")) {
        formattedPhone = "+91" + formattedPhone;
      }

      const verifier = setupRecaptcha("recaptcha-container");
      const result = await loginWithPhone(formattedPhone, verifier);
      setConfirmationResult(result);
      setShowPassword(false);
      setShowOTP(true);
      toast.info("OTP sent successfully via SMS.");
    } catch (err) {
      toast.error("Failed to send OTP.");
    }
  };

  // --- OTP Logic ---
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6 && confirmationResult) {
      try {
        const result = await confirmationResult.confirm(otpValue);
        await completeLogin(result.user);
      } catch (err) {
        toast.error("Invalid OTP.");
      }
    } else {
      toast.error("Please enter all 6 digits.");
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs[index + 1].current.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  useEffect(() => {
    if (showOTP && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [showOTP]);

  return (
    <div className="auth-page section">
      <div className="container">
        <div className="auth-container">
          
          {!showOTP ? (
            <>
              <div className="auth-header">
                <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
                <p>{isLogin ? 'Log in to continue to Mangalik.' : 'Join us to get started with our products.'}</p>
              </div>

              <button type="button" className="auth-btn-outline" onClick={handleGoogle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <GoogleIcon fontSize="small" /> Continue with Google
              </button>

              <div className="divider">OR</div>
              
              <form className="auth-form" onSubmit={handleDetailsSubmit}>
                {queryParams.get("ref") && !isLogin && (
                  <div className="referral-alert" style={{
                    background: "rgba(227, 60, 36, 0.08)",
                    border: "1px solid rgba(227, 60, 36, 0.2)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    fontSize: "0.85rem",
                    color: "#E33C24",
                    marginBottom: "15px",
                    fontWeight: "500",
                    textAlign: "center"
                  }}>
                    🎉 Referred by Vendor: <strong>{queryParams.get("ref").toUpperCase()}</strong>
                  </div>
                )}
                {!isLogin && (
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label htmlFor="firstName">First Name</label>
                      <input type="text" id="firstName" placeholder="John" value={firstName} onChange={e=>setFirstName(e.target.value)} required />
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="lastName">Last Name</label>
                      <input type="text" id="lastName" placeholder="Doe (Optional)" value={lastName} onChange={e=>setLastName(e.target.value)} />
                    </div>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="identifier">Email Address or Mobile Number</label>
                  <input 
                    type="text" 
                    id="identifier" 
                    placeholder="you@example.com or 9876543210" 
                    value={identifier} 
                    onChange={e => {
                      setIdentifier(e.target.value);
                      setShowPassword(false);
                    }} 
                    required 
                  />
                </div>

                {(showPassword || !isLogin) && (
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
                  </div>
                )}
                
                {isLogin && !showPassword && (
                  <button type="submit" className="auth-btn">
                    Continue
                  </button>
                )}

                {isLogin && showPassword && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="auth-btn" onClick={handlePasswordLogin}>
                      Login with Password
                    </button>
                    {/* {isPhone && (
                      <button type="button" className="auth-btn-outline" onClick={sendOtp}>
                        Login with OTP
                      </button>
                    )} */}
                  </div>
                )}

                {!isLogin && (
                   <button type="submit" className="auth-btn">
                    Create Account
                   </button>
                )}
              </form>

              {/* Required for Firebase Phone Auth */}
              <div id="recaptcha-container" style={{ marginTop: '20px' }}></div>

              <div className="auth-footer">
                <p>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button type="button" onClick={toggleAuthMode} className="auth-toggle-btn">
                    {isLogin ? 'Sign up here' : 'Log in here'}
                  </button>
                </p>
              </div>
            </>
          ) : (
            // OTP VERIFICATION STEP
            <>
              <div className="auth-header">
                <h2>Verify OTP</h2>
                <p>We have sent a 6-digit code to {identifier}.</p>
              </div>

              <form className="auth-form" onSubmit={handleOTPSubmit}>
                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-input"
                      value={digit}
                      ref={inputRefs[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      autoComplete="one-time-code"
                      required
                    />
                  ))}
                </div>

                <button type="submit" className="auth-btn">
                  Verify & Proceed
                </button>
                
                <div className="resend-otp">
                  <button type="button" className="auth-toggle-btn" onClick={() => { setShowOTP(false); setShowPassword(false); }}>
                    Change Mobile Number
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
