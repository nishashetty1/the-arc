import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { DashboardLayout } from "../components";
import { Card, Button, Input, Select, Alert, Spinner, ImageUpload } from "../components";
import { HiUser, HiBriefcase, HiMail, HiPhone, HiGlobe } from "react-icons/hi";
import { FaLinkedin, FaTwitter, FaGithub, FaInstagram } from "react-icons/fa";
import useAuthStore from "../stores/authStore";
import { db, auth } from "../utils/firebase/config";
import { INDUSTRIES, INTEREST_DOMAINS } from "../utils/constants/industries";

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    website: "",
    bio: "",
    position: "",
    location: "",
    interestedDomains: [] // Common for all user types
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    twitter: "",
    github: "",
    instagram: "",
    website: "",
  });
  
  // Additional profile data based on user type
  const [typeSpecificData, setTypeSpecificData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.uid) {
        navigate("/login");
        return;
      }
      
      setIsLoading(true);
      try {
        // Get complete user document from Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Set photo URL
          setPhotoURL(userData.photoURL || user.photoURL || "");
          
          // Set basic profile data from Firestore
          setProfileData({
            displayName: userData.displayName || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            website: userData.website || "",
            bio: userData.bio || "",
            position: userData.role || userData.position || "",
            location: userData.location || "",
            interestedDomains: userData.interestedDomains || []
          });

          // Set social links
          if (userData.socialLinks) {
            setSocialLinks(userData.socialLinks);
          }
          
          // Set type-specific data directly from user document
          if (userData.userType === "startup") {
            setTypeSpecificData({
              companyName: userData.company || "",
              role: userData.role || "",
              industry: userData.industry || "",
              teamSize: userData.teamSize || "",
              fundingRequired: userData.fundingRequired || "",
              currentStage: userData.currentStage || "",
              description: userData.description || userData.bio || "",
              lookingFor: userData.lookingFor || ""
            });
          } else if (userData.userType === "investor") {
            setTypeSpecificData({
              investmentFocus: userData.investmentFocus || [],
              stagePreference: userData.stagePreference || [],
              investmentRange: userData.investmentRange || "",
              portfolioSize: userData.portfolioSize || "",
              lookingFor: userData.lookingFor || ""
            });
          } else if (userData.userType === "individual") {
            setTypeSpecificData({
              skills: userData.skills || [],
              interestedDomains: userData.interestedDomains || [],
              lookingFor: userData.lookingFor || ""
            });
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageUploadSuccess = async (result) => {
    try {
      setUploadingImage(true);
      const imageUrl = result.url;
      
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: imageUrl
        });
      }
      
      // Update Firestore user document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        photoURL: imageUrl,
        updatedAt: new Date()
      });
      
      // Update local state
      setPhotoURL(imageUrl);
      
      // Update auth store
      updateUser({ photoURL: imageUrl });
      
      setSuccess("Profile photo updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile photo:", err);
      setError("Failed to update profile photo. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleImageUploadError = (errorMessage) => {
    setError(errorMessage || "Failed to upload image. Please try again.");
    setTimeout(() => setError(""), 5000);
  };
  
  const handleTypeSpecificChange = (e) => {
    const { name, value } = e.target;
    setTypeSpecificData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "typeSpecific") {
        setTypeSpecificData(prev => ({
          ...prev,
          [child]: value
        }));
      }
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const toggleInterestedDomain = (domain) => {
    setProfileData(prev => {
      const domains = prev.interestedDomains || [];
      if (domains.includes(domain)) {
        return {
          ...prev,
          interestedDomains: domains.filter(d => d !== domain)
        };
      } else {
        return {
          ...prev,
          interestedDomains: [...domains, domain]
        };
      }
    });
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");
    
    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName,
          photoURL: photoURL
        });
      }
      
      // Update user document in Firestore with all data
      const userRef = doc(db, "users", user.uid);
      const updateData = {
        displayName: profileData.displayName,
        photoURL: photoURL,
        phoneNumber: profileData.phoneNumber,
        website: profileData.website,
        bio: profileData.bio,
        position: profileData.position,
        location: profileData.location,
        interestedDomains: profileData.interestedDomains || [],
        socialLinks: socialLinks,
        updatedAt: new Date()
      };
      
      // Add type-specific fields to user document
      if (user.userType === "startup" && typeSpecificData) {
        updateData.company = typeSpecificData.companyName;
        updateData.role = typeSpecificData.role;
        updateData.industry = typeSpecificData.industry;
        updateData.teamSize = typeSpecificData.teamSize;
        updateData.fundingRequired = typeSpecificData.fundingRequired;
        updateData.currentStage = typeSpecificData.currentStage;
        updateData.lookingFor = typeSpecificData.lookingFor;
      } else if (user.userType === "investor" && typeSpecificData) {
        updateData.investmentFocus = typeSpecificData.investmentFocus;
        updateData.stagePreference = typeSpecificData.stagePreference;
        updateData.investmentRange = typeSpecificData.investmentRange;
        updateData.portfolioSize = typeSpecificData.portfolioSize;
        updateData.lookingFor = typeSpecificData.lookingFor;
      } else if (user.userType === "individual" && typeSpecificData) {
        updateData.skills = typeSpecificData.skills;
        updateData.interestedDomains = typeSpecificData.interestedDomains;
        updateData.lookingFor = typeSpecificData.lookingFor;
      }
      
      await updateDoc(userRef, updateData);
      
      // Update local auth store
      updateUser({
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        website: profileData.website,
        bio: profileData.bio,
        position: profileData.position,
        location: profileData.location,
        interestedDomains: profileData.interestedDomains
      });
      
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render different fields based on user type
  const renderTypeSpecificFields = () => {
    if (!user || !user.userType || !typeSpecificData) return null;
    
    switch (user.userType) {
      case "startup":
        return (
          <>
            <div className="col-span-2 mt-4">
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <HiBriefcase className="mr-2 h-5 w-5 text-primary-600" />
                Startup Information
              </h4>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <Input
                id="companyName"
                name="companyName"
                label="Company Name"
                value={typeSpecificData.companyName || ""}
                onChange={handleTypeSpecificChange}
                disabled={!isEditing}
                placeholder="Your startup name"
                leftIcon={<HiBriefcase className="h-5 w-5 text-neutral-400" />}
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <Select
                id="industry"
                name="industry"
                label="Industry"
                value={typeSpecificData.industry || ""}
                onValueChange={(value) => handleSelectChange("typeSpecific.industry", value)}
                disabled={!isEditing}
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <Input
                id="currentStage"
                name="currentStage"
                label="Current Stage"
                value={typeSpecificData.currentStage || ""}
                onChange={handleTypeSpecificChange}
                disabled={!isEditing}
                placeholder="e.g., Seed, Series A"
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <Input
                id="teamSize"
                name="teamSize"
                label="Team Size"
                value={typeSpecificData.teamSize || ""}
                onChange={handleTypeSpecificChange}
                disabled={!isEditing}
                placeholder="e.g., 5-10"
              />
            </div>
            
            <div className="col-span-2">
              <div className="space-y-1.5">
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                  Company Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={typeSpecificData.description || ""}
                  onChange={handleTypeSpecificChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about your startup, what problem you're solving..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-600 transition-colors"
                />
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="space-y-1.5">
                <label htmlFor="lookingFor" className="block text-sm font-medium text-neutral-700">
                  What Are You Looking For?
                </label>
                <textarea
                  id="lookingFor"
                  name="lookingFor"
                  value={typeSpecificData.lookingFor || ""}
                  onChange={handleTypeSpecificChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="e.g., Investors, Co-founders, Advisors, Partnerships..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-600 transition-colors"
                />
              </div>
            </div>
          </>
        );
      
      case "investor":
        return (
          <>
            <div className="col-span-2 mt-4">
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <HiBriefcase className="mr-2 h-5 w-5 text-primary-600" />
                Investor Information
              </h4>
            </div>
            
            <div className="col-span-2">
              <Input
                id="investmentSize"
                name="investmentSize"
                label="Investment Size"
                value={typeSpecificData.investmentSize || ""}
                onChange={handleTypeSpecificChange}
                disabled={!isEditing}
                placeholder="e.g., $50K - $500K"
              />
            </div>
            
            <div className="col-span-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Investment Focus
                </label>
                {isEditing ? (
                  <Input
                    id="investmentFocus"
                    name="investmentFocus"
                    value={typeSpecificData.investmentFocus ? typeSpecificData.investmentFocus.join(", ") : ""}
                    onChange={(e) => {
                      const focusArray = e.target.value.split(",").map(item => item.trim()).filter(item => item);
                      handleTypeSpecificChange({ target: { name: "investmentFocus", value: focusArray } });
                    }}
                    placeholder="e.g., SaaS, AI, FinTech (comma separated)"
                    disabled={!isEditing}
                  />
                ) : (
                  <div className="text-sm text-neutral-700 px-4 py-2.5 bg-neutral-50 rounded-lg border border-neutral-300">
                    {typeSpecificData.investmentFocus && typeSpecificData.investmentFocus.length > 0 
                      ? typeSpecificData.investmentFocus.join(", ")
                      : "Not specified"}
                  </div>
                )}
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="space-y-1.5">
                <label htmlFor="lookingFor" className="block text-sm font-medium text-neutral-700">
                  What Are You Looking For?
                </label>
                <textarea
                  id="lookingFor"
                  name="lookingFor"
                  value={typeSpecificData.lookingFor || ""}
                  onChange={handleTypeSpecificChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="e.g., Early-stage startups, Co-investment opportunities..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-600 transition-colors"
                />
              </div>
            </div>
          </>
        );
        
      case "individual":
        return (
          <>
            <div className="col-span-2 mt-4">
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <HiUser className="mr-2 h-5 w-5 text-primary-600" />
                Additional Information
              </h4>
            </div>
            
            <div className="col-span-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Skills & Interests
                </label>
                {isEditing ? (
                  <Input
                    id="interests"
                    name="interests"
                    value={typeSpecificData.interests ? typeSpecificData.interests.join(", ") : ""}
                    onChange={(e) => {
                      const interestsArray = e.target.value.split(",").map(item => item.trim()).filter(item => item);
                      handleTypeSpecificChange({ target: { name: "interests", value: interestsArray } });
                    }}
                    placeholder="e.g., Web Development, Marketing, Design (comma separated)"
                    disabled={!isEditing}
                  />
                ) : (
                  <div className="text-sm text-neutral-700 px-4 py-2.5 bg-neutral-50 rounded-lg border border-neutral-300">
                    {typeSpecificData.interests && typeSpecificData.interests.length > 0 
                      ? typeSpecificData.interests.join(", ")
                      : "Not specified"}
                  </div>
                )}
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="space-y-1.5">
                <label htmlFor="lookingFor" className="block text-sm font-medium text-neutral-700">
                  What Are You Looking For?
                </label>
                <textarea
                  id="lookingFor"
                  name="lookingFor"
                  value={typeSpecificData.lookingFor || ""}
                  onChange={handleTypeSpecificChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="e.g., Job opportunities, Freelance projects, Collaborations..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-600 transition-colors"
                />
              </div>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <DashboardLayout
      user={user}
      userType={user?.userType || ""}
      pageTitle="Your Profile"
      pageDescription="View and manage your profile information"
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-4">
              {success}
            </Alert>
          )}
          
          <Card className="overflow-hidden shadow-xl border-neutral-200">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                  <p className="text-primary-100 text-sm mt-1">
                    Manage your account information and preferences
                  </p>
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        form="profile-form"
                        disabled={isSaving}
                        className="bg-white text-primary-600 hover:bg-primary-50"
                      >
                        {isSaving ? (
                          <span className="flex items-center">
                            <Spinner size="sm" className="mr-2" />
                            Saving...
                          </span>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-primary-600 hover:bg-primary-50"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <form id="profile-form" onSubmit={handleSubmit}>
                {/* Modern Profile Header */}
                {!isEditing ? (
                  <div className="mb-8">
                    {/* Cover/Banner Area with better gradient */}
                    <div className="relative h-56 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 rounded-3xl mb-24 overflow-hidden shadow-xl">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tMiAwaC0yVjBoMnYzMHptLTIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                      
                      {/* Profile Picture - Larger and more prominent */}
                      <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 md:left-12 md:translate-x-0">
                        <div className="relative">
                          {photoURL ? (
                            <img
                              src={photoURL}
                              alt={profileData.displayName || "Profile"}
                              className="h-40 w-40 rounded-full object-cover border-8 border-white shadow-2xl ring-4 ring-primary-100"
                            />
                          ) : (
                            <div className="h-40 w-40 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-6xl font-bold border-8 border-white shadow-2xl ring-4 ring-primary-100">
                              {(profileData.displayName || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-white"></div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Info - Centered on mobile, left-aligned on desktop */}
                    <div className="px-8 mb-8">
                      <div className="text-center md:text-left mb-6">
                        <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                          {profileData.displayName || "User"}
                        </h1>
                        {profileData.position && (
                          <p className="text-xl text-neutral-600 mb-3 font-medium">
                            {profileData.position}
                          </p>
                        )}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md">
                            {user?.userType === "startup" ? "🚀 Startup Founder" : 
                             user?.userType === "investor" ? "💼 Investor" : 
                             "👤 Individual Creator"}
                          </span>
                          {profileData.location && (
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white text-neutral-700 border-2 border-neutral-200 shadow-md">
                              📍 {profileData.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bio with better styling */}
                      {profileData.bio && (
                        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 mb-6 border border-neutral-200">
                          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">About</h3>
                          <p className="text-neutral-700 leading-relaxed text-base">
                            {profileData.bio}
                          </p>
                        </div>
                      )}

                      {/* Social Links Icons - Better styling */}
                      {(socialLinks.linkedin || socialLinks.twitter || socialLinks.github || socialLinks.instagram || socialLinks.website) && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Connect</h3>
                          <div className="flex gap-3">
                            {socialLinks.linkedin && (
                              <a
                                href={socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#0A66C2] text-white hover:scale-110 hover:shadow-lg transition-all duration-200"
                                title="LinkedIn"
                              >
                                <FaLinkedin className="h-6 w-6" />
                              </a>
                            )}
                            {socialLinks.twitter && (
                              <a
                                href={socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#1DA1F2] text-white hover:scale-110 hover:shadow-lg transition-all duration-200"
                                title="Twitter/X"
                              >
                                <FaTwitter className="h-6 w-6" />
                              </a>
                            )}
                            {socialLinks.github && (
                              <a
                                href={socialLinks.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-12 w-12 rounded-xl bg-neutral-900 text-white hover:scale-110 hover:shadow-lg transition-all duration-200"
                                title="GitHub"
                              >
                                <FaGithub className="h-6 w-6" />
                              </a>
                            )}
                            {socialLinks.instagram && (
                              <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:scale-110 hover:shadow-lg transition-all duration-200"
                                title="Instagram"
                              >
                                <FaInstagram className="h-6 w-6" />
                              </a>
                            )}
                            {socialLinks.website && (
                              <a
                                href={socialLinks.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white hover:scale-110 hover:shadow-lg transition-all duration-200"
                                title="Website"
                              >
                                <HiGlobe className="h-6 w-6" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact Info Cards - Enhanced design */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {profileData.email && (
                          <div className="bg-white rounded-2xl p-5 flex items-center space-x-4 border-2 border-neutral-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
                                <HiMail className="h-6 w-6 text-primary-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide mb-1">Email</p>
                              <p className="text-sm text-neutral-900 font-medium truncate">{profileData.email}</p>
                            </div>
                          </div>
                        )}
                        {profileData.phoneNumber && (
                          <div className="bg-white rounded-2xl p-5 flex items-center space-x-4 border-2 border-neutral-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-xl bg-secondary-100 flex items-center justify-center">
                                <HiPhone className="h-6 w-6 text-secondary-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide mb-1">Phone</p>
                              <p className="text-sm text-neutral-900 font-medium truncate">{profileData.phoneNumber}</p>
                            </div>
                          </div>
                        )}
                        {profileData.website && (
                          <div className="bg-white rounded-2xl p-5 flex items-center space-x-4 border-2 border-neutral-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <HiGlobe className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide mb-1">Website</p>
                              <a 
                                href={profileData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 font-medium truncate hover:underline block"
                              >
                                {profileData.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Interested Domains - Enhanced design */}
                      {profileData.interestedDomains && profileData.interestedDomains.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Interested In</h3>
                          <div className="flex flex-wrap gap-2">
                            {profileData.interestedDomains.map((domain) => (
                              <span
                                key={domain}
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 border-2 border-primary-200 hover:shadow-md transition-shadow duration-200"
                              >
                                {domain}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Type-Specific Info - Enhanced */}
                      {typeSpecificData && (
                        <div className="mt-8 pt-6 border-t-2 border-neutral-200">
                          {renderTypeSpecificFields()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Edit Mode - Detailed Form
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Profile Photo Upload */}
                    <div className="col-span-2">
                      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-8 mb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                          <div className="relative group">
                            {photoURL ? (
                              <img
                                src={photoURL}
                                alt={profileData.displayName || "Profile"}
                                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
                                {(profileData.displayName || "U").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <ImageUpload
                                currentImageUrl={photoURL}
                                onUploadSuccess={handleImageUploadSuccess}
                                onUploadError={handleImageUploadError}
                                buttonText="Change"
                                showPreview={false}
                              />
                            </div>
                          </div>
                          
                          <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                              Edit Your Profile
                            </h3>
                            <p className="text-neutral-600 text-sm">
                              Update your information and settings
                            </p>
                            {uploadingImage && (
                              <div className="mt-3 flex items-center justify-center md:justify-start">
                                <Spinner size="sm" className="mr-2" />
                                <span className="text-xs text-primary-600">
                                  Uploading photo...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  
                  {/* Personal Information Section */}
                  <div className="col-span-2">
                    <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                      <HiUser className="mr-2 h-5 w-5 text-primary-600" />
                      Personal Information
                    </h4>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="displayName"
                      name="displayName"
                      label="Full Name"
                      value={profileData.displayName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      leftIcon={<HiUser className="h-5 w-5 text-neutral-400" />}
                      required
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="email"
                      name="email"
                      label="Email Address"
                      value={profileData.email}
                      disabled={true}
                      leftIcon={<HiMail className="h-5 w-5 text-neutral-400" />}
                      helpText="Email cannot be changed"
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      label="Phone Number"
                      value={profileData.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                      leftIcon={<HiPhone className="h-5 w-5 text-neutral-400" />}
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="location"
                      name="location"
                      label="Location"
                      value={profileData.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  
                  {/* Professional Information Section */}
                  <div className="col-span-2 mt-4">
                    <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                      <HiBriefcase className="mr-2 h-5 w-5 text-primary-600" />
                      Professional Information
                    </h4>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="position"
                      name="position"
                      label="Position"
                      value={profileData.position}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="CEO, Founder, Developer..."
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="website"
                      name="website"
                      label="Website"
                      value={profileData.website}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      leftIcon={<HiGlobe className="h-5 w-5 text-neutral-400" />}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="space-y-1.5">
                      <label htmlFor="bio" className="block text-sm font-medium text-neutral-700">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about yourself, your interests, and what you're working on..."
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                      />
                      <p className="text-xs text-neutral-500">
                        {profileData.bio.length}/500 characters
                      </p>
                    </div>
                  </div>

                  {/* Social Media & Links Section */}
                  <div className="col-span-2 mt-4">
                    <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                      <HiGlobe className="mr-2 h-5 w-5 text-primary-600" />
                      Social Media & Links
                    </h4>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="linkedin"
                      name="linkedin"
                      label="LinkedIn"
                      value={socialLinks.linkedin}
                      onChange={handleSocialLinkChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      leftIcon={<FaLinkedin className="h-5 w-5 text-[#0A66C2]" />}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="twitter"
                      name="twitter"
                      label="Twitter/X"
                      value={socialLinks.twitter}
                      onChange={handleSocialLinkChange}
                      placeholder="https://twitter.com/yourhandle"
                      leftIcon={<FaTwitter className="h-5 w-5 text-[#1DA1F2]" />}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="github"
                      name="github"
                      label="GitHub"
                      value={socialLinks.github}
                      onChange={handleSocialLinkChange}
                      placeholder="https://github.com/yourusername"
                      leftIcon={<FaGithub className="h-5 w-5 text-neutral-900" />}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Input
                      id="instagram"
                      name="instagram"
                      label="Instagram"
                      value={socialLinks.instagram}
                      onChange={handleSocialLinkChange}
                      placeholder="https://instagram.com/yourhandle"
                      leftIcon={<FaInstagram className="h-5 w-5 text-[#E4405F]" />}
                    />
                  </div>

                  <div className="col-span-2">
                    <Input
                      id="socialWebsite"
                      name="website"
                      label="Personal Website"
                      value={socialLinks.website}
                      onChange={handleSocialLinkChange}
                      placeholder="https://yourpersonalwebsite.com"
                      leftIcon={<HiGlobe className="h-5 w-5 text-neutral-600" />}
                    />
                  </div>
                  
                  {/* Interested Domains - Common for all user types */}
                  <div className="col-span-2 mt-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-neutral-700">
                        Interested Domains
                        <span className="text-xs text-neutral-500 ml-2">(Select all that apply)</span>
                      </label>
                      <div className="flex flex-wrap gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-300 min-h-[80px]">
                        {INTEREST_DOMAINS.map((domain) => {
                          const isSelected = profileData.interestedDomains?.includes(domain);
                          return (
                            <button
                              key={domain}
                              type="button"
                              onClick={() => toggleInterestedDomain(domain)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer hover:scale-105 ${
                                isSelected
                                  ? 'bg-primary-500 text-white shadow-md'
                                  : 'bg-white text-neutral-700 border border-neutral-300 hover:border-primary-400'
                              }`}
                            >
                              {domain}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-neutral-500">
                        {profileData.interestedDomains?.length || 0} domain(s) selected
                      </p>
                    </div>
                  </div>
                  
                  {/* Type-specific fields */}
                  {renderTypeSpecificFields()}
                </div>
                )}
              </form>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;