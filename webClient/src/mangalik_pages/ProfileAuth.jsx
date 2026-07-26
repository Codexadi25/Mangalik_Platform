import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProfileAuth.css'

const ProfileAuth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  
  // Refs for the 6 OTP input boxes
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]
  const navigate = useNavigate()

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev)
    setShowOTP(false) // Reset OTP view when toggling mode
  }

  const handleDetailsSubmit = (e) => {
    e.preventDefault()
    // Here you would typically trigger the backend to send the OTP
    console.log("Details submitted. Sending OTP...")
    setShowOTP(true)
  }

  const handleOTPSubmit = (e) => {
    e.preventDefault()
    const otpValue = otp.join('')
    // Logic for verifying OTP will go here
    console.log("Verifying OTP:", otpValue)
    if (otpValue.length === 6) {
      // Mock successful login: navigate to dashboard
      navigate('/account')
    } else {
      alert("Please enter all 6 digits.")
    }
  }

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    // Take only the last character if multiple are pasted/typed quickly
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  }

  const handleOtpKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  }

  // Auto-focus the first OTP input when the OTP view is shown
  useEffect(() => {
    if (showOTP && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [showOTP])

  return (
    <div className="auth-page section">
      <div className="container">
        <div className="auth-container">
          
          {!showOTP ? (
            <>
              <div className="auth-header">
                <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
                <p>{isLogin ? 'Enter your email address to log in.' : 'Join us to get started with our products.'}</p>
              </div>
              
              <form className="auth-form" onSubmit={handleDetailsSubmit}>
                {!isLogin && (
                  <>
                    <div className="form-row">
                      <div className="form-group flex-1">
                        <label htmlFor="firstName">First Name</label>
                        <input type="text" id="firstName" placeholder="John" required />
                      </div>
                      <div className="form-group flex-1">
                        <label htmlFor="lastName">Last Name</label>
                        <input type="text" id="lastName" placeholder="Doe (Optional)" />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="mobile">Mobile Number</label>
                      <input type="tel" id="mobile" placeholder="e.g. +1 234 567 8900" required />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" placeholder="you@example.com" required />
                </div>
                
                <button type="submit" className="btn btn-primary auth-btn">
                  Send OTP
                </button>
              </form>

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
                <p>We have sent a 6-digit code to your {isLogin ? 'email address' : 'mobile number'}.</p>
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

                <button type="submit" className="btn btn-primary auth-btn">
                  Verify & Proceed
                </button>
                
                <div className="resend-otp">
                  <button type="button" className="auth-toggle-btn" onClick={() => setShowOTP(false)}>
                    Change {isLogin ? 'Email Address' : 'Mobile Number'}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default ProfileAuth
