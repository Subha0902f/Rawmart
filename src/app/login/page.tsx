"use client"
import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, LogIn, UserPlus, Store, ShoppingBag } from "lucide-react"
import { initializeApp } from "firebase/app"
import { useRouter } from "next/navigation"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export default function LoginPage() {
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  
  const [userType, setUserType] = useState<"vendor" | "wholesale">("vendor")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      if (activeTab === "login") {
        await signInWithEmailAndPassword(auth, formData.email, formData.password)
        setSuccess(`${userType === "vendor" ? "Vendor" : "Wholesale"} login successful!`)
        // Redirect after login
        setTimeout(() => {
          router.push(userType === "vendor" ? "/vendor" : "/wholesale")
        }, 1000)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
        if (formData.name) {
          await updateProfile(userCredential.user, { displayName: formData.name })
        }
        setSuccess(`${userType === "vendor" ? "Vendor" : "Wholesale"} account created successfully!`)
        // Redirect after signup
        setTimeout(() => {
          router.push(userType === "vendor" ? "/vendor" : "/wholesale")
        }, 1000)
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        setError((err as { message: string }).message)
      } else {
        setError('An unknown error occurred')
      }
    }
    setIsLoading(false)
  }

  

  const handleGoogleLogin = async () => {
  setError(null)
  setSuccess(null)
  setIsLoading(true)
  try {
    await signInWithPopup(auth, googleProvider)
    setSuccess(`${userType === "vendor" ? "Vendor" : "Wholesale"} Google login successful!`)
    // Redirect after Google login
    setTimeout(() => {
      router.push(userType === "vendor" ? "/vendor" : "/wholesale")
    }, 1000)
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
      setError((err as { message: string }).message)
    } else {
      setError('An unknown error occurred')
    }
  }
  setIsLoading(false)
}

  return (
    <>
      <style jsx global>{`
        /* Reset and base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Oxygen", "Ubuntu", "Cantarell", sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%);
          min-height: 100vh;
        }

        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .login-card {
          width: 100%;
          max-width: 64rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .header {
          text-align: center;
          padding: 2rem 1.5rem;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .header-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #059669;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
          color: #4b5563;
          font-size: 1rem;
        }

        /* User Type Toggle Styles */
        .user-type-container {
          padding: 1.5rem 2rem;
          background: linear-gradient(to right, #f0fdf4, #dcfce7);
          border-bottom: 1px solid #d1fae5;
        }

        .toggle-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .toggle-container {
          position: relative;
          background: white;
          border-radius: 1rem;
          padding: 0.25rem;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1);
          border: 1px solid #d1fae5;
        }

        .toggle-buttons {
          display: flex;
        }

        .toggle-button {
          position: relative;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #059669;
          overflow: hidden;
        }

        .toggle-button:hover {
          color: #047857;
          background: #f0fdf4;
        }

        .toggle-button.active {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.2);
          transform: scale(1.05);
        }

        .toggle-button.active .toggle-pulse {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #34d399, #10b981);
          border-radius: 0.75rem;
          opacity: 0.2;
          animation: pulse 2s infinite;
        }

        .toggle-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .toggle-description {
          text-align: center;
          font-size: 0.875rem;
          color: #4b5563;
          margin-top: 0.75rem;
        }

        /* Tab Selector */
        .tab-selector {
          display: flex;
          background: #f0fdf4;
        }

        .tab-button {
          flex: 1;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: none;
          border: none;
          color: #059669;
          font-weight: 500;
          text-transform: capitalize;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border-bottom: 2px solid transparent;
        }

        .tab-button:hover {
          color: #047857;
          background: #f0fdf4;
        }

        .tab-button.active {
          color: #059669;
          border-bottom: 2.5px solid #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          font-weight: 700;
        }

        .tab-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .tab-text {
          font-size: 1rem;
        }

        .form-container {
          padding: 2rem;
          background: none;
        }

        .form-wrapper {
          max-width: 28rem;
          margin: 0 auto;
        }

        .tab-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .tab-icon-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .tab-main-icon {
          width: 2rem;
          height: 2rem;
          color: #fff;
        }

        .tab-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tab-subtitle {
          color: #4b5563;
          font-size: 1rem;
        }

        .google-button {
          width: 100%;
          background: #f0fdf4;
          color: #059669;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-weight: 500;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.08);
          transition: all 0.2s ease;
        }

        .google-button:hover:not(:disabled) {
          background: #dcfce7;
          color: #059669;
          transform: translateY(-1px);
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.1);
        }

        .google-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .google-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .divider {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #d1fae5;
        }

        .divider-text {
          padding: 0 1rem;
          background: transparent;
          color: #059669;
          font-size: 0.875rem;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.75rem;
          width: 1.25rem;
          height: 1.25rem;
          color: #10b981;
          z-index: 1;
        }

        .form-input {
          width: 100%;
          background: #f0fdf4;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          color: #059669;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-input::placeholder {
          color: #6ee7b7;
        }

        .form-input:hover {
          border-color: #10b981;
          background: #dcfce7;
        }

        .form-input:focus {
          outline: none;
          border-color: #059669;
          background: #f0fdf4;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
        }

        .password-input {
          padding-right: 2.75rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #10b981;
          cursor: pointer;
          transition: color 0.2s ease;
          z-index: 1;
        }

        .password-toggle:hover {
          color: #059669;
        }

        .eye-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #fef2f2;
          border-radius: 0.5rem;
          border: 1px solid #fecaca;
          animation: shake 0.5s ease-in-out;
        }

        .success-message {
          color: #059669;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f0fdf4;
          border-radius: 0.5rem;
          border: 1px solid #bbf7d0;
        }

        .submit-button {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1);
          transition: all 0.2s ease;
          color: #fff;
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .submit-button:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.13);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid transparent;
          border-top: 2px solid #059669;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .footer-links {
          text-align: center;
          margin-top: 1.5rem;
        }

        .forgot-password {
          color: #059669;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
          position: relative;
        }

        .forgot-password:hover {
          color: #10b981;
        }

        .forgot-password::after {
          content: "";
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -2px;
          left: 0;
          background-color: currentColor;
          transition: width 0.3s ease;
        }

        .forgot-password:hover::after {
          width: 100%;
        }

        .terms-text {
          font-size: 0.75rem;
          color: #4b5563;
          text-align: center;
          margin-top: 1rem;
          line-height: 1.5;
        }

        .terms-link {
          color: #10b981;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .terms-link:hover {
          color: #059669;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }

        ::selection {
          background-color: #a7f3d0;
          color: #059669;
        }

        ::-moz-selection {
          background-color: #a7f3d0;
          color: #059669;
        }

        @media (max-width: 768px) {
          .login-card {
            margin: 1rem;
            border-radius: 1rem;
          }
          .form-container {
            padding: 1.5rem;
          }
          .header {
            padding: 1.5rem;
          }
          .header-title {
            font-size: 1.5rem;
          }
          .tab-title {
            font-size: 1.25rem;
          }
          .user-type-container {
            padding: 1rem 1.5rem;
          }
          .toggle-button {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 0.5rem;
          }
          .tab-button {
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
          }
          .tab-text {
            display: none;
          }
          .form-container {
            padding: 1rem;
          }
          .header-title {
            font-size: 1.25rem;
          }
          .tab-title {
            font-size: 1.125rem;
          }
          .toggle-button {
            padding: 0.5rem 0.75rem;
          }
          .toggle-button span {
            font-size: 0.75rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="header">
            <h1 className="header-title">Welcome Back</h1>
            <p className="header-subtitle">Sign in to your account or create a new one</p>
          </div>

          {/* User Type Toggle */}
          <div className="user-type-container">
            <div className="toggle-wrapper">
              <div className="toggle-container">
                <div className="toggle-buttons">
                  <button
                    onClick={() => setUserType("vendor")}
                    className={`toggle-button ${userType === "vendor" ? "active" : ""}`}
                  >
                    {userType === "vendor" && <div className="toggle-pulse" />}
                    <Store className="toggle-icon" />
                    <span>Vendor</span>
                  </button>
                  <button
                    onClick={() => setUserType("wholesale")}
                    className={`toggle-button ${userType === "wholesale" ? "active" : ""}`}
                  >
                    {userType === "wholesale" && <div className="toggle-pulse" />}
                    <ShoppingBag className="toggle-icon" />
                    <span>Wholesale</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="toggle-description">
              {userType === "vendor"
                ? "Join as a vendor to sell your products"
                : "Join as a wholesale buyer to purchase in bulk"}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="tab-selector">
            <button
              className={`tab-button ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              <LogIn className="tab-icon" />
              <span className="tab-text">Sign In</span>
            </button>
            <button
              className={`tab-button ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              <UserPlus className="tab-icon" />
              <span className="tab-text">Sign Up</span>
            </button>
          </div>

          {/* Form Container */}
          <div className="form-container">
            <div className="form-wrapper">
              {/* Tab Header */}
              <div className="tab-header">
                <div className="tab-icon-container">
                  {activeTab === "login" ? <LogIn className="tab-main-icon" /> : <UserPlus className="tab-main-icon" />}
                </div>
                <h2 className="tab-title">{activeTab === "login" ? "Sign In" : "Create Account"}</h2>
                <p className="tab-subtitle">
                  {activeTab === "login"
                    ? `Welcome back! Sign in to your ${userType} account.`
                    : `Create your ${userType} account to get started.`}
                </p>
              </div>

              {/* Google Button */}
              <button className="google-button" disabled={isLoading} onClick={handleGoogleLogin}>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">or</span>
                <div className="divider-line"></div>
              </div>

              {/* Error/Success Messages */}
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-fields">
                  {activeTab === "signup" && (
                    <div className="field-group">
                      <div className="input-container">
                        <User className="input-icon" />
                        <input
                          type="text"
                          name="name"
                          className="form-input"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="field-group">
                    <div className="input-container">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <div className="input-container">
                      <Lock className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-input password-input"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>{activeTab === "login" ? "Sign In" : "Create Account"}</>
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="footer-links">
                <a href="#" className="forgot-password">
                  Forgot your password?
                </a>
              </div>

              {/* Terms */}
              <p className="terms-text">
                By continuing, you agree to our{" "}
                <a href="#" className="terms-link">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="terms-link">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}