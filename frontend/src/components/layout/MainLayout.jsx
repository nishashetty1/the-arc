// src/components/layout/MainLayout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
