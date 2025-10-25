import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { MainLayout } from "../components";
import { Button, Card, CardContent } from "../components";
import {
  HiLightningBolt,
  HiUsers,
  HiShieldCheck,
  HiArrowRight,
  HiSparkles,
  HiTrendingUp,
  HiGlobe,
  HiUser,
  HiCurrencyDollar,
} from "react-icons/hi";

const LandingPage = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const isCtaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const statsData = [
    { number: "10K+", label: "Active Startups", icon: HiTrendingUp },
    { number: "5K+", label: "Investors", icon: HiUsers },
    { number: "2.5K+", label: "Successful Matches", icon: HiLightningBolt },
    { number: "150+", label: "Countries", icon: HiGlobe },
  ];

  const features = [
    {
      icon: HiLightningBolt,
      title: "AI-Powered Matching",
      description:
        "Our advanced algorithm analyzes your startup's DNA to find the perfect investors and co-founders who align with your vision and values.",
      color: "primary",
    },
    {
      icon: HiUsers,
      title: "Verified Network",
      description:
        "Connect with thoroughly vetted investors and experienced entrepreneurs who are actively seeking opportunities in your sector.",
      color: "secondary",
    },
    {
      icon: HiShieldCheck,
      title: "Enterprise Security",
      description:
        "Your sensitive data and pitch materials are protected with bank-grade encryption and granular privacy controls.",
      color: "accent",
    },
  ];

  const backgroundPattern =
    "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 pt-20 pb-32">
        {/* Background Effects */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url("${backgroundPattern}")` }}
        ></div>

        <div
          className="container relative mx-auto px-4 sm:px-6 lg:px-8"
          ref={heroRef}
        >
          <motion.div
            initial="hidden"
            animate={isHeroInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <motion.div
                className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <HiSparkles className="mr-2 h-4 w-4" />
                Trusted by 10,000+ entrepreneurs worldwide
              </motion.div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Where Great Ideas
              <br />
              <span className="bg-gradient-to-r from-accent-300 to-secondary-300 bg-clip-text text-transparent">
                Connect. Match. Grow.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-primary-100"
            >
              Connect with investors, co-founders, and mentors who believe in
              your vision.
            </motion.p>

            {/* "I am a..." heading */}
            <motion.div variants={itemVariants} className="mt-12">
              <h3 className="text-xl font-medium text-white mb-6">I am a...</h3>
            </motion.div>

            {/* User Type Selection Cards */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {/* Startup Founder Card */}
                <Link to="/email-onboarding?type=startup">
                  <motion.div
                    whileHover={{
                      y: -8,
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    whileTap={{ y: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/30 p-6 hover:bg-white/20 transition-all duration-300 group cursor-pointer h-full"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-4 shadow-lg">
                        <HiLightningBolt className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Startup Founder
                      </h3>
                      <p className="text-primary-100 text-sm">
                        Connect with investors and launch your vision
                      </p>
                      <div className="mt-4 bg-white/20 rounded-full py-1 px-4 text-xs font-medium text-white inline-flex items-center group-hover:bg-primary-600 transition-all">
                        <span>Get Started</span>
                        <HiArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* Individual Card */}
                <Link to="/email-onboarding?type=individual">
                  <motion.div
                    whileHover={{
                      y: -8,
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    whileTap={{ y: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/30 p-6 hover:bg-white/20 transition-all duration-300 group cursor-pointer h-full"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mb-4 shadow-lg">
                        <HiUser className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Individual
                      </h3>
                      <p className="text-primary-100 text-sm">
                        Share your ideas and find collaborators
                      </p>
                      <div className="mt-4 bg-white/20 rounded-full py-1 px-4 text-xs font-medium text-white inline-flex items-center group-hover:bg-accent-600 transition-all">
                        <span>Get Started</span>
                        <HiArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* Investor Card */}
                <Link to="/email-onboarding?type=investor">
                  <motion.div
                    whileHover={{
                      y: -8,
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    whileTap={{ y: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/30 p-6 hover:bg-white/20 transition-all duration-300 group cursor-pointer h-full"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center mb-4 shadow-lg">
                        <HiCurrencyDollar className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Investor
                      </h3>
                      <p className="text-primary-100 text-sm">
                        Discover promising startups to fund
                      </p>
                      <div className="mt-4 bg-white/20 rounded-full py-1 px-4 text-xs font-medium text-white inline-flex items-center group-hover:bg-secondary-600 transition-all">
                        <span>Get Started</span>
                        <HiArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute right-10 top-20 hidden lg:block"
        >
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 opacity-20"></div>
        </motion.div>

        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute left-16 top-40 hidden lg:block"
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 opacity-20"></div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 pb-20" ref={statsRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={isStatsInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="mx-auto max-w-6xl"
          >
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl h-full">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                        <stat.icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="text-3xl font-bold text-neutral-900">
                        {stat.number}
                      </div>
                      <div className="text-sm font-medium text-neutral-600">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-24 bg-gradient-to-b from-neutral-50 to-white"
        ref={featuresRef}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="mx-auto max-w-6xl"
          >
            <motion.div
              variants={itemVariants}
              className="mx-auto max-w-3xl text-center"
            >
              <h2 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Built for Modern
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Entrepreneurs
                </span>
              </h2>
              <p className="mt-6 text-xl leading-8 text-neutral-600">
                Every feature is designed to help you build meaningful
                connections and accelerate your startup's growth.
              </p>
            </motion.div>

            <div className="mt-20 grid gap-12 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="group border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                    <CardContent className="p-8">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 group-hover:from-primary-200 group-hover:to-primary-300 transition-all duration-300">
                        <feature.icon className="h-8 w-8 text-primary-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-24 bg-gradient-to-r from-primary-900 to-primary-800 overflow-hidden"
        ref={ctaRef}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url("${backgroundPattern}")` }}
        ></div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={isCtaInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
            >
              Ready to Transform Your
              <br />
              <span className="bg-gradient-to-r from-accent-300 to-secondary-300 bg-clip-text text-transparent">
                Startup Journey?
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mx-auto mt-6 max-w-2xl text-xl text-primary-100"
            >
              Join thousands of entrepreneurs who have found their perfect
              match. Your next breakthrough is just one connection away.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-10">
              <Link to="/onboarding">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    className="group bg-neutral px-12 py-4 text-lg font-semibold text-primary-700 hover:bg-neutral-50"
                  >
                    Start Building Today
                    <HiArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
