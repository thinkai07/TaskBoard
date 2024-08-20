//kanban.jsx
import React, { useState, useRef, useEffect } from "react";
import Board, { moveCard, moveColumn } from "@lourenci/react-kanban";
import io from "socket.io-client";
import { Dropdown, Menu } from 'antd';  //added
import { DownOutlined } from '@ant-design/icons'; //added
import {
  BsClockHistory,
  BsPencilSquare,
  BsThreeDotsVertical,
  BsTrash,
  BsX,
} from "react-icons/bs";
import { Tooltip } from 'antd';
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
import { Popover, Button, Space, Modal, Form, Input } from 'antd';
import { MoreOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons';
import { SquareMenu } from 'lucide-react';
import { Plus } from "lucide-react";
import { X } from 'lucide-react'
import { BsFillPencilFill } from "react-icons/bs";
import BackgroundChange from "./BackgroundChange";
import { Bell, SquareChevronDown } from "lucide-react";
import { Drawer } from 'antd';

const initialBoard = {
  columns: [],
};

const TimeProgressBar = ({ assignDate, dueDate }) => {
  const [progress, setProgress] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const start = new Date(assignDate);
      const end = new Date(dueDate);
      const total = end - start;
      const elapsed = now - start;

      if (now > end) {
        setProgress(100);
        setIsOverdue(true);
      } else {
        const calculatedProgress = (elapsed / total) * 100;
        setProgress(Math.min(calculatedProgress, 100));
        setIsOverdue(false);
      }
    };

    updateProgress();
    const timer = setInterval(updateProgress, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [assignDate, dueDate]);

  return (
    <div
      className="relative h-3 w-full rounded-lg"
      style={{
        background: isOverdue
          ? '#ff4d4d'
          : `linear-gradient(to right, #3b82f6 ${progress}%, #e5e7eb ${progress}%)`,
      }}
    >

      <div
        className="absolute inset-0 flex items-center justify-center text-black font-bold"
        style={{ fontSize: '0.75rem' }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
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
  const [newColumnModalVisible, setNewColumnModalVisible] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [showRenameConfirmation, setShowRenameConfirmation] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  // const [showRenameInput, setShowRenameInput] = useState(false);
  const [renameCardModalVisible, setRenameCardModalVisible] = useState(false);
  const [renameCardTitle, setRenameCardTitle] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [memberAdded, setMemberAdded] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [renameCardDescription, setRenameCardDescription] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(null);
  const suggestionListRef = useRef(null);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("");
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
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);


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

  //added
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
    const newSocket = io("http://13.235.16.113:5000");
    setSocket(newSocket);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connection", () => {
        console.log("connected");
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("cardCreated", ({ taskId, card }) => {
        setBoardData((prevState) => ({
          ...prevState,
          columns: prevState.columns.map((column) =>
            column.id === taskId
              ? { ...column, cards: [...column.cards, card] }
              : column
          ),
        }));
      });


      socket.on("cardRenamed", ({ cardId, newTitle, newDescription }) => {
        setBoardData((prevState) => ({
          ...prevState,
          columns: prevState.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) =>
              card.id === cardId
                ? { ...card, title: newTitle, description: newDescription }
                : card
            ),
          })),
        }));
      });

      socket.on("taskAdded", ({ projectId: updatedProjectId, task }) => {
        if (updatedProjectId === projectId) {
          setBoardData((prevState) => ({
            ...prevState,
            columns: [
              ...prevState.columns,
              { id: task._id, title: task.name, cards: [] },
            ],
          }));
        }
      });

      socket.on(
        "taskRenamed",
        ({ projectId: updatedProjectId, taskId, newName }) => {
          if (updatedProjectId === projectId) {
            setBoardData((prevState) => ({
              ...prevState,
              columns: prevState.columns.map((column) =>
                column.id === taskId ? { ...column, title: newName } : column
              ),
            }));
          }
        }
      );

      socket.on("taskDeleted", ({ projectId: updatedProjectId, taskId }) => {
        if (updatedProjectId === projectId) {
          setBoardData((prevState) => ({
            ...prevState,
            columns: prevState.columns.filter((column) => column.id !== taskId),
          }));
        }
      });

      socket.on(
        "taskMoved",
        ({ projectId: updatedProjectId, taskId, newIndex }) => {
          if (updatedProjectId === projectId) {
            setBoardData((prevState) => {
              const updatedColumns = [...prevState.columns];
              const taskIndex = updatedColumns.findIndex(
                (column) => column.id === taskId
              );
              if (taskIndex !== -1) {
                const [movedTask] = updatedColumns.splice(taskIndex, 1);
                updatedColumns.splice(newIndex, 0, movedTask);
              }
              return { ...prevState, columns: updatedColumns };
            });
          }
        }
      );

      socket.on("cardDeleted", ({ taskId, cardId }) => {
        setBoardData((prevState) => ({
          ...prevState,
          columns: prevState.columns.map((column) =>
            column.id === taskId
              ? {
                ...column,
                cards: column.cards.filter((card) => card.id !== cardId),
              }
              : column
          ),
        }));
      });

      socket.on("cardMoved", ({ cardId, sourceTaskId, destinationTaskId }) => {
        console.log("Card moved event received:", {
          cardId,
          sourceTaskId,
          destinationTaskId,
        });
        setBoardData((prevState) => {
          if (!prevState || !prevState.columns) {
            console.error("Invalid board state:", prevState);
            return prevState;
          }

          const updatedColumns = prevState.columns.map((column) => {
            if (column.id === sourceTaskId) {
              return {
                ...column,
                cards: column.cards.filter((card) => card.id !== cardId),
              };
            }
            if (column.id === destinationTaskId) {
              const movedCard = prevState.columns
                .find((col) => col.id === sourceTaskId)
                ?.cards.find((card) => card.id === cardId);

              if (!movedCard) {
                console.error("Moved card not found:", {
                  cardId,
                  sourceTaskId,
                });
                return column;
              }

              return {
                ...column,
                cards: [...column.cards, movedCard],
              };
            }
            return column;
          });
          return { ...prevState, columns: updatedColumns };
        });
      });

    }
    return () => {
      if (socket) {
        socket.off("cardCreated");
        socket.off("taskAdded");
        socket.off("taskDeleted");
        socket.off("taskRenamed");
        socket.off("taskMoved");
        socket.off("cardMoved");
        socket.off("cardDeleted");
        socket.off("cardRenamed");

      }
    };
  }, [socket, projectId]);

  //
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
  const closeGitModal = () => {
    setIsGitModalOpen(false);
  };
  const copyToClipboard = (text, buttonId) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopiedButton(buttonId);
          setTimeout(() => setCopiedButton(null), 2000);
        },
        (err) => {
          console.error("Could not copy text: ", err);
        }
      );
    } else {
      let textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedButton(buttonId);
        setTimeout(() => setCopiedButton(null), 2000);
      } catch (err) {
        console.error("Fallback: Could not copy text: ", err);
      }
      document.body.removeChild(textArea);
    }
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

  // Update fetchTasks function to include cards
  async function fetchTasks() {
    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const { tasks, bgUrl } = await response.json();

      const columns = await Promise.all(
        tasks.map(async (task) => {
          const cardsResponse = await fetch(
            `${server}/api/tasks/${task.id}/cards`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const { cards } = await cardsResponse.json();
          console.log(cards);
          return {
            id: task.id,
            title: task.name,
            cards: cards.map((card) => ({
              id: card.id,
              title: card.name || "",
              description: card.description || "",
              columnId: task.id,
              assignedTo: card.assignedTo,
              status: card.status,
              assignDate: card.assignDate,
              dueDate: card.dueDate,
              comments: card.comments || [],

            })),
          };
        })
      );
      setBgUrl(bgUrl);
      console.log(bgUrl);
      setBoardData({ columns });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  useEffect(() => {
    console.log("Current bgUrl:", bgUrl);
  }, [bgUrl]);

  //added
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMemberAdded(false); // Reset the state
    setEmail("");
    setTeam("");
  };

  const openRenameCardModal = (
    columnId,
    cardId,
    currentTitle,
    currentDescription,
    currentComments
  ) => {
    console.log("openRenameCardModal called with:", cardId, currentComments);

    setSelectedColumnId(columnId);
    setSelectedCardId(cardId);
    setRenameCardTitle(currentTitle);
    setRenameCardDescription(currentDescription);
    setComments(currentComments || []); // Ensure comments are set correctly
    setRenameCardModalVisible(true);
  };

  const clearFieldsAndRefresh = async () => {
    // Clear input fields
    if (document.forms[0]) {
      document.forms[0].reset();
    }
    setEmail("");

    // Close the modal
    setModalVisible(false);

    // Refresh board data
    await fetchTasks();
  };

  // // // Update handleAddCard function
  const handleAddCard = async (e) => {
    e.preventDefault();
    const cardTitle = e.target.title.value.trim() || "";
    const cardDescription = e.target.description.value.trim() || "";
    const assignDate = e.target.assignDate.value;
    const dueDate = e.target.dueDate.value;
    const estimatedHours = parseFloat(e.target.estimatedHours.value) || 0;

    if (
      !cardTitle ||
      !cardDescription ||
      !selectedColumnId ||
      !email ||
      !assignDate ||
      !dueDate ||
      !estimatedHours
    ) {
      notification.warning({
        message: "Please fill in all fields",
      });
      return;
    }

    try {
      const createdBy = await fetchUserEmail();

      const searchResponse = await fetch(
        `${server}/api/projects/${projectId}/users/search?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error("User is not part of the project");
      }

      const { users } = await searchResponse.json();
      if (users.length === 0) {
        notification.warning({
          message: "The entered email is not part of the project",
        });
        return;
      }

      const response = await fetch(
        `${server}/api/tasks/${selectedColumnId}/cards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: cardTitle,
            description: cardDescription,
            assignedTo: email,
            assignDate: assignDate,
            dueDate: dueDate,
            estimatedHours: estimatedHours,  // Include estimatedHours
            createdBy: createdBy,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add card");
      }

      await clearFieldsAndRefresh();
      e.target.title.value = "";
      e.target.description.value = "";
      e.target.estimatedHours.value = "";
      setEmail("");

      setModalVisible(false);

      await fetchTasks();
      notification.success({
        message: 'Task added Successfully',
      });
    } catch (error) {
      console.error("Error adding card:", error);
      alert(error.message);
    }
  };

  const handleEmailChange = async (e) => {
    const emailInput = e.target.value;
    setEmail(emailInput);

    if (!emailInput) {
      setEmailSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/users/search?email=${emailInput}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch email suggestions");
      }

      const { users } = await response.json();

      // Filter out duplicate emails
      const uniqueUsers = users.filter(
        (user, index, self) =>
          index === self.findIndex((t) => t.email === user.email)
      );

      setEmailSuggestions(uniqueUsers);
    } catch (error) {
      console.error("Error fetching email suggestions:", error);
      setEmailSuggestions([]);
    }
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



  // Polling function
  const pollForUpdates = async () => {
    await fetchTasks();
  };

  // Set up polling
  useEffect(() => {
    const intervalId = setInterval(pollForUpdates, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);


  const handleCardMove = async (card, source, destination) => {
    const updatedBoard = moveCard(boardData, source, destination);
    setBoardData(updatedBoard);

    const movedBy = await fetchUserEmail();

    try {
      if (source.fromColumnId === destination.toColumnId) {
        // Card is reordered within the same task
        const response = await axios.put(
          `${server}/api/tasks/${source.fromColumnId}/cards/${card.id}/reorder`,
          {
            newIndex: destination.toPosition,
            movedBy,
            movedDate: new Date().toISOString(),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to reorder card");
        }
      } else {
        // Card is moved to a different task
        const response = await axios.put(
          `${server}/api/cards/${card.id}/move`,
          {
            sourceTaskId: source.fromColumnId,
            destinationTaskId: destination.toColumnId,
            movedBy,
            movedDate: new Date().toISOString(),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to move card");
        }
      }

      // Refetch the board data to ensure frontend and backend are in sync
      await fetchTasks();
    } catch (error) {
      console.error("Error moving/reordering card:", error);
      // Revert the frontend state if the backend update fails
      setBoardData(boardData);
    }
  };


  //coloumn rename automatic  
  const handleColumnNameBlur = async (columnId) => {
    if (tempColumnName.trim() === "") {
      notification.error({
        message: 'Column name cannot be empty',
      });
      setEditingColumnId(null);
      return;
    }

    setEditingColumnId(null);
    const column = boardData.columns.find(col => col.id === columnId);
    if (column && tempColumnName !== column.title) {
      try {
        let updatedBy = await fetchUserEmail();
        const response = await fetch(
          `${server}/api/projects/${projectId}/tasks/${columnId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ name: tempColumnName, updatedBy: updatedBy }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to rename column");
        }

        setBoardData(prevState => ({
          ...prevState,
          columns: prevState.columns.map(col =>
            col.id === columnId ? { ...col, title: tempColumnName } : col
          )
        }));

        // notification.success({
        //   message: 'Column Renamed Successfully',
        // });
      } catch (error) {
        console.error("Error renaming column:", error);
        notification.error({
          message: 'Failed to rename column',
        });
      }
    } else {
      setTempColumnName("");
    }
  };


  const confirmRemoveCard = (columnId, cardId) => {
    setCardToDelete({ columnId, cardId });
    setShowDeleteConfirmation(true);
  };

  // Update handleRemoveCard function
  const handleRemoveCard = async () => {
    if (cardToDelete) {
      const { columnId, cardId } = cardToDelete;
      try {
        // Fetch the logged-in user's email
        const deletedBy = await fetchUserEmail();

        const response = await fetch(
          `${server}/api/tasks/${columnId}/cards/${cardId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ deletedBy: deletedBy }), // Include deletedBy
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove card");
        }

        setBoardData((prevState) => ({
          ...prevState,
          columns: prevState.columns.map((column) =>
            column.id === columnId
              ? {
                ...column,
                cards: column.cards.filter((card) => card.id !== cardId),
              }
              : column
          ),
        }));

        setShowDeleteConfirmation(false);
        setCardToDelete(null);

        // Show success message
        setShowSuccessMessage(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        notification.success({
          message: 'task deleted Successfully',

        });
      } catch (error) {
        console.error("Error removing card:", error);
      }
    }
  };

  const handleColumnMove = async (column, source, destination) => {
    const updatedBoard = moveColumn(boardData, source, destination);
    setBoardData(updatedBoard);

    let movedBy;
    try {
      movedBy = await fetchUserEmail();
    } catch (error) {
      console.error("Error fetching logged-in user's email:", error);
      // Revert the frontend state in case of error
      setBoardData(moveColumn(updatedBoard, destination, source));
      return;
    }

    const movedDate = new Date().toISOString();

    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/tasks/${column.id}/move`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            newIndex: destination.toPosition,
            movedBy,
            movedDate,
          }), // Include movedBy and movedDate
        }
      );

      if (!response.ok) throw new Error("Failed to move column");
    } catch (error) {
      console.error("Error moving column:", error);
      // Revert the frontend state in case of error
      setBoardData(moveColumn(updatedBoard, destination, source));
    }
  };

  const fetchUserEmail = async () => {
    try {
      const response = await axios.get(`${server}/api/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data.user.email; // Return the email
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error; // Propagate the error
    }
  };

  // // update add coloumn
  const handleAddColumn = () => {
    setNewColumnError(false);
    setNewColumnModalVisible(true);
  };

  const handleAddColumnSubmit = async () => {
    const trimmedColumnName = newColumnName.trim();
    if (!trimmedColumnName) {
      setNewColumnError(true);
      return;
    }

    setLoading(true);
    let createdBy;
    try {
      createdBy = await fetchUserEmail(); // Assume fetchUserEmail is a function that gets the user's email
    } catch (error) {
      console.error("Error fetching logged-in user's email:", error);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: trimmedColumnName,
            createdBy: createdBy,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const { task } = await response.json();
      setBoardData((prevState) => ({
        ...prevState,
        columns: [
          ...prevState.columns,
          { id: task._id, title: task.name, cards: [], createdBy: createdBy },
        ],
      }));
      notification.success({ message: "Column created successfully" });
      setNewColumnModalVisible(false);
      setNewColumnName("");
      setNewColumnError(false);
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setLoading(false);
    }
  };
  // Update the handleRenameColumn function
  const handleRenameColumn = async (newColumnName) => {
    if (selectedColumnId && newColumnName) {
      let updatedBy;
      try {
        updatedBy = await fetchUserEmail();
      } catch (error) {
        console.error("Error fetching logged-in user's email:", error);
        return;
      }

      try {
        const response = await fetch(
          `${server}/api/projects/${projectId}/tasks/${selectedColumnId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ name: newColumnName, updatedBy: updatedBy }), // Include updatedBy
          }
        );

        if (!response.ok) {
          throw new Error("Failed to rename column");
        }

        setBoardData((prevState) => ({
          ...prevState,
          columns: prevState.columns.map((column) =>
            column.id === selectedColumnId
              ? { ...column, title: newColumnName }
              : column
          ),
        }));
        notification.success({
          message: 'Column Renamed Successfully',

        });
      } catch (error) {
        console.error("Error renaming column:", error);
      }
    }
    closeModal();
  };


  const handleRemoveColumn = async (columnId) => {
    let deletedBy;
    try {
      deletedBy = await fetchUserEmail();
    } catch (error) {
      console.error("Error fetching logged-in user's email:", error);
      return;
    }

    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/tasks/${columnId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ deletedBy }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove column");
      }

      setBoardData((prevState) => ({
        ...prevState,
        columns: prevState.columns.filter(
          (column) => column.id !== columnId
        ),
      }));

      setShowDeleteSuccess(true);
      setTimeout(() => {
        setShowDeleteSuccess(false);
      }, 3000);
      notification.success({
        message: 'Column Deleted Successfully',
      });
    } catch (error) {
      console.error("Error removing column:", error);
      notification.error({
        message: 'Failed to delete column',
        description: error.message,
      });
    }
  };
  const showRemoveColumnConfirmation = (columnId) => {
    Modal.confirm({
      title: 'Are you sure you want to remove this column?',
      onOk() {
        handleRemoveColumn(columnId);
      },
    });
  };

  const openModal = (columnId, type) => {
    console.log(columnId);
    setSelectedColumnId(columnId);
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedColumnId(null);
    setModalType(null);
  };

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const response = await fetch(`${server}/api/projects/${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }

        const project = await response.json();
        setProjectName(project.name);
        console.log(project.projectManager);
        setProjectManager(project.projectManger);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    }

    fetchProjectDetails();
  }, [server, projectId]); // Dependencies for useEffect

  //add team
  const handleTeamSubmit = async () => {
    if (!email || !team) {
      notification.warning({
        message: "Please fill in all fields",
        // description: "We can't assign the admin to the project",
      });
      return;
    }

    try {
      // Fetch the logged-in user's email
      const addedBy = await fetchUserEmail();

      // Proceed with adding the user to the team
      const response = await fetch(
        `${server}/api/projects/${projectId}/teams/addUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ email, teamName: team, addedBy }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Check if the user is ADMIN based on the response from backend
        if (data.userRole === "ADMIN") {
          console.log("Admin email:", email); // Log admin email

          notification.warning({
            message: "We can't assign the admin to the project",
          });
        } else {
          alert(`${data.message}`);
        }
        return;
      }

      notification.success({
        message: "User added to team successfully",
      });
      setMemberAdded(true); // Set the state to true
      handleCloseModal();
    } catch (error) {
      console.error("Error adding user to team:", error);

      notification.warning({
        message: "An error occurred while adding user to team",
      });
    }
  };

  async function handleChangeStatus(cardId, newStatus) {
    try {
      // Fetch the user's email (updatedBy)
      const updatedBy = await fetchUserEmail();
      // Get the current date and time (updatedDate)
      const updatedDate = new Date().toISOString();

      // Make the PUT request to update the card status
      const response = await fetch(`${server}/api/cards/${cardId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus, updatedBy, updatedDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update the local state
      setBoardData((prevState) => {
        const updatedColumns = prevState.columns.map((column) => {
          const updatedCards = column.cards.map((card) => {
            if (card.id === cardId) {
              return { ...card, status: newStatus, updatedBy, updatedDate };
            }
            return card;
          });
          return { ...column, cards: updatedCards };
        });

        return { ...prevState, columns: updatedColumns };
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  const handleaddmember = async (event) => {
    const value = event.target.value;
    setEmail(value);

    if (value) {
      try {
        const response = await axios.get(`${server}/api/users/search`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: { email: value },
        });

        setEmailSuggestions(response.data.users);
      } catch (error) {
        console.error("Error fetching user emails:", error);
      }
    } else {
      setEmailSuggestions([]);
    }
  };

  //added
  const statusMenu = (cardId) => (
    <Menu
      onClick={(e) => handleChangeStatus(cardId, e.key)}
      items={[
        { key: 'pending', label: 'Pending' },
        { key: 'inprogress', label: 'Inprogress' },
        { key: 'completed', label: 'Completed' },
      ]}
    />
  );

  const renderCard = (card, { dragging }) => (
    <div
      className={`react-kanban-card ${dragging ? "dragging" : ""}`}
      style={{ borderRadius: "10px", maxWidth: "750px", overflow: "hidden" }}
    >
      <div className="p-4">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="react-kanban-card__title truncate" title={card.title}>
            {card.title && card.title.length > 20
              ? card.title.slice(0, 28) + "..."
              : card.title}
          </div>
          <div className="react-kanban-card__assignedTo flex items-center">
            {card.assignedTo && (
              <div className="profile-picture w-6 h-6 rounded-full bg-blue-400 text-white flex justify-center items-center font-bold ml-2 relative group">
                <span className="group-hover:block hidden absolute top-8 right-0 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                  {card.assignedTo}
                </span>
                {card.assignedTo.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="react-kanban-card__dueDate">
          {card.dueDate && (
            <div className="text-sm text-gray-500">
              Due Date:{" "}
              {new Date(card.dueDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: 'flex-start', justifyContent: "space-between" }}>
          <Dropdown overlay={statusMenu(card.id)} trigger={['click']} >
            <Button style={{ width: '100px', marginTop: '3%' }}>
              {card.status.charAt(0).toUpperCase() + card.status.slice(1)} <DownOutlined />
            </Button>
          </Dropdown>


          {canShowActions && (
            <button
              className="delete-card-button"
              onClick={() => confirmRemoveCard(card.columnId, card.id)}
              style={{ marginRight: "10px", color: "red", paddingTop: "5px", marginLeft: "30%", marginTop: '3%' }}
            >
              <BsTrash />
            </button>
          )}
          <button
            className="delete-card-button"
            onClick={() =>
              openRenameCardModal(
                card.columnId,
                card.id,
                card.title,
                card.description,
                card.comments
              )
            }
            style={{ color: 'black', marginTop: "4%" }}
          >
            <BsFillPencilFill />
          </button>
        </div>

      </div>
    </div>
  );

  ////
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
      console.log("tasks1 done")
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  useEffect(() => {
    fetchTasks1()

  }, [boardData])

  const handleSaveComment = async () => {
    if (comment.trim()) {
      try {
        const updatedBy = await fetchUserEmail();

        const response = await fetch(
          `${server}/api/tasks/${selectedColumnId}/cards/${selectedCardId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              updatedBy: updatedBy,
              comment: comment.trim(),
              name: renameCardTitle,
              description: renameCardDescription,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save comment");
        }

        // Update local state immediately
        setBoardData((prevState) => {
          const updatedColumns = prevState.columns.map((column) => {
            if (column.id === selectedColumnId) {
              return {
                ...column,
                cards: column.cards.map((card) => {
                  if (card.id === selectedCardId) {
                    return {
                      ...card,
                      comments: [
                        ...card.comments,
                        { commentBy: userEmail, comment: comment.trim() },
                      ],
                    };
                  }
                  return card;
                }),
              };
            }
            return column;
          });

          return { ...prevState, columns: updatedColumns };
        });

        // Update the comments state
        setComments([
          ...comments,
          { commentBy: userEmail, comment: comment.trim() },
        ]);

        // Clear the comment input
        setComment("");

        // Optionally fetch the latest data from the server
        await fetchTasks();
      } catch (error) {
        console.error("Error saving comment:", error);
      }
    }
  };

  const handleRenameCard = async (e) => {
    e.preventDefault();
    const trimmedTitle = renameCardTitle.trim();
    const trimmedDescription = renameCardDescription.trim();
    let hasErrors = false;
    const errors = { title: "", description: "" };

    if (!trimmedTitle) {
      errors.title = "Please enter a card title";
      hasErrors = true;
    }
    if (!trimmedDescription) {
      errors.description = "Please enter a card description";
      hasErrors = true;
    }

    if (hasErrors) {
      setRenameCardErrors(errors);
      return;
    }

    try {
      const updatedBy = await fetchUserEmail();

      const response = await fetch(
        `${server}/api/tasks/${selectedColumnId}/cards/${selectedCardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: trimmedTitle,
            description: trimmedDescription,
            updatedBy: updatedBy,
            updatedDate: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to rename card");
      }

      // Update local state
      setBoardData((prevState) => {
        const updatedColumns = prevState.columns.map((column) => {
          if (column.id === selectedColumnId) {
            return {
              ...column,
              cards: column.cards.map((card) =>
                card.id === selectedCardId
                  ? {
                    ...card,
                    title: trimmedTitle,
                    description: trimmedDescription,
                  }
                  : card
              ),
            };
          }
          return column;
        });

        return { ...prevState, columns: updatedColumns };
      });

      // Optionally fetch the latest data from the server
      await fetchTasks();

      setRenameCardErrors({ title: "", description: "" });
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        setRenameCardModalVisible(false); // Close the modal after showing success message
      }, 1000);
    } catch (error) {
      console.error("Error renaming card:", error);
    }
  };

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
      <div>
        {renameCardModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-3xl w-5/12 relative">
              {/* Close Icon */}
              <button
                onClick={() => {
                  setRenameCardModalVisible(false);
                  setRenameCardErrors({ title: "", description: "" });
                }}
                className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-lg font-bold mb-4">Rename Card</h2>
              <form onSubmit={handleRenameCard}>
                <div className="mb-4">
                  <input
                    type="text"
                    value={renameCardTitle}
                    onChange={(e) => {
                      setRenameCardTitle(e.target.value);
                      setRenameCardErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    className={`border ${renameCardErrors.title
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-3xl px-4 py-2 w-full`}
                    placeholder="Card Title"
                  />
                  {renameCardErrors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {renameCardErrors.title}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <textarea
                    value={renameCardDescription}
                    onChange={(e) => {
                      setRenameCardDescription(e.target.value);
                      setRenameCardErrors((prev) => ({
                        ...prev,
                        description: "",
                      }));
                    }}
                    className={`border ${renameCardErrors.description
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-3xl px-4 py-2 w-full`}
                    placeholder="Card Description"
                  />
                  {renameCardErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {renameCardErrors.description}
                    </p>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setRenameCardModalVisible(false);
                      setRenameCardErrors({ title: "", description: "" });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-3xl"
                  >
                    Save
                  </button>
                </div>
              </form>
              <div className="mt-4 h-96 overflow-y-auto">
                <div className="flex items-center mb-4 pt-6">
                  <RxActivityLog size={24} className="mr-2" />
                  <h2 className="text-lg font-bold">Activity</h2>
                  <button
                    onClick={() => setCommentsVisible(!commentsVisible)}
                    className="ml-auto bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl"
                  >
                    {commentsVisible ? "Hide Comments" : "Show Comments"}
                  </button>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex justify-center items-center font-bold">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>

                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment"
                    className="border border-gray-300 rounded-3xl px-4 py-2 w-full ml-2"
                  />
                </div>

                <button
                  onClick={handleSaveComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded-3xl mt-2"
                >
                  Save Comment
                </button>
                {commentsVisible && (
                  <div className="flex flex-col space-y-4 pt-6">
                    {comments
                      .slice()
                      .reverse()
                      .map((comment, idx) => (
                        <div
                          key={idx}
                          className={`ml-2 text-gray-700 mt-2 flex items-start ${idx === 0
                            ? "bg-gray-100 p-2 rounded-lg"
                            : "bg-white p-2 rounded-lg"
                            }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex justify-center items-center font-bold">
                            {comment.commentBy[0].toUpperCase()}
                          </div>
                          <p className="ml-2">
                            <span className="font-bold">
                              {comment.commentBy}
                            </span>
                            : {comment.comment}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showSuccessPopup && (
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50">
            <div className="bg-green-400 p-2 rounded-xl">
              <h2 className="text-lg text-white font-bold mb-2">
                Card renamed successfully
              </h2>
            </div>
          </div>
        )}
      </div>
      {/* <div className="flex justify-between items-center mb-4"> */}
      <div className="flex justify-between items-center  bg-gray-500 bg-opacity-20 pl-2 pb-2 ">
        <div>
          <h1 className="text-xl font-semibold">Project : {projectName}</h1>
          <h1 className="text-xl font-semibold">
            Project Manager : {projectManager}
          </h1>
        </div>
        <div className="flex space-x-2 ">


          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-700 z-50 bg-opacity-50">
              <div className="bg-white p-6 w-96 rounded-3xl shadow-4xl">
                <div className="relative">
                  <label className="block mb-2">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleaddmember}
                    placeholder="Enter email address"
                    className="border border-gray-300 p-2 rounded-3xl w-full"
                  />
                  {emailSuggestions.length > 0 && (
                    <ul
                      className="absolute bg-white border border-gray-300 rounded-3xl mt-2 w-full z-10"
                      ref={suggestionListRef}
                    >
                      {emailSuggestions.map((suggestion) => (
                        <li
                          key={suggestion.email}
                          onClick={() => {
                            setEmail(suggestion.email);
                            setEmailSuggestions([]);
                          }}
                          className="p-2 hover:bg-gray-200 cursor-pointer"
                        >
                          {suggestion.email}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block mb-2">Team:</label>
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="border border-gray-300 p-2 rounded-3xl w-full"
                  >
                    <option value="">Select a team</option>
                    <option value="Development">Development</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Testing">Testing</option>
                  </select>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-3xl mr-2"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-3xl"
                    onClick={() => handleTeamSubmit()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}


          <Button
            type="primary"
            icon={<Plus />}
            onClick={handleAddColumn}
            style={{ borderRadius: "8px" }}
          >
            New Column
          </Button>



          {/* <Popover
            trigger="click"
            placement="bottomRight"
            content={
              <Space direction="vertical">

                <Button
                  type="default"
                  icon={<SettingOutlined />}
                  onClick={openGitModal}
                  block
                >
                  Git Configuration
                </Button>
                <RulesButton tasks={tasks} />
              </Space>
            }
          >
            <Button type="text" icon={<SquareMenu />} />
          </Popover> */}

          <>
            <Button type="text" icon={<SquareMenu />} onClick={showDrawer} />

            <Drawer
              title="Settings"
              placement="right"
              onClose={onClose}
              visible={visible}
              width={300} // Adjust width as needed

            >
              {showBackgroundChange && (
                <BackgroundChange onClose={() => setShowBackgroundChange(false)} />
              )}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="default"
                  icon={<SettingOutlined />}
                  onClick={openGitModal}
                  block
                >
                  Git Configuration
                </Button>
                <RulesButton tasks={tasks} />
                {isProjectRoute && (
                  <button
                    type="default"
                    icon={<SquareChevronDown />}
                    className="flex flex-row justify-center items-center gap-2 p-2 rounded-md border-color-black-400 hover:bg-gray-200 "
                    onClick={handleBackgroundChangeClick}
                    block
                  >
                    <SquareChevronDown size={24} />
                    Change Background
                  </button>
                )}
              </Space>
            </Drawer>
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
            <div style={{
              display: "flex",
              flexDirection: "column",
              width: "300px",
            }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "#F7FAFC",
                  // borderRadius: "20px",
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
                      if (e.key === 'Enter') {
                        handleColumnNameBlur(id);
                      }
                    }}
                    autoFocus
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  <span
                    className="truncate max-w-[200px]"
                    title={title}
                  >
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
              <button
                onClick={() => openModal(id, "addCard")}
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  borderBottomLeftRadius: "0.375rem",
                  borderBottomRightRadius: "0.375rem",
                  padding: "0.5rem",
                  color: "#4A5568",
                  textAlign: "center",
                  paddingLeft: "50%"
                }}
              >
                <FaPlus />
              </button>
            </div>
          )}

          renderCard={renderCard}
        >
          {boardData}
        </Board>
      </div>

      {modalVisible && modalType === "addCard" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white w-96  p-6 rounded-3xl shadow-lg">
            <h2 className="text-lg font-bold mb-4">Add New Card</h2>
            <form onSubmit={handleAddCard}>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Card Title
              </label>
              <input
                type="text"
                name="title"
                className="border border-gray-300 rounded-xl px-4 py-2 mb-4 w-full"
                placeholder="Card Title"
                required
                onChange={(e) => (e.target.value = e.target.value.trimStart())}
              />
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Card Description
              </label>
              <textarea
                name="description"
                className="border border-gray-300 rounded-xl px-4 py-2 mb-4 w-full"
                placeholder="Card Description"
                required
                onChange={(e) => (e.target.value = e.target.value.trimStart())}
              />
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Assigned To (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                className="border border-gray-300 p-2 rounded-3xl w-full mb-4"
              />

              {emailSuggestions.length > 0 && (
                <ul
                  className="absolute bg-white border border-gray-300 rounded-3xl mt-2 w-80 z-10"
                  ref={suggestionListRef}
                >
                  {emailSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.email}
                      onClick={() => {
                        setEmail(suggestion.email);
                        setEmailSuggestions([]);
                      }}
                      className="p-2 hover:bg-gray-200  rounded-3xl cursor-pointer"
                    >
                      {suggestion.email}
                    </li>
                  ))}
                </ul>
              )}
              <label
                htmlFor="assignDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                type="datetime-local"
                name="assignDate"
                required
                className="border border-gray-300 p-2 rounded-3xl w-full mb-4"
              />
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                required
                className="border border-gray-300 p-2 rounded-3xl w-full mb-4"
              />

              <label
                htmlFor="estimatedHours"
                className="block text-sm font-medium text-gray-700"
              >
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                className="border border-gray-300 rounded-xl px-4 py-2 mb-4 w-full"
                placeholder="Estimated Hours"
                required
                min="0"
                step="0.1"
              />

              {/* Email suggestions list */}
              <div className="flex px-4 py-2 justify-between">
                <button
                  type="button"
                  onClick={clearFieldsAndRefresh}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-3xl"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-3xl">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this card?</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveCard}
                className="bg-red-500 text-white px-4 py-2 rounded-3xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessMessage && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
            <p className="font-semibold">Card deleted successfully</p>
          </div>
        </div>
      )}

      {newColumnModalVisible && (
        <Modal
          title="Add New Column"
          visible={newColumnModalVisible}
          onCancel={() => setNewColumnModalVisible(false)}
          footer={null}
        >
          <Form onFinish={handleAddColumnSubmit}>
            <Form.Item
              validateStatus={newColumnError ? "error" : ""}
              help={newColumnError ? "Please enter a column name" : ""}
            >
              <Input
                value={newColumnName}
                onChange={(e) => {
                  setNewColumnName(e.target.value.trimStart());
                  setNewColumnError(false);
                }}
                placeholder="Column Name"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <div className="flex justify-end">
                <Button
                  onClick={() => setNewColumnModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Add Column
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

      )}

      {modalVisible && modalType === "options" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-lg font-bold mb-4">Column Options</h2>
            <button
              onClick={() => setShowConfirmation(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-3xl w-full mb-2"
            >
              Remove Column
            </button>
            <button
              onClick={closeModal}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl w-full mb-2"
            >
              Cancel
            </button>
            <button onClick={closeModal} className="absolute top-0 right-0 m-4">
              <BsX className="text-gray-500" />
            </button>
          </div>
          {showConfirmation && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <p className="text-lg font-bold mb-4">
                  Are you sure you want to remove this column?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={handleRemoveColumn}
                    className="bg-red-500 text-white px-10 py-2 rounded-full"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="bg-gray-300 text-gray-700 px-10 py-2 rounded-full"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
          {showRenameConfirmation && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <p className="text-lg font-bold mb-4">
                  Are you sure want to rename this column ?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      handleRenameColumn(newColumnName);
                      setShowRenameConfirmation(false);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-3xl"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowRenameConfirmation(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {isGitModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            className={`bg-white p-6 rounded-lg shadow-lg w-2/3 h-5/6 overflow-y-auto relative transition-transform transition-opacity duration-300 ease-out transform ${isGitModalOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
              }`}
          >
            <button
              onClick={closeGitModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-semibold mb-6 border-b pb-2">Git Configuration</h2>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Quick setup — if you've done this kind of thing before</p>
              <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md shadow-sm">
                <code className="text-sm overflow-x-auto">{repository}</code>
                <button
                  onClick={() => copyToClipboard(repository, "button1")}
                  className="ml-2 p-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  {copiedButton === "button1" ? "Copied" : <MdOutlineContentCopy />}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-2">...or create a new repository on the command line</p>
              <div className="relative bg-gray-100 p-3 rounded-md shadow-sm">
                <pre ref={newRepoRef} className="whitespace-pre-wrap">
                  <code>
                    {`echo "# ${repoName}" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin ${repository}
git push -u origin main`}
                  </code>
                </pre>
                <button
                  onClick={() => copyToClipboard(newRepoRef.current.innerText, "button2")}
                  className="absolute right-2 top-2 bg-gray-200 hover:bg-gray-300 p-1 rounded"
                >
                  {copiedButton === "button2" ? "Copied" : <MdOutlineContentCopy />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">...or push an existing repository from the command line</p>
              <div className="relative bg-gray-100 p-3 rounded-md shadow-sm">
                <pre ref={existingRepoRef} className="whitespace-pre-wrap">
                  {`git remote add origin ${repository}
git branch -M main
git push -u origin main`}
                </pre>
                <button
                  onClick={() => copyToClipboard(existingRepoRef.current.innerText, "button3")}
                  className="absolute right-2 top-2 bg-gray-200 hover:bg-gray-300 p-1 rounded"
                >
                  {copiedButton === "button3" ? "Copied" : <MdOutlineContentCopy />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default KanbanBoard;