import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiUser, 
  HiBriefcase, 
  HiCurrencyDollar,
  HiArrowRight,
  HiUpload,
  HiX,
  HiCheckCircle,
  HiGlobe,
  HiCamera
} from "react-icons/hi";
import { FaLinkedin, FaTwitter, FaGithub, FaInstagram } from "react-icons/fa";
import { Button, Input, Select, Alert, Spinner } from "../components";
import { OnboardingLayout } from "../components";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { db, storage } from "../utils/firebase/config";
import useAuthStore from "../stores/authStore";
import { INDUSTRIES, INTEREST_DOMAINS } from "../utils/constants/industries";

const GoogleOnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  const queryParams = new URLSearchParams(location.search);
  const userTypeFromUrl = queryParams.get("type") || "startup";
  
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(userTypeFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(user?.photoURL || null);
  
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    location: "",
    bio: "",
    companyName: "",
    role: "",
    industry: "",
    teamSize: "",
    fundingRequired: "",
    currentStage: "",
    skills: [],
    interestedDomains: [],
    lookingFor: "",
    investmentFocus: [],
    stagePreference: [],
    investmentRange: "",
    portfolioSize: "",
    linkedinUrl: "",
    twitterUrl: "",
    githubUrl: "",
    instagramUrl: "",
    websiteUrl: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/signup");
    }
  }, [user, navigate]);

  const stageOptions = [
    { value: "idea", label: "Idea Stage" },
    { value: "prototype", label: "Prototype" },
    { value: "mvp", label: "MVP" },
    { value: "launched", label: "Launched" },
    { value: "growth", label: "Growth Stage" },
    { value: "scaling", label: "Scaling" }
  ];

  const investmentRanges = [
    { value: "0-50k", label: "$0 - $50K" },
    { value: "50k-250k", label: "$50K - $250K" },
    { value: "250k-1m", label: "$250K - $1M" },
    { value: "1m-5m", label: "$1M - $5M" },
    { value: "5m+", label: "$5M+" }
  ];

  const teamSizeOptions = [
    { value: "1", label: "Just me" },
    { value: "2-5", label: "2-5 members" },
    { value: "6-10", label: "6-10 members" },
    { value: "11-25", label: "11-25 members" },
    { value: "25+", label: "25+ members" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const toggleArrayItem = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(user?.photoURL || null);
  };

  const validateStep = () => {
    setError("");
    
    if (step === 1) {
      if (!formData.name.trim()) {
        setError("Name is required");
        return false;
      }
      if (!formData.location.trim()) {
        setError("Location is required");
        return false;
      }
      
      if (userType === "startup") {
        if (!formData.companyName.trim()) {
          setError("Company name is required");
          return false;
        }
        if (!formData.industry) {
          setError("Please select an industry");
          return false;
        }
      } else if (userType === "individual") {
        if (formData.interestedDomains.length === 0) {
          setError("Please select at least one interested domain");
          return false;
        }
      } else if (userType === "investor") {
        if (formData.investmentFocus.length === 0) {
          setError("Please select at least one investment focus area");
          return false;
        }
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError("");
  };

  const handleSkip = () => {
    if (step === 3) {
      handleSubmit();
    } else {
      setStep(prev => prev + 1);
      setError("");
    }
  };

  const uploadProfileImage = async (userId) => {
    if (!profileImageFile) return null;
    
    try {
      const fileExtension = profileImageFile.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profileImages/${fileName}`);
      
      await uploadBytes(storageRef, profileImageFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (step !== 3 && !validateStep()) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      let photoURL = user.photoURL;
      if (profileImageFile) {
        photoURL = await uploadProfileImage(user.uid);
        await updateProfile(user, { photoURL });
      }
      
      const userData = {
        uid: user.uid,
        displayName: formData.name,
        email: user.email,
        photoURL: photoURL,
        userType: userType,
        location: formData.location,
        bio: formData.bio || "",
        socialLinks: {
          linkedin: formData.linkedinUrl || "",
          twitter: formData.twitterUrl || "",
          github: formData.githubUrl || "",
          instagram: formData.instagramUrl || "",
          website: formData.websiteUrl || ""
        },
        onboardingCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (userType === "startup") {
        userData.company = formData.companyName;
        userData.role = formData.role;
        userData.industry = formData.industry;
        userData.teamSize = formData.teamSize;
        userData.fundingRequired = formData.fundingRequired;
        userData.currentStage = formData.currentStage;
      } else if (userType === "individual") {
        userData.skills = formData.skills;
        userData.interestedDomains = formData.interestedDomains;
        userData.lookingFor = formData.lookingFor;
      } else if (userType === "investor") {
        userData.investmentFocus = formData.investmentFocus;
        userData.stagePreference = formData.stagePreference;
        userData.investmentRange = formData.investmentRange;
        userData.portfolioSize = formData.portfolioSize;
      }
      
      await setDoc(doc(db, "users", user.uid), userData);
      
      setUser({
        uid: user.uid,
        displayName: formData.name,
        email: user.email,
        photoURL: photoURL,
        userType: userType,
        onboardingCompleted: true
      });
      
      navigate("/dashboard");
      
    } catch (err) {
      console.error("Error during onboarding:", err);
      setError(err.message || "Failed to complete signup. Please try again.");
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return userType === "startup" ? "Tell Us About Your Startup" :
               userType === "investor" ? "Tell Us About Your Investment Focus" :
               "Tell Us About Yourself";
      case 2:
        return "Add Profile Picture";
      case 3:
        return "Connect Your Social Media";
      default:
        return "";
    }
  };

  const getUserTypeIcon = () => {
    switch (userType) {
      case "startup":
        return <HiBriefcase className="h-6 w-6" />;
      case "investor":
        return <HiCurrencyDollar className="h-6 w-6" />;
      default:
        return <HiUser className="h-6 w-6" />;
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case "startup":
        return "Startup Founder";
      case "investor":
        return "Investor";
      default:
        return "Individual";
    }
  };

  if (!user) {
    return null;
  }

  return (
    <OnboardingLayout
      title={getStepTitle()}
      subtitle={`Step ${step} of 3 • ${getUserTypeLabel()}`}
      currentStep={step}
      totalSteps={3}
      onBackClick={step > 1 ? handleBack : undefined}
      showBackButton={step > 1}
    >
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 px-4 py-2 rounded-full shadow-soft">
            {getUserTypeIcon()}
            <span className="font-semibold">{getUserTypeLabel()}</span>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="error">{error}</Alert>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-soft p-8 space-y-5">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  icon={HiUser}
                  required
                />
                
                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  icon={HiGlobe}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    className="w-full px-4 py-2 text-neutral-900 bg-white border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>

                {userType === "startup" && (
                  <>
                    <Input
                      label="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Your company name"
                      icon={HiBriefcase}
                      required
                    />
                    
                    <Input
                      label="Your Role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g., CEO, CTO, Co-founder"
                    />
                    
                    <Select
                      label="Industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </Select>
                    
                    <Select
                      label="Team Size"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                    >
                      <option value="">Select team size</option>
                      {teamSizeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                    
                    <Input
                      label="Funding Required"
                      name="fundingRequired"
                      value={formData.fundingRequired}
                      onChange={handleChange}
                      placeholder="e.g., $100K - $500K"
                    />
                    
                    <Select
                      label="Current Stage"
                      name="currentStage"
                      value={formData.currentStage}
                      onChange={handleChange}
                    >
                      <option value="">Select stage</option>
                      {stageOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                  </>
                )}

                {userType === "individual" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Interested Domains *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_DOMAINS.map(domain => (
                          <button
                            key={domain}
                            type="button"
                            onClick={() => toggleArrayItem("interestedDomains", domain)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.interestedDomains.includes(domain)
                                ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            {domain}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Input
                      label="What Are You Looking For?"
                      name="lookingFor"
                      value={formData.lookingFor}
                      onChange={handleChange}
                      placeholder="e.g., Co-founder, Mentor, Investor"
                    />
                  </>
                )}

                {userType === "investor" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Investment Focus Areas *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_DOMAINS.map(domain => (
                          <button
                            key={domain}
                            type="button"
                            onClick={() => toggleArrayItem("investmentFocus", domain)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.investmentFocus.includes(domain)
                                ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            {domain}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Stage Preference
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {stageOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleArrayItem("stagePreference", option.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.stagePreference.includes(option.value)
                                ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Select
                      label="Investment Range"
                      name="investmentRange"
                      value={formData.investmentRange}
                      onChange={handleChange}
                    >
                      <option value="">Select range</option>
                      {investmentRanges.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                    
                    <Input
                      label="Portfolio Size"
                      name="portfolioSize"
                      value={formData.portfolioSize}
                      onChange={handleChange}
                      placeholder="Number of active investments"
                      type="number"
                    />
                  </>
                )}
              </div>

              <Button
                onClick={handleNext}
                className="w-full flex items-center justify-center space-x-2"
                size="lg"
              >
                <span>Continue</span>
                <HiArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-soft p-8">
                <div className="flex flex-col items-center">
                  {profileImagePreview ? (
                    <div className="relative">
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="h-40 w-40 rounded-full object-cover shadow-lg border-4 border-primary-100"
                      />
                      {profileImageFile && (
                        <button
                          onClick={removeImage}
                          className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <HiX className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="h-40 w-40 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center border-4 border-dashed border-neutral-300">
                      <HiCamera className="h-16 w-16 text-neutral-400" />
                    </div>
                  )}
                  
                  <label
                    htmlFor="profileImage"
                    className="mt-6 cursor-pointer inline-flex items-center space-x-2 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium px-6 py-3 rounded-full transition-colors"
                  >
                    <HiUpload className="h-5 w-5" />
                    <span>{profileImagePreview ? "Change Photo" : "Upload Photo"}</span>
                  </label>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  <p className="mt-3 text-sm text-neutral-500 text-center">
                    {user.photoURL && !profileImageFile ? "Using photo from Google account" : "JPG, PNG or GIF • Max 5MB"}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center space-x-2"
                  size="lg"
                >
                  <span>Continue</span>
                  <HiArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-soft p-8 space-y-5">
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-2">
                    <FaLinkedin className="h-5 w-5 text-blue-600" />
                    <span>LinkedIn</span>
                  </label>
                  <Input
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-2">
                    <FaTwitter className="h-5 w-5 text-blue-400" />
                    <span>Twitter</span>
                  </label>
                  <Input
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleChange}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-2">
                    <FaGithub className="h-5 w-5 text-neutral-800" />
                    <span>GitHub</span>
                  </label>
                  <Input
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-2">
                    <FaInstagram className="h-5 w-5 text-pink-600" />
                    <span>Instagram</span>
                  </label>
                  <Input
                    name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleChange}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-2">
                    <HiGlobe className="h-5 w-5 text-green-600" />
                    <span>Website</span>
                  </label>
                  <Input
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  disabled={isLoading}
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center space-x-2"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="h-5 w-5" />
                      <span>Complete Signup</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingLayout>
  );
};

export default GoogleOnboardingPage;
