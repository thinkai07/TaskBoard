import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  SquareKanban,
  PanelsTopLeft,
  CalendarDays,
  Users,
  FileText,
  ChevronsLeft,
  ChevronsRight,
  ShieldHalf,
  FileChartColumn
} from "lucide-react";
import task from "../assets/task.png";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? `bg-gray-200 text-black font-bold w-full  rounded-tl-3xl rounded-br-3xl`
      : "hover:font-semibold text-black";
  };

  const getIconClass = (path) => {
    return location.pathname === path
      ? "text-lg text-black"
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
      <div className="w-6 h-full bg-white flex justify-center items-start pt-6 shadow-md shadow-gray-400">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-black"
          title="Expand sidebar"
        >
          <ChevronsRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[242px] h-full bg-white text-black flex flex-col shadow-md shadow-gray-400 relative">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center">
          <img src={task} alt="Logo" className="w-10 h-10 mr-3" />
          <h2 className="text-lg font-bold">TaskBoard</h2>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-black absolute top-4 right-3"
          title="Collapse sidebar"
        >
          <ChevronsLeft size={20} />
        </button>
      </div>
      <ul className="flex-1 pt-8 p-4 pl-3">
        {[
          { path: "/", icon: SquareKanban, label: "Overview" },
          { path: "/projects", icon: PanelsTopLeft, label: "Projects" },
          { path: "/calendar", icon: CalendarDays, label: "Calendar" },
          { path: "/members", icon: Users, label: "Members" },
          { path: "/Auditlog", icon: FileText, label: "Auditlog" },
          { path: "/Teamsorg", icon: ShieldHalf, label: "Teams" },
          { path: "/statussheet", icon:FileChartColumn,label:'StatusSheet'}
        ].map(({ path, icon: Icon, label }) => (
          <li
            key={path}
            className={`p-4 pl-12 flex items-center cursor-pointer text-base ${getNavLinkClass(
              path
            )}`}
            onClick={() => handleNavigation(path)}
          >
            <Icon className={`mr-3 ${getIconClass(path)}`} size={18} />
            <span className="block w-full h-full">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
