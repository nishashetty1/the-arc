// src/components/layout/OnboardingLayout.jsx
import React from "react";
import { Link } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import Footer from "./Footer";

const OnboardingLayout = ({
  children,
  title,
  subtitle,
  currentStep = 1,
  totalSteps = 1,
  onBackClick,
  showBackButton = true,
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white py-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-bold text-primary-600">
            The Arc
          </Link>

          <div className="text-sm text-neutral-500">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {showBackButton && onBackClick && (
              <button
                onClick={onBackClick}
                className="mb-6 inline-flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                <HiArrowLeft className="mr-1 h-4 w-4" />
                Back
              </button>
            )}

            {title && (
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                {title}
              </h1>
            )}

            {subtitle && <p className="mt-2 text-neutral-600">{subtitle}</p>}

            <div className="mt-8">
              {/* Progress bar */}
              <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-2 rounded-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>

              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer minimal />
    </div>
  );
};

export default OnboardingLayout;
