import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SquareKanban, PanelsTopLeft, CalendarDays, Users, FileText, Shield, ChevronsLeft, ChevronsRight } from 'lucide-react';
import task from "../assets/task.png";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? `bg-gray-200 text-black font-bold w-56 ml-3 rounded-tl-3xl rounded-br-3xl`
      : "hover:font-semibold text-black";
  };

  const getIconClass = (path) => {
    return location.pathname === path
      ? "text-xl text-black"
      : "hover:font-semibold text-black";
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (collapsed) {
    return (
      <div className="w-8 h-full bg-white flex justify-center items-start pt-6 shadow-md shadow-gray-400">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-black"
          title="Expand sidebar"
        >
          <ChevronsRight size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-white text-black flex flex-col shadow-md shadow-gray-400 relative">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center">
          <img src={task} alt="Logo" className="w-10 h-10 mr-3" />
          <h2 className="text-xl font-bold">TaskBoard</h2>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-black absolute top-6 right-4"
          title="Collapse sidebar"
        >
          <ChevronsLeft size={24} />
        </button>
      </div>
      <ul className="flex-1 pt-8">
        {[
          { path: '/', icon: SquareKanban, label: 'Overview' },
          { path: '/projects', icon: PanelsTopLeft, label: 'Projects' },
          { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
          { path: '/members', icon: Users, label: 'Members' },
          { path: '/Auditlog', icon: FileText, label: 'Auditlog' },
          { path: '/Teamsorg', icon: Shield, label: 'Teams' },
        ].map(({ path, icon: Icon, label }) => (
          <li
            key={path}
            className={`p-4 pl-12 flex items-center cursor-pointer text-lg ${getNavLinkClass(path)}`}
            onClick={() => handleNavigation(path)}
          >
            <Icon className={`mr-3 ${getIconClass(path)}`} />
            <span className="block w-full h-full">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;