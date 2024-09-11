//kanban.jsx
import React, { useState, useRef, useEffect } from "react";
import Board, { moveCard, moveColumn } from "@lourenci/react-kanban";
import io from "socket.io-client";
import { Dropdown, Menu } from "antd"; //added
import { InfoCircleOutlined } from "@ant-design/icons";
import { DownOutlined } from "@ant-design/icons"; //added
import {
  BsClockHistory,
  BsPencilSquare,
  BsThreeDotsVertical,
  BsTrash,
  BsX,
} from "react-icons/bs";
import { Tooltip } from "antd";
import "@lourenci/react-kanban/dist/styles.css";
import { useParams } from "react-router-dom";
import { server } from "../constant";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/Style.css";
import useTokenValidation from "./UseTockenValidation";
import { RxActivityLog } from "react-icons/rx";
import { notification } from "antd";
import { MdOutlineContentCopy } from "react-icons/md";
import RulesButton from "./RulePage";
import { FaPlus } from "react-icons/fa";
import { FcEmptyTrash } from "react-icons/fc";
import { MdCancel } from "react-icons/md";
import { Popover, Button, Space, Modal, Form, Input, Select } from "antd";
import { MoreOutlined, SettingOutlined, ToolOutlined } from "@ant-design/icons";
import { SquareMenu } from "lucide-react";
import { Plus } from "lucide-react";
import { X } from "lucide-react";
import { BsFillPencilFill } from "react-icons/bs";
import BackgroundChange from "./BackgroundChange";
import { Bell, SquareChevronDown } from "lucide-react";
import { Drawer, Typography, Progress, List, Avatar, Tabs } from "antd";
import { CloseOutlined, CommentOutlined } from "@ant-design/icons";
import RenameCardPage from "../Pages/RenameCardPage";
import { FastAverageColor } from 'fast-average-color';

const initialBoard = {
  columns: [],
};

function KanbanBoard() {
  useTokenValidation();
  const [boardData, setBoardData] = useState(initialBoard);
  const [socket, setSocket] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [modalType, setModalType] = useState(null);
  const containerRef = useRef(null);
  const { projectId } = useParams();
  const [bgUrl, setBgUrl] = useState("");
  const [renameColumnError, setRenameColumnError] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [newColumnModalVisible, setNewColumnModalVisible] = useState(false)
  const [memberAdded, setMemberAdded] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [textColor, setTextColor] = useState('black'); //added
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState({});
  const [renameCardErrors, setRenameCardErrors] = useState({
    title: "",
    description: "",
  });
  const [addCardErrors, setAddCardErrors] = useState({
    title: "",
    description: "",
    email: "",
  });
  const [assignDate, setAssignDate] = useState("");
  const [repoName, setRepoName] = useState("");
  const [repository, setRepository] = useState("");
  const newRepoRef = useRef(null);
  const existingRepoRef = useRef(null);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [copiedButton, setCopiedButton] = useState(null);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [tempColumnName, setTempColumnName] = useState("");

  const [newColumnError, setNewColumnError] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [comments, setComments] = useState([]);
  const [assignedTo, setAssignedTo] = useState([]);
  const [createdBy, setcreatedBy] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [utilizedHours, setUtilizedHours] = useState(0);
  const [remainingHours, setRemainingHours] = useState(0);

  const { TextArea } = Input;
  const { Text, Title } = Typography;
  const [taskLogs, setTaskLogs] = useState([]);
  const { Option } = Select;
  const [selectedCard, setSelectedCard] = useState(null);

  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const showAboutModal = () => {
    setAboutModalVisible(true);
  };

  const handleAboutModalClose = () => {
    setAboutModalVisible(false);
  };



  const handleCardClick = (cardId, columnId, projectId) => {
    navigate(`/rename-card/${columnId}/cards/${cardId}`)
  };



  const handleTeamsClick = () => {
    navigate(`/projects/${projectId}/teams`);
  };

  const [userRole, setUserRole] = useState("");

  const location = useLocation();
  //added
  const [showBackgroundChange, setShowBackgroundChange] = useState(false);

  //added for antd drawer
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const isProjectRoute = location.pathname.startsWith("/projects/");
  //added
  const handleBackgroundChangeClick = () => {
    setShowBackgroundChange(true);
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setUserRole(response.data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await axios.get(`${server}/api/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserEmail(response.data.user.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserEmail();
  }, []);

  //
  useEffect(() => {
    const fetchUserRoleAndOrganization = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser({ role: response.data.role, email: response.data.email });
        fetchProjects(response.data.organizationId);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRoleAndOrganization();
  }, []);

  const openGitModal = () => {
    setIsGitModalOpen(true);
  };
  const fetchProjects = async (organizationId) => {
    try {
      const response = await axios.get(
        `${server}/api/projects/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProjects(response.data.projects);
      const project = response.data.projects.find(
        (project) => project._id === projectId
      );
      if (project) {
        setProjectName(project.name);
        setProjectManager(project.projectManager);
        setRepoName(project.repoName); // Store repoName
        setRepository(project.repository); // Store repository
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Function to get the user object from local storage
  const getUserFromLocalStorage = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };

  // Inside your component
  const userFromLocalStorage = getUserFromLocalStorage();
  const emailFromLocalStorage = userFromLocalStorage
    ? userFromLocalStorage.email
    : null;

  const canShowActions =
    userFromLocalStorage &&
    (user.role === "ADMIN" ||
      emailFromLocalStorage ===
      projects.find((project) => project._id === projectId)?.projectManager);

  useEffect(() => {
    console.log("Current bgUrl:", bgUrl);
  }, [bgUrl]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMemberAdded(false); // Reset the state
    setEmail("");
    setTeam("");
  };
  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }

    const updateContainerWidth = () => {
      if (containerRef.current) {
        const boardWidth = containerRef.current.scrollWidth;
        containerRef.current.style.width = `${boardWidth}px`;
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);

    return () => {
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, [projectId]);

  useEffect(() => {
    if (!newColumnModalVisible || !modalVisible) {
      fetchTasks();
    }
  }, [newColumnModalVisible, modalVisible]);

 
  const fetchTasks1 = async () => {
    try {
      const response = await axios.get(
        `${server}/api/projects/${projectId}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTasks(response.data.tasks);
      console.log("tasks1 done");
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  useEffect(() => {
    fetchTasks1();
  }, [boardData]);




  return (
    <div
      className="overflow-y-auto  bg-light-multicolor h-[calc(100vh-57px)] rounded-xl"
      style={
        bgUrl
          ? {
            backgroundImage: `url(${bgUrl.raw})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
          }
          : {}
      }
    >
      <div className="flex justify-between items-center  bg-gray-500 bg-opacity-20 pl-2 pb-2 ">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: textColor }}>
            Project : <span className="font-normal">{projectName}</span>
          </h1>
          <h1 className="text-xl font-semibold" style={{ color: textColor }}>
            Project Manager : <span className="font-normal">{projectManager}</span>
          </h1>
        </div>
        <div className="flex space-x-2 ">
          <Button
            type="primary"
            icon={<Plus />}
            onClick={handleAddColumn}
            style={{ borderRadius: "8px" }}
          >
            New Column
          </Button>

          <>
            <Button type="text" icon={<SquareMenu style={{ color: textColor }} />} onClick={showDrawer} />

            <Drawer
              title="Settings"
              placement="right"
              onClose={onClose}
              visible={visible}
              width={300} // Adjust width as needed
            >
              {showBackgroundChange && (
                <BackgroundChange
                  onClose={() => setShowBackgroundChange(false)} // Close BackgroundChange without closing Drawer
                  onImageSelect={onClose} // Close the Drawer when an image is selected
                />
              )}
              <Space direction="vertical" style={{ width: "100%" }}>
                <button
                  type="button" // Changed to 'button' for semantic correctness
                  className="flex flex-row items-left justify-left gap-2 p-2 rounded-md border-color-black-400 hover:bg-gray-200"
                  onClick={() => {
                    openGitModal();
                    onClose(); // Close the Drawer after opening Git Modal
                  }}
                  style={{
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    paddingRight: "25px",
                  }}
                >
                  <SettingOutlined
                    style={{
                      fontSize: 20,
                      display: "flex",
                      justifyItems: "left",
                    }}
                  />
                  Git Configuration
                </button>
                {isProjectRoute && (
                  <button
                    type="button"
                    className="flex flex-row items-left justify-left gap-2 p-2 rounded-md border-color-black-400 hover:bg-gray-200"
                    onClick={() => setShowBackgroundChange(true)} // Only show BackgroundChange
                    style={{
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <SquareChevronDown style={{ fontSize: 20 }} />
                    Change Background
                  </button>
                )}

                <RulesButton
                  tasks={tasks}
                  className="flex flex-row justify-center items-center gap-2 p-2 rounded-md border-color-black-400 hover:bg-gray-200"
                  style={{
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}

                />
                <Button
                  type="text"
                  icon={<InfoCircleOutlined />}
                  onClick={showAboutModal}
                  style={{
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  About
                </Button>

              </Space>
            </Drawer>
            <Modal
              title="About Project"
              visible={aboutModalVisible}
              onCancel={handleAboutModalClose}
              footer={null}
            >
              <Title level={4}>{projectName}</Title>
            </Modal>
          </>
        </div>
      </div>
      <div ref={containerRef} className="overflow-x-auto">
        <Board
          onCardDragEnd={handleCardMove}
          onColumnDragEnd={handleColumnMove}
          renderColumn={(card, columnId) => (
            <div
              style={{
                backgroundColor: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                width: "300px",
                height: "130px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: "20px",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <h3
                  className="font-bold"
                  style={{ fontSize: "1rem", marginBottom: "0.5rem" }}
                >
                  {card.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#4A5568" }}>
                  {card.description}
                </p>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              ></div>
            </div>
          )}
          renderColumnHeader={({ title, id }) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "300px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "#F7FAFC",
                  backgroundColor: "#ededed",
                }}
                onDoubleClick={() => {
                  setEditingColumnId(id);
                  setTempColumnName(title);
                }}
              >
                {editingColumnId === id ? (
                  <input
                    type="text"
                    value={tempColumnName}
                    onChange={(e) => setTempColumnName(e.target.value)}
                    onBlur={() => handleColumnNameBlur(id)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleColumnNameBlur(id);
                      }
                    }}
                    autoFocus
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  <span className="truncate max-w-[200px]" title={title}>
                    {title}
                  </span>
                )}
                {canShowActions && (
                  <Popover
                    content={
                      <div>
                        <Button
                          type="text"
                          block
                          onClick={() => showRemoveColumnConfirmation(id)}
                        >
                          Remove Column
                        </Button>
                      </div>
                    }
                    trigger="click"
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 focus:outline-none p-2 rounded-full"
                    />
                  </Popover>
                )}
              </div>
            </div>
          )}
          renderCard={renderCard}
        >
          {boardData}
        </Board>
      </div>
    </div>
  );
}

export default KanbanBoard;
