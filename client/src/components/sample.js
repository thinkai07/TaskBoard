// //kanban.jsx
// import React, { useState, useRef, useEffect } from "react";
// import Board, { moveCard, moveColumn } from "@lourenci/react-kanban";
// import io from "socket.io-client";
// import { Dropdown, Menu } from "antd"; //added
// import { DownOutlined } from "@ant-design/icons"; //added
// import {BsX,} from "react-icons/bs";
// import { Tooltip } from "antd";
// import "@lourenci/react-kanban/dist/styles.css";
// import { useParams } from "react-router-dom";
// import { server } from "../constant";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../components/Style.css";
// import useTokenValidation from "./UseTockenValidation";
// import { RxActivityLog } from "react-icons/rx";
// import { notification } from "antd";
// import { MdOutlineContentCopy } from "react-icons/md";
// import RulesButton from "./RulePage";
// import { FaPlus } from "react-icons/fa";
// import { Popover, Button, Space, Modal, Form, Input, Select } from "antd";
// import { MoreOutlined, SettingOutlined, ToolOutlined } from "@ant-design/icons";
// import { SquareMenu } from "lucide-react";
// import { Plus } from "lucide-react";
// import { X } from "lucide-react";
// import BackgroundChange from "./BackgroundChange";
// import { Bell, SquareChevronDown } from "lucide-react";
// import { Drawer, Typography, Progress, List, Avatar, Tabs } from "antd";
// import { CloseOutlined, CommentOutlined } from "@ant-design/icons";
// const initialBoard = {
//   columns: [],
// };
// function KanbanBoard() {
//   useTokenValidation();
//   const [boardData, setBoardData] = useState(initialBoard);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedColumnId, setSelectedColumnId] = useState(null);
//   const [modalType, setModalType] = useState(null);
//   const containerRef = useRef(null);
//   const { projectId } = useParams();
//   const [bgUrl, setBgUrl] = useState("");
//   const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
//   const [userEmail, setUserEmail] = useState("");
//   const [projectName, setProjectName] = useState("");
//   const [projectManager, setProjectManager] = useState("");
//   const [newColumnModalVisible, setNewColumnModalVisible] = useState(false);
//   const [newColumnName, setNewColumnName] = useState("");
//   const [showRenameConfirmation, setShowRenameConfirmation] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [renameCardModalVisible, setRenameCardModalVisible] = useState(false);
//   const [renameCardTitle, setRenameCardTitle] = useState("");
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
//   const [memberAdded, setMemberAdded] = useState(false);
//   const [commentsVisible, setCommentsVisible] = useState(true);
//   const [activities, setActivities] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [renameCardDescription, setRenameCardDescription] = useState("");
//   const [selectedCardId, setSelectedCardId] = useState(null);
//   const suggestionListRef = useRef(null);
//   const [emailSuggestions, setEmailSuggestions] = useState([]);
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);
//   const [isEditingTitle, setIsEditingTitle] = useState(false);
//   const [isEditingDescription, setIsEditingDescription] = useState(false);
//   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [email, setEmail] = useState("");
//   const [team, setTeam] = useState("");
//   const navigate = useNavigate();
//   const [projects, setProjects] = useState([]);
//   const [user, setUser] = useState({});
//   const [renameCardErrors, setRenameCardErrors] = useState({
//     title: "",
//     description: "",
//   });
//   const [repoName, setRepoName] = useState("");
//   const [repository, setRepository] = useState("");
//   const newRepoRef = useRef(null);
//   const existingRepoRef = useRef(null);
//   const [isGitModalOpen, setIsGitModalOpen] = useState(false);
//   const [copiedButton, setCopiedButton] = useState(null);
//   const [editingColumnId, setEditingColumnId] = useState(null);
//   const [tempColumnName, setTempColumnName] = useState("");
//   const [newColumnError, setNewColumnError] = useState(false);
//   const [comment, setComment] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [userComment, setUserComment] = useState("");
//   const [comments, setComments] = useState([]);
//   const [assignedTo, setAssignedTo] = useState([]);
//   const [createdBy, setcreatedBy] = useState([]);
//   const [dueDate, setDueDate] = useState("");
//   const [estimatedHours, setEstimatedHours] = useState(0);
//   const [utilizedHours, setUtilizedHours] = useState(0);
//   const [remainingHours, setRemainingHours] = useState(0);

//   const { TextArea } = Input;
//   const { Text, Title } = Typography;
//   const [taskLogs, setTaskLogs] = useState([]);
//   const { Option } = Select;

//   const handleTeamsClick = () => {
//     navigate(`/projects/${projectId}/teams`);
//   };

//   const [userRole, setUserRole] = useState("");

//   const location = useLocation();
//   //added
//   const [showBackgroundChange, setShowBackgroundChange] = useState(false);

//   //added for antd drawer
//   const [visible, setVisible] = useState(false);

//   const showDrawer = () => {
//     setVisible(true);
//   };

//   const onClose = () => {
//     setVisible(false);
//   };

//   const isProjectRoute = location.pathname.startsWith("/projects/");
//   //added
//   const handleBackgroundChangeClick = () => {
//     setShowBackgroundChange(true);
//   };

//   useEffect(() => {
//     const fetchUserRole = async () => {
//       try {
//         const response = await axios.get(`${server}/api/role`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });

//         setUserRole(response.data.role);
//       } catch (error) {
//         console.error("Error fetching user role:", error);
//       }
//     };

//     fetchUserRole();
//   }, []);

 
//   useEffect(() => {
//     const fetchUserEmail = async () => {
//       try {
//         const response = await axios.get(`${server}/api/user`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         setUserEmail(response.data.user.email);
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };

//     fetchUserEmail();
//   }, []);

//   //
//   useEffect(() => {
//     const fetchUserRoleAndOrganization = async () => {
//       try {
//         const response = await axios.get(`${server}/api/role`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         setUser({ role: response.data.role, email: response.data.email });
//         fetchProjects(response.data.organizationId);
//       } catch (error) {
//         console.error("Error fetching user role:", error);
//       }
//     };
//     fetchUserRoleAndOrganization();
//   }, []);

//   const openGitModal = () => {
//     setIsGitModalOpen(true);
//   };
//   const closeGitModal = () => {
//     setIsGitModalOpen(false);
//   };
//   // Inside your component
//   const userFromLocalStorage = getUserFromLocalStorage();
//   const emailFromLocalStorage = userFromLocalStorage
//     ? userFromLocalStorage.email
//     : null;

//   const canShowActions =
//     userFromLocalStorage &&
//     (user.role === "ADMIN" ||
//       emailFromLocalStorage ===
//         projects.find((project) => project._id === projectId)?.projectManager);

//   // Update fetchTasks function to include cards
//   async function fetchTasks() {
//     try {
//       const response = await fetch(
//         `${server}/api/projects/${projectId}/tasks`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch tasks");
//       }

//       const { tasks, bgUrl } = await response.json();

//       const columns = await Promise.all(
//         tasks.map(async (task) => {
//           const cardsResponse = await fetch(
//             `${server}/api/tasks/${task.id}/cards`,
//             {
//               method: "GET",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${localStorage.getItem("token")}`,
//               },
//             }
//           );

//           if (!cardsResponse.ok) {
//             throw new Error("Failed to fetch cards for task " + task.name);
//           }

//           const { cards } = await cardsResponse.json();

//           return {
//             id: task.id,
//             title: task.name,
//             cards: cards.map((card) => {
//               const utilizedHours = card.utilizedHours || 0;
//               const estimatedHours = card.estimatedHours || 0;
//               const remainingHours = estimatedHours - utilizedHours;

//               return {
//                 id: card.id,
//                 title: card.name || "",
//                 description: card.description || "",
//                 columnId: task.id,
//                 assignedTo: card.assignedTo,
//                 createdBy: card.createdBy,
//                 status: card.status,
//                 assignDate: card.assignDate,
//                 dueDate: card.dueDate,
//                 comments: card.comments || [],
//                 activities: card.activities || [],
//                 taskLogs: card.taskLogs || [],
//                 estimatedHours: estimatedHours,
//                 utilizedHours: utilizedHours,
//                 remainingHours: remainingHours,
//                 cardId: card.uniqueId,
//               };
//             }),
//           };
//         })
//       );

//       setBgUrl(bgUrl);
//       console.log(bgUrl);
//       setBoardData({ columns });
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//     }
//   }

//   useEffect(() => {
//     console.log("Current bgUrl:", bgUrl);
//   }, [bgUrl]);

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setMemberAdded(false); // Reset the state
//     setEmail("");
//     setTeam("");
//   };

//   const openRenameCardModal = (
//     columnId,
//     cardId,
//     currentTitle,
//     currentDescription,
//     currentComments,
//     currentActivities,
//     currentTaskLogs,
//     estimatedHours, // New parameter
//     utilizedHours, // New parameter
//     assignedTo, // New parameter
//     createdBy,
//     dueDate
//   ) => {
//     console.log("openRenameCardModal called with:", cardId, currentComments);

//     setSelectedColumnId(columnId);
//     setSelectedCardId(cardId);
//     setRenameCardTitle(currentTitle);
//     setRenameCardDescription(currentDescription);
//     setComments(currentComments || []); // Ensure comments are set correctly
//     setRenameCardModalVisible(true);
//     setActivities(currentActivities || []);
//     setTaskLogs(currentTaskLogs || []);

//     // Calculate remaining hours
//     const remainingHours = estimatedHours - utilizedHours;

//     // Set the actual hours to be displayed
//     setEstimatedHours(estimatedHours);
//     setUtilizedHours(utilizedHours);
//     setRemainingHours(remainingHours);

//     //added
//     setAssignedTo(assignedTo);
//     setcreatedBy(createdBy);
//     setDueDate(dueDate);
//   };

//   const clearFieldsAndRefresh = async () => {
//     // Clear input fields
//     if (document.forms[0]) {
//       document.forms[0].reset();
//     }
//     setEmail("");

//     // Close the modal
//     setModalVisible(false);

//     // Refresh board data
//     await fetchTasks();
//   };

//   // // // Update handleAddCard function
//   const handleAddCard = async (e) => {
//     e.preventDefault();
//     const cardTitle = e.target.title.value.trim() || "";
//     const cardDescription = e.target.description.value.trim() || "";
//     const assignDate = e.target.assignDate.value;
//     const dueDate = e.target.dueDate.value;
//     const estimatedHours = parseFloat(e.target.estimatedHours.value) || 0;

//     if (
//       !cardTitle ||
//       !cardDescription ||
//       !selectedColumnId ||
//       !email ||
//       !assignDate ||
//       !dueDate ||
//       !estimatedHours
//     ) {
//       notification.warning({
//         message: "Please fill in all fields",
//       });
//       return;
//     }

//     try {
//       const createdBy = await fetchUserEmail();

//       const searchResponse = await fetch(
//         `${server}/api/projects/${projectId}/users/search?email=${email}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (!searchResponse.ok) {
//         throw new Error("User is not part of the project");
//       }

//       const { users } = await searchResponse.json();
//       if (users.length === 0) {
//         notification.warning({
//           message: "The entered email is not part of the project",
//         });
//         return;
//       }

//       const response = await fetch(
//         `${server}/api/tasks/${selectedColumnId}/cards`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({
//             name: cardTitle,
//             description: cardDescription,
//             assignedTo: email,
//             createdBy: email,
//             assignDate: assignDate,
//             dueDate: dueDate,
//             estimatedHours: estimatedHours, // Include estimatedHours
//             createdBy: createdBy,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to add card");
//       }

//       await clearFieldsAndRefresh();
//       e.target.title.value = "";
//       e.target.description.value = "";
//       e.target.estimatedHours.value = "";
//       setEmail("");

//       setModalVisible(false);

//       await fetchTasks();
//       notification.success({
//         message: "Task added Successfully",
//       });
//     } catch (error) {
//       console.error("Error adding card:", error);
//       alert(error.message);
//     }
//   };

//   const handleEmailChange = async (e) => {
//     const emailInput = e.target.value;
//     setEmail(emailInput);

//     if (!emailInput) {
//       setEmailSuggestions([]);
//       return;
//     }

//     try {
//       const response = await fetch(
//         `${server}/api/projects/${projectId}/users/search?email=${emailInput}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch email suggestions");
//       }

//       const { users } = await response.json();

//       // Filter out duplicate emails
//       const uniqueUsers = users.filter(
//         (user, index, self) =>
//           index === self.findIndex((t) => t.email === user.email)
//       );

//       setEmailSuggestions(uniqueUsers);
//     } catch (error) {
//       console.error("Error fetching email suggestions:", error);
//       setEmailSuggestions([]);
//     }
//   };

//   useEffect(() => {
//     if (projectId) {
//       fetchTasks();
//     }

//     const updateContainerWidth = () => {
//       if (containerRef.current) {
//         const boardWidth = containerRef.current.scrollWidth;
//         containerRef.current.style.width = `${boardWidth}px`;
//       }
//     };

//     updateContainerWidth();
//     window.addEventListener("resize", updateContainerWidth);

//     return () => {
//       window.removeEventListener("resize", updateContainerWidth);
//     };
//   }, [projectId]);

//   useEffect(() => {
//     if (!newColumnModalVisible || !modalVisible) {
//       fetchTasks();
//     }
//   }, [newColumnModalVisible, modalVisible]);

//   // // update add coloumn
//   const handleAddColumn = () => {
//     setNewColumnError(false);
//     setNewColumnModalVisible(true);
//   };
//   useEffect(() => {
//     async function fetchProjectDetails() {
//       try {
//         const response = await fetch(`${server}/api/projects/${projectId}`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch project details");
//         }

//         const project = await response.json();
//         setProjectName(project.name);
//         console.log(project.projectManager);
//         setProjectManager(project.projectManger);
//       } catch (error) {
//         console.error("Error fetching project details:", error);
//       }
//     }

//     fetchProjectDetails();
//   }, [server, projectId]); // Dependencies for useEffect

//   async function handleChangeStatus(cardId, newStatus) {
//     try {
//       // Fetch the user's email (updatedBy)
//       const updatedBy = await fetchUserEmail();
//       // Get the current date and time (updatedDate)
//       const updatedDate = new Date().toISOString();

//       // Make the PUT request to update the card status
//       const response = await fetch(`${server}/api/cards/${cardId}/status`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({ status: newStatus, updatedBy, updatedDate }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update status");
//       }

//       // Update the local state
//       setBoardData((prevState) => {
//         const updatedColumns = prevState.columns.map((column) => {
//           const updatedCards = column.cards.map((card) => {
//             if (card.id === cardId) {
//               return { ...card, status: newStatus, updatedBy, updatedDate };
//             }
//             return card;
//           });
//           return { ...column, cards: updatedCards };
//         });

//         return { ...prevState, columns: updatedColumns };
//       });
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   }
//   //added
//   const statusMenu = (cardId) => (
//     <Menu
//       onClick={(e) => handleChangeStatus(cardId, e.key)}
//       items={[
//         { key: "pending", label: "Pending" },
//         { key: "inprogress", label: "Inprogress" },
//         { key: "completed", label: "Completed" },
//       ]}
//     />
//   );
//   const renderCard = (card, { dragging }) => (
//     <div
//       className={`react-kanban-card ${dragging ? "dragging" : ""}`}
//       style={{ borderRadius: "10px", maxWidth: "750px", overflow: "hidden" }}
//     >
//       <div className="p-4">
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//           onClick={() =>
//             openRenameCardModal(
// card.columnId,card.id,card.title,card.description,card.comments,card.activities,card.taskLogs,card.estimatedHours,card.utilizedHours,card.assignedTo,card.createdBy,card.dueDate
//             )
//           }
//         >
//           <div className="react-kanban-card__title truncate" title={card.title}>
//             {card.title && card.title.length > 20
//               ? card.title.slice(0, 28) + "..."
//               : card.title}
//           </div>
//           <div className="react-kanban-card__assignedTo flex items-center">
//             {card.assignedTo && (
//               <div className="profile-picture w-6 h-6 rounded-full bg-blue-400 text-white flex justify-center items-center font-bold ml-2 relative group">
//                 <span className="group-hover:block hidden absolute top-4 right-0 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
//                   {card.assignedTo}
//                 </span>
//                 {card.assignedTo.charAt(0).toUpperCase()}
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="react-kanban-card__dueDate">
//           {card.dueDate && (
//             <div className="text-sm text-gray-500">
//               Due Date:{" "}
//               {new Date(card.dueDate).toLocaleDateString("en-US", {
//                 year: "numeric",
//                 month: "short",
//                 day: "numeric",
//                 hour: "numeric",
//                 minute: "numeric",
//                 hour12: true,
//               })}
//             </div>
//           )}
//         </div>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "flex-start",
//             justifyContent: "space-between",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <div className="react-kanban-card__status">
//               <Select
//                 value={card.status}
//                 onChange={(value) => handleChangeStatus(card.id, value)}
//                 style={{ width: 110, height: 25 }} // You can adjust the width as needed
//               >
//                 <Option value="pending">Pending</Option>
//                 <Option value="inprogress">In Progress</Option>
//                 <Option value="completed">Completed</Option>
//               </Select>
//             </div>
//             <div
//               title={card.uniqueId}
//               style={{ marginLeft: "10px", font: "small-caption" }}
//             >
//               <h1>ID:{card.cardId}</h1>
//             </div>
//           </div>

//           {canShowActions && (
//             <button
//               className="delete-card-button"
//               onClick={(e) => {
//                 e.stopPropagation(); // Prevent click event from bubbling up
//                 confirmRemoveCard(card.columnId, card.id);
//               }}
//               style={{
//                 marginRight: "10px",
//                 color: "red",
//                 paddingTop: "5px",
//                 marginLeft: "30%",
//                 marginTop: "3%",
//               }}
//             >
//               {/* <BsTrash /> */}
//             </button>
//           )}
//           <button
//             className="delete-card-button"
//             onClick={(e) => {
//               e.stopPropagation(); // Prevent click event from bubbling up
//               openRenameCardModal(
//                 card.columnId,
//                 card.id,
//                 card.title,
//                 card.description,
//                 card.comments,
//                 card.activities,
//                 card.taskLogs
//               );
//             }}
//             style={{ color: "black", marginTop: "4%" }}
//           >
//             {/* <BsFillPencilFill /> */}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   //

//   const fetchTasks1 = async () => {
//     try {
//       const response = await axios.get(
//         `${server}/api/projects/${projectId}/tasks`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       setTasks(response.data.tasks);
//       console.log("tasks1 done");
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//     }
//   };
//   useEffect(() => {
//     fetchTasks1();
//   }, [boardData]);

//   const handleRenameCard = async (e) => {
//     e.preventDefault();
//     const trimmedTitle = renameCardTitle.trim();
//     const trimmedDescription = renameCardDescription.trim();
//     let hasErrors = false;
//     const errors = { title: "", description: "" };

//     if (!trimmedTitle) {
//       errors.title = "Please enter a card title";
//       hasErrors = true;
//     }
//     if (!trimmedDescription) {
//       errors.description = "Please enter a card description";
//       hasErrors = true;
//     }

//     if (hasErrors) {
//       setRenameCardErrors(errors);
//       return;
//     }

//     try {
//       const updatedBy = await fetchUserEmail();

//       const response = await fetch(
//         `${server}/api/tasks/${selectedColumnId}/cards/${selectedCardId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({
//             name: trimmedTitle,
//             description: trimmedDescription,
//             updatedBy: updatedBy,
//             updatedDate: new Date().toISOString(),
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to rename card");
//       }

//       // Update local state
//       setBoardData((prevState) => {
//         const updatedColumns = prevState.columns.map((column) => {
//           if (column.id === selectedColumnId) {
//             return {
//               ...column,
//               cards: column.cards.map((card) =>
//                 card.id === selectedCardId
//                   ? {
//                       ...card,
//                       title: trimmedTitle,
//                       description: trimmedDescription,
//                     }
//                   : card
//               ),
//             };
//           }
//           return column;
//         });

//         return { ...prevState, columns: updatedColumns };
//       });

//       // Optionally fetch the latest data from the server
//       await fetchTasks();

//       setRenameCardErrors({ title: "", description: "" });
//       setShowSuccessPopup(true);
//       setTimeout(() => {
//         setShowSuccessPopup(false);
//         setRenameCardModalVisible(false); // Close the modal after showing success message
//       }, 1000);
//     } catch (error) {
//       console.error("Error renaming card:", error);
//     }
//   };

//   const handleCancel = () => {
//     setRenameCardModalVisible(false);
//     setRenameCardErrors({ title: "", description: "" });
//   };

//   // Handle saving title
//   const handleTitleBlur = () => {
//     if (renameCardTitle.trim()) {
//       // Save title logic here
//       console.log("Title saved:", renameCardTitle);
//     }
//   };

//   // Handle saving description
//   const handleDescriptionBlur = () => {
//     if (renameCardDescription.trim()) {
//       // Save description logic here
//       console.log("Description saved:", renameCardDescription);
//     }
//   };

//   const items = [
//     {
//       key: "1",
//       label: "Activities",
//       children: (
//         <div className="mt-4 h-96 overflow-y-auto">
//           {activities.length > 0 ? (
//             <List
//               dataSource={activities}
//               renderItem={(activity, idx) => (
//                 <List.Item
//                   key={activity.id}
//                   className={`ml-2 text-gray-700 mt-2 ${
//                     idx === 0 ? "bg-gray-100" : "bg-white"
//                   }`}
//                 >
//                   <List.Item.Meta
//                     avatar={
//                       <Avatar style={{ backgroundColor: "#1890ff" }}>
//                         {activity.commentBy[0].toUpperCase()}
//                       </Avatar>
//                     }
//                     title={<strong>{activity.commentBy}</strong>}
//                     description={activity.comment}
//                   />
//                 </List.Item>
//               )}
//             />
//           ) : (
//             <Text>No activities found.</Text>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "2",
//       label: "Log-in Hours",
//       children: (
//         <div className="mt-4 h-96 overflow-y-auto">
//           {taskLogs.length > 0 ? (
//             <List
//               dataSource={taskLogs}
//               renderItem={(taskLog, idx) => (
//                 <List.Item
//                   key={taskLog.id}
//                   className={`ml-2 text-gray-700 mt-2 ${
//                     idx === 0 ? "bg-gray-100" : "bg-white"
//                   }`}
//                 >
//                   <List.Item.Meta
//                     avatar={
//                       <Avatar style={{ backgroundColor: "#1890ff" }}>
//                         {taskLog.loggedBy.name[0].toUpperCase()}
//                       </Avatar>
//                     }
//                     title={<strong>{taskLog.loggedBy.name}</strong>}
//                     description={taskLog.hours}
//                   />
//                 </List.Item>
//               )}
//             />
//           ) : (
//             <Text>No log-in hours found.</Text>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "3",
//       label: "Comments",
//       children: (
//         <div className="mt-4 h-96 overflow-y-auto">
//           <div className="flex items-center mb-4 pt-6">
//             <CommentOutlined className="mr-2" />
//             <Title level={4}>Comments</Title>
//           </div>

//           <div className="flex items-center mb-2">
//             <Avatar style={{ backgroundColor: "#1890ff" }}>
//               {userEmail.charAt(0).toUpperCase()}
//             </Avatar>
//             <Input
//               value={userComment}
//               onChange={(e) => setUserComment(e.target.value)}
//               onKeyPress={(e) => {
//                 if (e.key === "Enter") {
//                   handleSaveComment();
//                 }
//               }}
//               placeholder="Write your comment"
//               className="border border-gray-300 rounded-3xl px-4 py-2 w-full ml-2"
//             />
//           </div>

//           {commentsVisible && comments.length > 0 ? (
//             <List
//               dataSource={comments.slice().reverse()}
//               renderItem={(comment, idx) => (
//                 <List.Item
//                   key={idx}
//                   className={`ml-2 text-gray-700 mt-2 ${
//                     idx === 0 ? "bg-gray-100" : "bg-white"
//                   }`}
//                 >
//                   <List.Item.Meta
//                     avatar={
//                       <Avatar style={{ backgroundColor: "#1890ff" }}>
//                         {comment.commentBy[0].toUpperCase()}
//                       </Avatar>
//                     }
//                     title={<strong>{comment.commentBy}</strong>}
//                     description={comment.comment}
//                   />
//                 </List.Item>
//               )}
//             />
//           ) : (
//             <Text>No comments yet.</Text>
//           )}
//         </div>
//       ),
//     },
//   ];

//   // The function for handling comment submission
//   const handleSaveComment = async () => {
//     if (userComment.trim()) {
//       try {
//         const updatedBy = await fetchUserEmail();

//         const response = await fetch(
//           `${server}/api/tasks/${selectedColumnId}/cards/${selectedCardId}`,
//           {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//             body: JSON.stringify({
//               updatedBy: updatedBy,
//               comment: userComment.trim(),
//               name: renameCardTitle,
//               description: renameCardDescription,
//             }),
//           }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to save comment");
//         }

//         // Update local state immediately
//         setBoardData((prevState) => {
//           const updatedColumns = prevState.columns.map((column) => {
//             if (column.id === selectedColumnId) {
//               return {
//                 ...column,
//                 cards: column.cards.map((card) => {
//                   if (card.id === selectedCardId) {
//                     return {
//                       ...card,
//                       comments: [
//                         ...card.comments,
//                         { commentBy: userEmail, comment: userComment.trim() },
//                       ],
//                       activities: [
//                         ...card.activities,
//                         { commentBy: userEmail, comment: userComment.trim() },
//                       ],
//                     };
//                   }
//                   return card;
//                 }),
//               };
//             }
//             return column;
//           });

//           return { ...prevState, columns: updatedColumns };
//         });

//         // Update the comments state
//         setComments([
//           ...comments,
//           { commentBy: userEmail, comment: userComment.trim() },
//         ]);

//         // Clear the comment input
//         setUserComment("");

//         // Optionally fetch the latest data from the server
//         await fetchTasks();
//       } catch (error) {
//         console.error("Error saving comment:", error);
//       }
//     }
//   };

//   return (
//     <div
//       className="overflow-y-auto  bg-light-multicolor h-[calc(100vh-57px)] rounded-xl"
//       style={
//         bgUrl
//           ? {
//               backgroundImage: `url(${bgUrl.raw})`,
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//               width: "100%",
//             }
//           : {}
//       }
//     >
//       <div>
//         <Modal
//           visible={renameCardModalVisible}
//           onCancel={handleCancel}
//           footer={null}
//           width="60%"
//           closeIcon={<CloseOutlined />}
//           centered
//           className="rounded-lg shadow-lg"
//           bodyStyle={{ padding: "20px", maxHeight: "80vh" }}
//         >
//           <form onSubmit={handleRenameCard}>
//             <div className="flex justify-between">
//               {/* Left Side: Card Title and Description */}
//               <div className="w-2/3 pr-4">
//                 <div className="mb-4">
//                   {isEditingTitle ? (
//                     <Input
//                       value={renameCardTitle}
//                       onChange={(e) => {
//                         setRenameCardTitle(e.target.value);
//                         setRenameCardErrors((prev) => ({
//                           ...prev,
//                           title: "",
//                         }));
//                       }}
//                       onBlur={handleTitleBlur}
//                       onPressEnter={handleTitleBlur}
//                       className={`${
//                         renameCardErrors.title
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       } rounded-xl px-4 py-2 mt-5 w-full`}
//                       placeholder="Card Title"
//                       autoFocus
//                     />
//                   ) : (
//                     <Text
//                       onDoubleClick={() => setIsEditingTitle(true)}
//                       className="cursor-pointer"
//                     >
//                       {renameCardTitle}
//                     </Text>
//                   )}
//                   {renameCardErrors.title && (
//                     <Text type="danger" className="text-sm mt-1">
//                       {renameCardErrors.title}
//                     </Text>
//                   )}
//                 </div>

//                 <div className="mb-4">
//                   {isEditingDescription ? (
//                     <>
//                       <TextArea
//                         value={renameCardDescription}
//                         onChange={(e) => {
//                           setRenameCardDescription(e.target.value);
//                           setRenameCardErrors((prev) => ({
//                             ...prev,
//                             description: "",
//                           }));
//                         }}
//                         onBlur={handleDescriptionBlur}
//                         onPressEnter={handleDescriptionBlur}
//                         className={`${
//                           renameCardErrors.description
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-xl px-4 py-2 w-full`}
//                         placeholder="Card Description"
//                         autoFocus
//                       />
//                       {renameCardErrors.description && (
//                         <Text type="danger" className="text-sm mt-1">
//                           {renameCardErrors.description}
//                         </Text>
//                       )}
//                       <div className="flex justify-end mt-4">
//                         <Button
//                           onClick={() => setIsEditingDescription(false)}
//                           className="mr-2"
//                         >
//                           Cancel
//                         </Button>
//                         <Button type="primary" onClick={handleRenameCard}>
//                           Save
//                         </Button>
//                       </div>
//                     </>
//                   ) : (
//                     <Text
//                       onDoubleClick={() => setIsEditingDescription(true)}
//                       className="cursor-pointer"
//                     >
//                       {renameCardDescription}
//                     </Text>
//                   )}
//                 </div>
//                 <div className="mb-4">
//                   <Tabs defaultActiveKey="1" items={items} />
//                 </div>
//               </div>

//               {/* Right Side: Project Info */}
//               <div className="w-1/3 pl-4 ">
//                 <div className="mb-4">
//                   <Text strong>Project Name:</Text>
//                   <Text>{projectName}</Text>
//                 </div>
//                 <div className="mb-4">
//                   <Text strong>Assigned To:</Text>
//                   <Text>{assignedTo}</Text>
//                 </div>
//                 <div className="mb-4">
//                   <Text strong>Assigned By:</Text>
//                   <Text>{createdBy}</Text>
//                 </div>
//                 <div className="mb-4">
//                   <Text strong>End Date:</Text>
//                   <Text>
//                     {new Date(dueDate).toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "short",
//                       day: "numeric",
//                       hour: "numeric",
//                       minute: "numeric",
//                       hour12: true,
//                     })}
//                   </Text>
//                 </div>
//                 <div className="flex justify-between mt-6">
//                   <div className="w-full mt-20">
//                     <Text strong className="block mb-4 text-xl">
//                       Progress
//                     </Text>
//                     <div className="mb-4">
//                       <Text>Estimated Time:</Text>
//                       <div className="flex items-center">
//                         {/* <Text>{estimatedHours} </Text>  */}
//                         <Tooltip title={`${estimatedHours} hours`}>
//                           <Progress
//                             className="ml-2"
//                             percent={100} // Always 100% since it's the full estimate
//                             showInfo={false}
//                           />
//                         </Tooltip>
//                       </div>
//                     </div>
//                     <div className="mb-4">
//                       <Text>Utilized Time:</Text>
//                       <div className="flex items-center">
//                         {/* <Text>{utilizedHours} </Text>  */}
//                         <Tooltip title={`${utilizedHours} hours`}>
//                           <Progress
//                             className="ml-2"
//                             percent={(utilizedHours / estimatedHours) * 100} // Show utilization progress
//                             showInfo={false}
//                           />
//                         </Tooltip>
//                       </div>
//                     </div>
//                     <div className="mb-4">
//                       <Text>Remaining Time:</Text>
//                       <div className="flex items-center">
//                         {/* <Text>{remainingHours} hours</Text>  */}
//                         <Tooltip title={`${remainingHours} hours`}>
//                           <Progress
//                             className="ml-2"
//                             percent={(remainingHours / estimatedHours) * 100} // Show remaining progress
//                             showInfo={false}
//                           />
//                         </Tooltip>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* Progress Section */}
//           </form>
//         </Modal>
//       </div>
//       {/* <div className="flex justify-between items-center mb-4"> */}
//       <div className="flex justify-between items-center  bg-gray-500 bg-opacity-20 pl-2 pb-2 ">
//         <div>
//           <h1 className="text-xl font-semibold">Project : {projectName}</h1>
//           <h1 className="text-xl font-semibold">
//             Project Manager : {projectManager}
//           </h1>
//         </div>