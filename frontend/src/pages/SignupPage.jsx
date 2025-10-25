// src/pages/SignupPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import {
  HiArrowLeft,
  HiArrowRight,
  HiBriefcase,
  HiUser,
  HiCurrencyDollar,
  HiMail,
  HiLockClosed,
  HiIdentification,
  HiChevronDown,
  HiUpload,
  HiDocumentText,
  HiCheckCircle,
} from "react-icons/hi";

import { Button, Input, Alert, Card, Select, Dropdown } from "../components";

const backgroundPattern =
  "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

// Reusable form step component
const FormStep = ({ isActive, children }) => {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  const isFormInView = useInView(formRef, { once: true, amount: 0.3 });

  // Get user type from URL params
  const queryParams = new URLSearchParams(location.search);
  const userTypeFromUrl = queryParams.get("type") || "startup";

  const [userType, setUserType] = useState(userTypeFromUrl);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industry: "",
    description: "",
    problemSolved: "",
    currentStage: "",
    fundingNeeds: "",
    teamSize: "",
    skills: [],
    interests: [],
    ideaDescription: "",
    lookingFor: "",
    investmentFocus: [],
    stagePreference: [],
    investmentSize: "",
    companyAffiliation: "",
  });

  const industryOptions = [
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "ecommerce", label: "E-Commerce" },
    { value: "food", label: "Food & Beverage" },
    { value: "entertainment", label: "Entertainment" },
    { value: "realestate", label: "Real Estate" },
  ];

  const stageOptions = [
    { value: "idea", label: "Idea" },
    { value: "prototype", label: "Prototype" },
    { value: "mvp", label: "MVP" },
    { value: "launched", label: "Launched" },
    { value: "growth", label: "Growth" },
    { value: "scaling", label: "Scaling" },
  ];

  const skillOptions = [
    { value: "programming", label: "Programming" },
    { value: "design", label: "Design" },
    { value: "marketing", label: "Marketing" },
    { value: "finance", label: "Finance" },
    { value: "sales", label: "Sales" },
    { value: "product", label: "Product Management" },
    { value: "business", label: "Business Development" },
    { value: "research", label: "Research" },
  ];

  const investmentSizeOptions = [
    { value: "under50k", label: "Under 50K" },
    { value: "50k-250k", label: "50K - 250K" },
    { value: "250k-1m", label: "250K - 1M" },
    { value: "1m-5m", label: "1M - 5M" },
    { value: "over5m", label: "Over 5M" },
  ];

  // Update URL when user type changes
  useEffect(() => {
    const newUrl = `/signup?type=${userType}`;
    window.history.replaceState(null, "", newUrl);
    // Reset step when changing user type
    setStep(1);
  }, [userType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, value) => {
    let updatedValues;

    if (formData[name].includes(value)) {
      updatedValues = formData[name].filter((item) => item !== value);
    } else {
      updatedValues = [...formData[name], value];
    }

    setFormData((prev) => ({ ...prev, [name]: updatedValues }));
  };

  const validateStep = () => {
    // Simple validation for demonstration
    if (step === 1) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Please fill out all required fields");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    setIsLoading(true);
    setError("");

    try {
      // Import the auth service dynamically to avoid circular dependencies
      const { registerWithEmailAndPassword } = await import("../services/auth");
      
      // Register the user with Firebase
      const { user, error } = await registerWithEmailAndPassword(
        formData.name,
        formData.email,
        formData.password
      );

      if (error) {
        console.error("Firebase signup error:", error);
        setError(error.message || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      console.log("User registered successfully:", user);
      
      // Create additional user data in Firestore based on user type
      // You'll need to implement this in your auth.js service
      
      // Store user data in your app's state management
      // Import and use your auth store
      const useAuthStore = (await import("../stores/authStore")).default;
      useAuthStore.getState().setUser({
        uid: user.uid,
        email: user.email,
        displayName: formData.name,
        userType: userType,
        onboardingCompleted: false
      });

      setIsLoading(false);
      // Redirect to onboarding to complete profile setup
      navigate("/onboarding");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Import Firebase auth directly to avoid circular dependencies
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
      
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      
      // The signed-in user info
      const user = result.user;
      
      // Check if this user already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Update auth store
      const useAuthStore = (await import("../stores/authStore")).default;
      useAuthStore.getState().setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        userType: userType,
        onboardingCompleted: userDoc.exists() ? userDoc.data().onboardingCompleted : false
      });
      
      // If user exists and has completed onboarding, go to dashboard
      if (userDoc.exists() && userDoc.data().onboardingCompleted) {
        navigate("/dashboard");
      } 
      // If new user or hasn't completed onboarding, create basic user record and redirect to onboarding
      else {
        // Create a basic user document if it doesn't exist yet
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            userType: userType, // Save selected user type
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            onboardingCompleted: false
          });
        }
        
        // Redirect to the Google onboarding flow
        navigate("/google-onboarding");
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Google signup error:", err);
      setError(err.message || "Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  // Determine total steps based on user type
  const totalSteps =
    userType === "individual" ? 3 : userType === "startup" ? 4 : 3;

  const userTypeDetails = {
    startup: {
      title: "Startup Founder",
      description:
        "Connect with investors and co-founders who believe in your vision",
      icon: <HiBriefcase className="h-6 w-6" />,
      color: "bg-primary-100 text-primary-600",
    },
    individual: {
      title: "Individual Creator",
      description:
        "Share your ideas and find collaborators to make them a reality",
      icon: <HiUser className="h-6 w-6" />,
      color: "bg-accent-100 text-accent-600",
    },
    investor: {
      title: "Investor",
      description:
        "Discover promising startups and invest in the next big thing",
      icon: <HiCurrencyDollar className="h-6 w-6" />,
      color: "bg-secondary-100 text-secondary-600",
    },
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 -z-10"></div>

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-20 -z-10"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>

      {/* Floating Elements */}
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
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 opacity-20 blur-xl"></div>
      </motion.div>

      <motion.div
        animate={{
          y: [-10, 10, -10],
          transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          },
        }}
        className="absolute left-[15%] bottom-[15%] hidden lg:block"
      >
        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 opacity-20 blur-xl"></div>
      </motion.div>

      {/* Header */}
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

          <Link
            to="/login"
            className="text-white/90 hover:text-white text-sm font-medium"
          >
            Already have an account? <span className="underline">Log in</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress bar and step indicator */}
            <div className="mb-8 text-center">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Create your account
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-primary-100 mb-6"
              >
                Step {step} of {totalSteps}
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
                className="h-2 bg-white/20 rounded-full max-w-md mx-auto overflow-hidden"
              >
                <motion.div
                  initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-white rounded-full"
                />
              </motion.div>
            </div>

            {/* Main Form Card with Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-lg bg-white/20 rounded-xl border border-white/30 shadow-xl overflow-hidden"
              ref={formRef}
            >
              <div className="p-6 sm:p-8">
                <form id="signup-form" onSubmit={(e) => e.preventDefault()} method="POST">
                  <AnimatePresence mode="wait">
                  {/* Step 0: User Type Selection (Only show if accessed directly) */}
                  {step === 0 && (
                    <FormStep isActive={step === 0}>
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-white mb-2">
                          I am a...
                        </h2>
                        <p className="text-primary-100">
                          Choose your account type to get started
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {Object.entries(userTypeDetails).map(
                          ([type, details]) => (
                            <motion.div
                              key={type}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className={`p-4 rounded-lg border-2 cursor-pointer ${
                                userType === type
                                  ? "bg-white/30 border-white"
                                  : "bg-white/10 border-white/30"
                              }`}
                              onClick={() => setUserType(type)}
                            >
                              <div
                                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${details.color}`}
                              >
                                {details.icon}
                              </div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {details.title}
                              </h3>
                              <p className="text-sm text-primary-100">
                                {details.description}
                              </p>
                            </motion.div>
                          )
                        )}
                      </div>

                      <div className="flex justify-center">
                        <Button
                          onClick={handleNext}
                          className="px-8 bg-white text-primary-700"
                        >
                          Continue
                        </Button>
                      </div>
                    </FormStep>
                  )}

                  {/* Step 1: Basic Information */}
                  {step === 1 && (
                    <FormStep isActive={step === 1}>
                      <div className="flex flex-col md:flex-row items-center mb-6 gap-4">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full ${userTypeDetails[userType].color}`}
                        >
                          {userTypeDetails[userType].icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {userTypeDetails[userType].title} Account
                          </h2>
                          <p className="text-primary-100">
                            Enter your basic information to get started
                          </p>
                        </div>
                      </div>

                      {error && (
                        <Alert
                          variant="error"
                          className="mb-6 bg-red-500/80 border-red-400 text-white"
                        >
                          {error}
                        </Alert>
                      )}

                      {/* Google Signup Button */}
                      <div className="mb-6">
                        <Button
                          fullWidth
                          variant="outline"
                          className="border-white/50 bg-white/30 hover:bg-white/40 text-white py-3 flex items-center justify-center gap-3"
                          onClick={handleGoogleSignup}
                        >
                          <FcGoogle className="h-5 w-5" />
                          <span>Sign up with Google</span>
                        </Button>
                      </div>

                      <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-white/30"></div>
                        <div className="mx-4 text-sm text-white/80">
                          or continue with email
                        </div>
                        <div className="flex-1 border-t border-white/30"></div>
                      </div>

                      <div className="space-y-4">
                        <Input
                          label="Name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          labelClassName="text-white"
                          className=" border-white/40 text-white placeholder:text-white/60"
                          required
                        />

                        {userType === "startup" && (
                          <Input
                            label="Company Name"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Enter your company name"
                            labelClassName="text-white"
                            className=" border-white/40 text-white placeholder:text-white/60"
                            required
                          />
                        )}

                        <Input
                          label="Email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          labelClassName="text-white"
                          className=" border-white/40 text-white placeholder:text-white/60"
                          leftIcon={<HiMail className="text-white/70" />}
                          required
                        />

                        <Input
                          label="Password"
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a secure password (8+ characters)"
                          labelClassName="text-white"
                          className=" border-white/40 text-white placeholder:text-white/60"
                          leftIcon={<HiLockClosed className="text-white/70" />}
                          required
                        />

                        <Input
                          label="Confirm Password"
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter your password"
                          labelClassName="text-white"
                          className=" border-white/40 text-white placeholder:text-white/60"
                          leftIcon={<HiLockClosed className="text-white/70" />}
                          required
                        />
                      </div>

                      <div className="mt-8 flex justify-end">
                        <Button
                          onClick={handleNext}
                          className=" group"
                          rightIcon={
                            <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                          }
                        >
                          Next Step
                        </Button>
                      </div>
                    </FormStep>
                  )}

                  {/* Step 2: Startup Specific - Company Details */}
                  {step === 2 && userType === "startup" && (
                    <FormStep isActive={step === 2 && userType === "startup"}>
                      <h2 className="text-xl font-bold text-white mb-6">
                        Tell us about your startup
                      </h2>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Select
                            label="Industry"
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            options={industryOptions}
                            placeholder="Select industry"
                            required
                          />

                          <Select
                            label="Current Stage"
                            name="currentStage"
                            value={formData.currentStage}
                            onChange={handleChange}
                            options={stageOptions}
                            placeholder="Select stage"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-1">
                            Short Description
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Briefly describe what your startup does"
                            className="w-full rounded-md border border-white/40 bg-white/10 py-2 px-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-1">
                            Problem Solved
                          </label>
                          <textarea
                            name="problemSolved"
                            value={formData.problemSolved}
                            onChange={handleChange}
                            placeholder="What problem does your startup solve?"
                            className="w-full rounded-md border border-white/40 bg-white/10 py-2 px-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Select
                            label="Team Size (Optional)"
                            name="teamSize"
                            value={formData.teamSize}
                            onChange={handleChange}
                            options={[
                              { value: "1", label: "Just me" },
                              { value: "2-5", label: "2-5 people" },
                              { value: "6-10", label: "6-10 people" },
                              { value: "11-50", label: "11-50 people" },
                              { value: "50+", label: "50+ people" },
                            ]}
                            placeholder="Select team size"
                          />

                          <Select
                            label="Funding Needs (Optional)"
                            name="fundingNeeds"
                            value={formData.fundingNeeds}
                            onChange={handleChange}
                            options={investmentSizeOptions}
                            placeholder="Select funding range"
                          />
                        </div>
                      </div>

                      <div className="mt-8 flex justify-between">
                        <Button
                          onClick={handleBack}
                          variant="outline"
                          className="border-white/50"
                          leftIcon={<HiArrowLeft />}
                        >
                          Back
                        </Button>

                        <Button
                          onClick={handleNext}
                          className=" group"
                          rightIcon={
                            <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                          }
                        >
                          Next Step
                        </Button>
                      </div>
                    </FormStep>
                  )}

                  {/* Step 2: Individual Specific */}
                  {step === 2 && userType === "individual" && (
                    <FormStep
                      isActive={step === 2 && userType === "individual"}
                    >
                      <h2 className="text-xl font-bold text-white mb-6">
                        Tell us about yourself
                      </h2>

                      <div className="space-y-6">
                        <Dropdown
                          label="Skills"
                          value={formData.skills}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, skills: value }))
                          }
                          options={skillOptions}
                          multiple
                          searchable
                          placeholder="Select your skills"
                        />

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Interests (Select all that apply)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {industryOptions.map((industry) => (
                              <button
                                key={industry}
                                type="button"
                                onClick={() =>
                                  handleArrayChange("interests", industry)
                                }
                                className={`px-4 py-2 rounded-full text-sm ${
                                  formData.interests.includes(industry)
                                    ? "bg-primary-600 text-white"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                } transition-colors`}
                              >
                                {industry}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-1">
                            Idea Description (Optional)
                          </label>
                          <textarea
                            name="ideaDescription"
                            value={formData.ideaDescription}
                            onChange={handleChange}
                            placeholder="Briefly describe your idea or what you're working on"
                            className="w-full rounded-md border border-white/40 bg-white/10 py-2 px-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24"
                          />
                        </div>

                        <Select
                          label="I'm Looking For"
                          name="lookingFor"
                          value={formData.lookingFor}
                          onChange={handleChange}
                          options={[
                            { value: "cofounder", label: "Co-founder" },
                            { value: "investment", label: "Investment" },
                            {
                              value: "both",
                              label: "Both Co-founder & Investment",
                            },
                            {
                              value: "networking",
                              label: "Networking/Connections",
                            },
                          ]}
                          placeholder="Select what you're looking for"
                          required
                        />
                      </div>

                      <div className="mt-8 flex justify-between">
                        <Button
                          onClick={handleBack}
                          variant="outline"
                          className="border-white/50 "
                          leftIcon={<HiArrowLeft />}
                        >
                          Back
                        </Button>

                        <Button
                          onClick={handleNext}
                          className="group"
                          rightIcon={
                            <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                          }
                        >
                          Next Step
                        </Button>
                      </div>
                    </FormStep>
                  )}

                  {/* Step 2: Investor Specific */}
                  {step === 2 && userType === "investor" && (
                    <FormStep isActive={step === 2 && userType === "investor"}>
                      <h2 className="text-xl font-bold text-white mb-6">
                        Investment Preferences
                      </h2>

                      <div className="space-y-6">
                        <Dropdown
                          label="Investment Focus"
                          value={formData.investmentFocus}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              investmentFocus: value,
                            }))
                          }
                          options={industryOptions}
                          multiple
                          searchable
                          placeholder="Select investment areas"
                        />

                        <Dropdown
                          label="Stage Preference"
                          value={formData.stagePreference}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              stagePreference: value,
                            }))
                          }
                          options={stageOptions}
                          multiple
                          placeholder="Select preferred stages"
                        />

                        <Select
                          label="Typical Investment Size"
                          name="investmentSize"
                          value={formData.investmentSize}
                          onChange={handleChange}
                          options={investmentSizeOptions}
                          placeholder="Select investment range"
                          required
                        />

                        <div>
                          <label className="block text-sm font-medium text-white mb-1">
                            Company/Individual Affiliation (Optional)
                          </label>
                          <input
                            type="text"
                            name="companyAffiliation"
                            value={formData.companyAffiliation}
                            onChange={handleChange}
                            placeholder="Venture capital firm, angel investor group, etc."
                            className="w-full rounded-md border border-white/40 bg-white/10 py-2 px-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="mt-8 flex justify-between">
                        <Button
                          onClick={handleBack}
                          variant="outline"
                          className="border-white/50 "
                          leftIcon={<HiArrowLeft />}
                        >
                          Back
                        </Button>

                        <Button
                          onClick={handleNext}
                          className="group"
                          rightIcon={
                            <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                          }
                        >
                          Next Step
                        </Button>
                      </div>
                    </FormStep>
                  )}

                  {/* Step 3: Startup Document Upload */}
                  {step === 3 && userType === "startup" && (
                    <FormStep isActive={step === 3 && userType === "startup"}>
                      <h2 className="text-xl font-bold text-white mb-2">
                        Verify Your Startup
                      </h2>
                      <p className="text-primary-100 mb-6">
                        Please upload the following documents to verify your
                        startup identity
                      </p>

                      <div className="space-y-6">
                        <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/10 p-6 text-center transition-all hover:border-white/50 hover:bg-white/15">
                          <div className="space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                              <HiDocumentText className="h-7 w-7 text-primary-600" />
                            </div>
                            <div className="text-sm text-white">
                              <label
                                htmlFor="business-doc"
                                className="relative cursor-pointer rounded-md font-medium text-white underline hover:text-white/80 focus-within:outline-none"
                              >
                                <span>
                                  Upload Business Registration Document
                                </span>
                                <input
                                  id="business-doc"
                                  name="business-doc"
                                  type="file"
                                  className="sr-only"
                                />
                              </label>
                              <p>or drag and drop</p>
                            </div>
                            <p className="text-xs text-white/70">
                              Certificate of Incorporation, Business
                              Registration, etc. (PDF, PNG, JPG)
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/10 p-6 text-center transition-all hover:border-white/50 hover:bg-white/15">
                          <div className="space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary-100">
                              <HiIdentification className="h-7 w-7 text-secondary-600" />
                            </div>
                            <div className="text-sm text-white">
                              <label
                                htmlFor="founder-id"
                                className="relative cursor-pointer rounded-md font-medium text-white underline hover:text-white/80 focus-within:outline-none"
                              >
                                <span>Upload Founder ID Proof</span>
                                <input
                                  id="founder-id"
                                  name="founder-id"
                                  type="file"
                                  className="sr-only"
                                />
                              </label>
                              <p>or drag and drop</p>
                            </div>
                            <p className="text-xs text-white/70">
                              Passport, Driver's License, or Government ID (PDF,
                              PNG, JPG)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-between">
                        <Button
                          onClick={handleBack}
                          variant="outline"
                          className="border-white/50 "
                          leftIcon={<HiArrowLeft />}
                        >
                          Back
                        </Button>

                        <Button
                          onClick={handleNext}
                          className="group"
                          rightIcon={
                            <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                          }
                        >
                          Next Step
                        </Button>
                      </div>
                    </FormStep>
                  )}

                  {/* Step 3: Individual Document Upload */}
                  {step === 3 && userType === "individual" && (
                    <FormStep
                      isActive={step === 3 && userType === "individual"}
                    >
                      <h2 className="text-xl font-bold text-white mb-2">
                        Verify Your Identity
                      </h2>
                      <p className="text-primary-100 mb-6">
                        Please upload the following documents to verify your
                        identity
                      </p>

                      <div className="space-y-6">
                        <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/10 p-6 text-center transition-all hover:border-white/50 hover:bg-white/15">
                          <div className="space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100">
                              <HiIdentification className="h-7 w-7 text-accent-600" />
                            </div>
                            <div className="text-sm text-white">
                              <label
                                htmlFor="gov-id"
                                className="relative cursor-pointer rounded-md font-medium text-white underline hover:text-white/80 focus-within:outline-none"
                              >
                                <span>Upload Government ID</span>
                                <input
                                  id="gov-id"
                                  name="gov-id"
                                  type="file"
                                  className="sr-only"
                                />
                              </label>
                              <p>or drag and drop</p>
                            </div>
                            <p className="text-xs text-white/70">
                              Passport, Driver's License, or Government ID (PDF,
                              PNG, JPG)
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/10 p-6 text-center transition-all hover:border-white/50 hover:bg-white/15">
                          <div className="space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                              <HiDocumentText className="h-7 w-7 text-primary-600" />
                            </div>
                            <div className="text-sm text-white">
                              <label
                                htmlFor="college-id"
                                className="relative cursor-pointer rounded-md font-medium text-white underline hover:text-white/80 focus-within:outline-none"
                              >
                                <span>Upload College ID (Optional)</span>
                                <input
                                  id="college-id"
                                  name="college-id"
                                  type="file"
                                  className="sr-only"
                                />
                              </label>
                              <p>or drag and drop</p>
                            </div>
                            <p className="text-xs text-white/70">
                              Student ID card or enrollment proof (PDF, PNG,
                              JPG)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-between">
                        <Button
                          onClick={handleBack}
                          variant="outline"
                          className="border-white/50 "
                          leftIcon={<HiArrowLeft />}
                        >
                          Back
                        </Button>

                        <Button onClick={handleSubmit} isLoading={isLoading}>
                          Complete Signup
                        </Button>
                      </div>
                    </FormStep>
                  )}

                  {/* Step 3: Investor Verification */}
                  {step === 3 && userType === "investor" && (
                    <FormStep isActive={step === 3 && userType === "investor"}>
                      <h2 className="text-xl font-bold text-white mb-2">
                        Almost Done!
                      </h2>
                      <p className="text-primary-100 mb-6">
                        Verify your email and complete your profile to start
                        discovering startups
                      </p>

                      <div className="bg-white/20 rounded-lg border border-white/30 p-6 mb-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-secondary-100 flex items-center justify-center">
                            <HiMail className="h-6 w-6 text-secondary-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-white font-medium">
                              Email Verification
                            </h3>
                            <p className="text-white/70 text-sm">
                              We'll send a verification link to {formData.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/20 rounded-lg border border-white/30 p-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-secondary-100 flex items-center justify-center">
                            <HiIdentification className="h-6 w-6 text-secondary-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-white font-medium">
                              Optional: Verify Your Investor Status
                            </h3>
                            <p className="text-white/70 text-sm">
                              Upload proof of investor status for a verified
                              badge (optional)
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/10 p-4 text-center transition-all hover:border-white/50 hover:bg-white/15">
                            <div className="text-sm text-white">
                              <label
                                htmlFor="investor-proof"
                                className="relative cursor-pointer rounded-md font-medium text-white underline hover:text-white/80 focus-within:outline-none"
                              >
                                <span>Upload Verification Document</span>
                                <input
                                  id="investor-proof"
                                  name="investor-proof"
                                  type="file"
                                  className="sr-only"
                                />
                              </label>
                              <p className="text-xs text-white/70 mt-1">
                                Business card, firm website listing, accredited
                                investor proof, etc.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-between">
                        <Button
                          onClick={handleBack}
                          variant="outline"
                          className="border-white/50 "
                          leftIcon={<HiArrowLeft />}
                        >
                          Back
                        </Button>

                        <Button onClick={handleSubmit} isLoading={isLoading}>
                          Complete Signup
                        </Button>
                      </div>
                    </FormStep>
                  )}

                  {/* Final Step: Startup - Complete Signup */}
                  {step === 4 && userType === "startup" && (
                    <FormStep isActive={step === 4 && userType === "startup"}>
                      <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                          <HiCheckCircle className="h-8 w-8 text-primary-600" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">
                          You're All Set!
                        </h2>
                        <p className="text-primary-100">
                          Your information has been submitted and is being
                          reviewed
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white/20 rounded-lg border border-white/30 p-4">
                          <h3 className="font-medium text-white mb-1">
                            Next Steps:
                          </h3>
                          <ol className="text-white/80 text-sm list-decimal list-inside space-y-2">
                            <li>
                              Verify your email address using the link we sent
                            </li>
                            <li>Upload a 30-second pitch video</li>
                            <li>
                              Start matching with investors and co-founders
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-center">
                        <Button
                          onClick={handleSubmit}
                          className=" px-8"
                          isLoading={isLoading}
                        >
                          Get Started
                        </Button>
                      </div>
                    </FormStep>
                  )}
                </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/5 py-4 mt-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-white/60">
              © 2025 The Arc. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link
                to="/terms"
                className="text-sm text-white/60 hover:text-white"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-white/60 hover:text-white"
              >
                Privacy
              </Link>
              <Link
                to="/contact"
                className="text-sm text-white/60 hover:text-white"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignupPage;
