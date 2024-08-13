// layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useTokenValidation from "./UseTockenValidation";

const Layout = ({ children, user, onLogout }) => {
  useTokenValidation();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar user={user} onLogout={onLogout} />
        <div
<<<<<<< HEAD
          className="flex-1 h-[calc(100vh-80px)]"
=======
          className="flex-1 p-4"
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
          style={{
            backgroundSize: "cover",
            backgroundPosition: "center center",
            overflow:"auto",
            scrollbarWidth: "none" 
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
