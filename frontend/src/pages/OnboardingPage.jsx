import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { OnboardingLayout } from "../components";
import { Button, Input, Select, Card } from "../components";
import { HiArrowRight, HiUpload, HiDocumentText, HiUser } from "react-icons/hi";

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    stage: "",
    teamSize: "",
    description: "",
  });
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

  const slideVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
    exit: {
      x: -20,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    navigate("/dashboard");
  };

  const stepTitles = [
    "Tell us about your startup",
    "Add more details",
    "Verify your identity",
  ];

  return (
    <OnboardingLayout
      title={
        <span className="text-2xl font-bold sm:text-3xl">
          {stepTitles[step - 1]}
        </span>
      }
      subtitle="Complete your profile to connect with investors and co-founders"
      currentStep={step}
      totalSteps={3}
      onBackClick={step > 1 ? handleBack : undefined}
      showBackButton={step > 1}
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        <div ref={formRef} className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial="hidden"
                animate={isFormInView ? "visible" : "hidden"}
                exit="exit"
                variants={slideVariants}
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNext();
                    }}
                    className="space-y-5"
                  >
                    <motion.div variants={itemVariants}>
                      <Input
                        label="Company Name"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter your company name"
                        required
                        leftIcon={<HiUser className="h-5 w-5" />}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Select
                        label="Industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        variant="default"
                        size="md"
                        required
                      >
                        <option value="">Select your industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="ecommerce">E-Commerce</option>
                        <option value="other">Other</option>
                      </Select>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Select
                        label="Team Size"
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleChange}
                        variant="default"
                        size="md"
                        required
                      >
                        <option value="">Select team size</option>
                        <option value="1">Just me</option>
                        <option value="2-5">2-5 people</option>
                        <option value="6-10">6-10 people</option>
                        <option value="11-50">11-50 people</option>
                        <option value="50+">50+ people</option>
                      </Select>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex justify-end pt-4"
                    >
                      <Button
                        type="submit"
                        className="group"
                        rightIcon={
                          <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                        }
                      >
                        Next Step
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideVariants}
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNext();
                    }}
                    className="space-y-5"
                  >
                    <motion.div variants={itemVariants}>
                      <Select
                        label="Team Size"
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select team size</option>
                        <option value="1">Just me</option>
                        <option value="2-5">2-5 people</option>
                        <option value="6-10">6-10 people</option>
                        <option value="11-50">11-50 people</option>
                        <option value="50+">50+ people</option>
                      </Select>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Describe your startup in a few sentences"
                        value={formData.description}
                        onChange={handleChange}
                        required
                      />
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex justify-between pt-4"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="group"
                        rightIcon={
                          <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                        }
                      >
                        Next Step
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideVariants}
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div variants={itemVariants}>
                      <h3 className="text-lg font-medium text-neutral-900 mb-2">
                        Upload Documents
                      </h3>
                      <p className="text-sm text-neutral-600 mb-4">
                        Please upload the following documents to verify your
                        startup:
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-4">
                      <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center transition-all hover:border-primary-300 hover:bg-primary-50">
                        <div className="space-y-3">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200">
                            <HiDocumentText className="h-7 w-7 text-primary-600" />
                          </div>
                          <div className="text-sm text-neutral-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                            >
                              <span>Upload business documents</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-neutral-500">
                            PDF, PNG, JPG up to 10MB
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center transition-all hover:border-primary-300 hover:bg-primary-50">
                        <div className="space-y-3">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary-100 to-secondary-200">
                            <HiUpload className="h-7 w-7 text-secondary-600" />
                          </div>
                          <div className="text-sm text-neutral-600">
                            <label
                              htmlFor="id-upload"
                              className="relative cursor-pointer rounded-md font-medium text-secondary-600 hover:text-secondary-500 focus-within:outline-none"
                            >
                              <span>Upload your ID</span>
                              <input
                                id="id-upload"
                                name="id-upload"
                                type="file"
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-neutral-500">
                            Passport, Driver's License, or ID Card
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex justify-between pt-4"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="group"
                        rightIcon={
                          <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                        }
                      >
                        Complete Setup
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </OnboardingLayout>
  );
};

export default OnboardingPage;
