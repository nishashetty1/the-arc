// src/pages/LoginPage.jsx
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { AuthLayout } from "../components";
import { Button, Input, Alert } from "../components";
import { HiMail, HiLockClosed, HiArrowRight } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase/config";

const backgroundPattern =
  "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formRef = useRef(null);
  const isFormInView = useInView(formRef, { once: true, amount: 0.3 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Import the auth service dynamically
      const { loginWithEmailAndPassword } = await import("../services/auth");
      
      // Sign in with Firebase
      const { user, error } = await loginWithEmailAndPassword(email, password);
      
      if (error) {
        console.error("Login error:", error);
        setError(error.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }
      
      // Update auth store with user data
      const useAuthStore = (await import("../stores/authStore")).default;
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      
      useAuthStore.getState().setUser(userData);
      
      // Get user data from Firestore to check onboarding status
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().onboardingCompleted) {
        navigate("/dashboard");
      } else {
        // Redirect to onboarding if not completed
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Import Firebase auth directly
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } = await import("firebase/auth");
      const { auth, db } = await import("../utils/firebase/config");
      const { doc, setDoc, getDoc, serverTimestamp } = await import("firebase/firestore");
      
      const provider = new GoogleAuthProvider();
      // Add custom parameters for better compatibility
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use signInWithRedirect instead of popup for better compatibility
      // with Cross-Origin-Opener-Policy restrictions
      const result = await signInWithPopup(auth, provider);
      
      // The signed-in user info
      const user = result.user;
      
      // Check if this user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Update auth store with user data
      const useAuthStore = (await import("../stores/authStore")).default;
      
      // If user doesn't exist, this is likely a first-time Google sign-in
      // Redirect to signup flow to complete profile
      if (!userDoc.exists()) {
        // Create a basic user document
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          onboardingCompleted: false
        });
        
        // Set user in store
        useAuthStore.getState().setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          onboardingCompleted: false
        });
        
        // Redirect to onboarding to complete profile setup
        navigate("/google-onboarding");
        return;
      }
      
      // User exists - get their data
      const userData = userDoc.data();
      
      // Update auth store with full user data
      useAuthStore.getState().setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userData.displayName,
        photoURL: user.photoURL || userData.photoURL,
        userType: userData.userType,
        onboardingCompleted: userData.onboardingCompleted
      });
      
      // If user has completed onboarding, go to dashboard
      if (userData.onboardingCompleted) {
        navigate("/dashboard");
      } else {
        // Otherwise redirect to complete onboarding
        navigate("/google-onboarding");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  // Custom AuthLayout with background gradient
  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      {/* Background gradient similar to hero section */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 -z-10"></div>

      {/* Background pattern overlay */}
      <div
        className="absolute inset-0 opacity-20 -z-10"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>

      {/* Floating Elements (similar to landing page) */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="absolute right-[10%] top-[20%] hidden lg:block"
      >
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 opacity-20 blur-xl"></div>
      </motion.div>

      <motion.div
        animate={{
          y: [-10, 10, -10],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          },
        }}
        className="absolute left-[15%] bottom-[20%] hidden lg:block"
      >
        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 opacity-20 blur-xl"></div>
      </motion.div>

      <header className="bg-white/10 backdrop-blur-md py-4 shadow-md border-b border-white/20">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-white"
            >
              The Arc.
            </motion.span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-4 sm:px-6 lg:px-8 z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-center text-3xl font-extrabold text-white sm:text-4xl"
            >
              Welcome{" "}
              <span className="bg-gradient-to-r from-accent-300 to-secondary-300 bg-clip-text text-transparent">
                back
              </span>
            </motion.h2>
          </div>

          {/* Glassmorphism effect card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="backdrop-blur-lg bg-white/20 rounded-xl border border-white/30 shadow-xl p-6 sm:p-8"
          >
            <div ref={formRef}>
              <motion.div
                initial="hidden"
                animate={isFormInView ? "visible" : "hidden"}
                variants={containerVariants}
              >
                {error && (
                  <motion.div variants={itemVariants}>
                    <Alert
                      variant="error"
                      className="mb-6 bg-red-500/80 border-red-400 text-white"
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div variants={itemVariants}>
                    <Input
                      id="email"
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      leftIcon={<HiMail className="h-5 w-5 text-white/80" />}
                      className="border-white/40 text-white placeholder:text-white/60"
                      labelClassName="text-white"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Input
                      id="password"
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      leftIcon={
                        <HiLockClosed className="h-5 w-5 text-white/80" />
                      }
                      className="border-white/40 text-white placeholder:text-white/60"
                      labelClassName="text-white"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/40 bg-white/20 text-primary-600 focus:ring-primary-500 focus:ring-offset-primary-800"
                        />
                        <label
                          htmlFor="remember-me"
                          className="ml-2 block text-sm text-white"
                        >
                          Remember me
                        </label>
                      </div>

                      <div className="text-sm">
                        <Link
                          to="/forgot-password"
                          className="font-medium text-white hover:text-white/80 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="pt-2">
                    <Button
                      type="submit"
                      fullWidth
                      isLoading={isLoading}
                      variant="outline"
                      className="group !bg-white !text-primary-700 !border-white/50 hover:!bg-white/90 hover:!text-primary-700"
                      rightIcon={
                        !isLoading && (
                          <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                        )
                      }
                    >
                      Login
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="flex items-center my-6"
                  >
                    <div className="flex-1 border-t border-white/30"></div>
                    <div className="mx-4 text-sm text-white/80">or</div>
                    <div className="flex-1 border-t border-white/30"></div>
                  </motion.div>

                  {/* Google Sign In Button */}
                  <motion.div variants={itemVariants} className="mb-6">
                    <Button
                      fullWidth
                      variant="outline"
                      className="border-white/50 bg-white hover:bg-white/90 text-neutral py-2.5 flex items-center justify-center gap-3"
                      onClick={handleGoogleLogin}
                    >
                      <FcGoogle className="h-5 w-5" />
                      <span>Continue with Google</span>
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="text-center text-sm text-white pt-2"
                  >
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="font-medium text-white underline hover:text-white/80 transition-colors"
                    >
                      Sign up
                    </Link>
                  </motion.div>
                </form>
              </motion.div>
            </div>
          </motion.div>

          {/* Additional floating element */}
          <motion.div
            animate={{
              y: [-5, 5, -5],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              },
            }}
            className="absolute left-[25%] top-[15%] hidden lg:block"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 opacity-20 blur-lg"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
