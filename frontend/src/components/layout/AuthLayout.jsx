import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-bold text-primary-600">
                The Arc
              </span>
            </Link>
            {title && (
              <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-center text-sm text-neutral-600">
                {subtitle}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white px-6 py-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
      <Footer minimal />
    </div>
  );
};

export default AuthLayout;
