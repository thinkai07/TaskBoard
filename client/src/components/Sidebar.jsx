import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MdOutlineGridView } from "react-icons/md";
import { GoProjectSymlink, GoTasklist } from "react-icons/go";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoPeopleOutline } from "react-icons/io5";
// import { RiSettingsLine } from "react-icons/ri";
import { AiOutlineAudit } from "react-icons/ai";
import { RiTeamLine } from "react-icons/ri";
import task from "../assets/task.png";
import axios from "axios";
import { server } from "../constant";

const Sidebar = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? "bg-gray-200 text-black font-bold w-56 ml-3 rounded-tl-3xl  rounded-br-3xl"
      : "hover:font-semibold text-black";
  };

  const getIconClass = (path) => {
    return location.pathname === path
      ? "text-xl text-black"
      : "hover:font-semibold text-black";
  };

  return (
    <div className="w-[253px] h-full bg-white text-black flex flex-col shadow-md shadow-gray-400">
      <div className="p-6 flex items-center">
        <img src={task} alt="Logo" className="w-10 h-10 mr-3" />
        <h2 className="text-xl font-bold">TaskBoard</h2>
      </div>
      <ul className="flex-1 pt-8">
        {/* {projects.length > 0 && (
          <li
            key={projects[0]._id}
            className={`p-4 pl-12 flex items-center cursor-pointer text-base ${getNavLinkClass(`/projects/${projects[0]._id}/tasks`)}`}
            onClick={() => handleProjectClick(projects[0]._id)}
          >
            <GoTasklist className={`mr-3 ${getIconClass(`/projects/${projects[0]._id}/tasks`)}`} />
            <Link className="block w-full h-full">Tasks</Link>
          </li>
        )} */}
        <Link to="/" className="block">
          <li
            className={`p-4 pl-12  flex items-center cursor-pointer text-base ${getNavLinkClass(
              "/"
            )}`}
          >
            <MdOutlineGridView className={`mr-3 ${getIconClass("/")}`} />
            <span>Overview</span>
          </li>
        </Link>
        <Link to="/projects" className="block">
          <li
            className={`p-4 pl-12 flex items-center cursor-pointer text-base ${getNavLinkClass(
              "/projects"
            )}`}
          >
            <GoProjectSymlink className={`mr-3 ${getIconClass("/projects")}`} />
            <span>Projects</span>
          </li>
        </Link>
        <Link to="/calendar" className="block">
          <li
            className={`p-4 pl-12 flex items-center cursor-pointer text-base ${getNavLinkClass(
              "/calendar"
            )}`}
          >
            <FaRegCalendarAlt
              className={`mr-3 text-gray-800 ${getIconClass("/calendar")}`}
            />
            <span>Calendar</span>
          </li>
        </Link>
        <Link to="/members" className="block">
          <li
            className={`p-4 pl-12 flex items-center cursor-pointer text-base ${getNavLinkClass(
              "/members"
            )}`}
          >
            <IoPeopleOutline className={`mr-3 ${getIconClass("/members")}`} />
            <span>Members</span>
          </li>
        </Link>
        <Link to="/Auditlog" className="block">
          <li
            className={`p-4 pl-12 flex items-center cursor-pointer text-base ${getNavLinkClass(
              "/Auditlog"
            )}`}
          >
            <AiOutlineAudit className={`mr-3 ${getIconClass("/Auditlog")}`} />
            <span>Auditlog</span>
          </li>
        </Link>
        <Link to="/Teamsorg" className="block">
          <li
            className={`p-4 pl-12 flex items-center cursor-pointer text-base ${getNavLinkClass(
              "/Teamsorg"
            )}`}
          >
            <RiTeamLine className={`mr-3 ${getIconClass("/Teamsorg")}`} />
            <span>Teams</span>
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Sidebar;