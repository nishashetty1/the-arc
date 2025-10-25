// src/components/layout/MainLayout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import useAuthStore from "../../stores/authStore";

const MainLayout = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header user={user ? {
        name: user.displayName || user.email,
        email: user.email,
        profilePicture: user.photoURL
      } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
