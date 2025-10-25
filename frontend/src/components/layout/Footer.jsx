// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineGlobe,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import {
  FaTwitter,
  FaFacebook,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = ({ minimal = false }) => {
  const currentYear = new Date().getFullYear();

  if (minimal) {
    return (
      <footer className="bg-white py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div className="text-xs sm:text-sm text-neutral-500 text-center sm:text-left">
              © {currentYear} The Arc. All rights reserved.
            </div>
            <div className="flex space-x-4 sm:space-x-6 mt-2 sm:mt-0">
              <Link
                to="/terms"
                className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-700"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-700"
              >
                Privacy
              </Link>
              <Link
                to="/contact"
                className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-700"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Full footer for main pages
  return (
     <footer className="bg-neutral-50">
      <div className="container mx-auto px-4 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-neutral-900">
              The Arc
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Connecting startup founders with investors and co-founders to
              build the future together.
            </p>
            <div className="mt-4 flex justify-center sm:justify-start space-x-4">
              <a href="#" className="text-neutral-500 hover:text-primary-600">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-600">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-600">
                <FaLinkedinIn className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-600">
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-neutral-600 hover:text-primary-600"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="text-neutral-600 hover:text-primary-600"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-neutral-600 hover:text-primary-600"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-neutral-600 hover:text-primary-600"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-neutral-600 hover:text-primary-600"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-neutral-600 hover:text-primary-600"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-neutral-600 hover:text-primary-600"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-neutral-600 hover:text-primary-600"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="text-neutral-600 hover:text-primary-600"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <HiOutlineLocationMarker className="mt-1 h-5 w-5 flex-shrink-0 text-neutral-500" />
                <span className="ml-2 text-neutral-600">
                  123 Innovation St, Tech Valley, CA 94103
                </span>
              </li>
              <li className="flex">
                <HiOutlinePhone className="h-5 w-5 flex-shrink-0 text-neutral-500" />
                <span className="ml-2 text-neutral-600">+1 (555) 123-4567</span>
              </li>
              <li className="flex">
                <HiOutlineMail className="h-5 w-5 flex-shrink-0 text-neutral-500" />
                <span className="ml-2 text-neutral-600">
                  contact@thearc.com
                </span>
              </li>
              <li className="flex">
                <HiOutlineGlobe className="h-5 w-5 flex-shrink-0 text-neutral-500" />
                <span className="ml-2 text-neutral-600">
                  www.thearc.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-neutral-500">
              © {currentYear} The Arc. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link
                to="/terms"
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                Privacy
              </Link>
              <Link
                to="/cookies"
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
