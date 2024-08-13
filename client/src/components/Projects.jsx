import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { server } from "../constant";
import useTokenValidation from "./UseTockenValidation";
import dayjs from "dayjs";
import {
  Card,
  Modal,
  Input,
  Button,
  DatePicker,
  Select,
  notification,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { BsFillPencilFill } from "react-icons/bs";
const { TextArea } = Input;
const { Option } = Select;

const Projects = () => {
  useTokenValidation();
  const [cards, setCards] = useState([]);
  const [showTooltipIndex, setShowTooltipIndex] = useState(null);
  const [editableCard, setEditableCard] = useState(null);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState("");
  const [descriptionInputValue, setDescriptionInputValue] = useState("");
  const [renameIndex, setRenameIndex] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [userRole, setUserRole] = useState("");
  const [organizationId, setOrganizationId] = useState(null);
  const [newCardErrors, setNewCardErrors] = useState({
    name: false,
    description: false,
    email: false,
    startDate: false,
  });
  const [projectManager, setProjectManager] = useState("");
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [renameInputError, setRenameInputError] = useState(false);
  const [descriptionInputError, setDescriptionInputError] = useState(false);
  const [projectManagerError, setProjectManagerError] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
<<<<<<< HEAD
  const [teamInputError, setTeamInputError] = useState(false);
  const [teamInputErrorMessage, setTeamInputErrorMessage] = useState("");
  const [teamInputValue, setTeamInputValue] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [addProjectModalVisible, setAddProjectModalVisible] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    projectManager: "",
    startDate: null,
    teams: [],
  });
  const dropdownRef = useRef(null);
  
=======

  const [teamInputValue, setTeamInputValue] = useState("");

  const handleTeamInputFocus = () => {
    const filtered = availableTeams.filter(team =>
      team.name.toLowerCase().includes(teamInputValue.toLowerCase())
    );
    setFilteredTeams(filtered);
    setShowTeamDropdown(true);
  };

  const handleTeamInputChange = (event) => {
    const value = event.target.value.replace(/^\s+/, '');
    setTeamInputValue(value);
    setSelectedTeamName(value);
    const filtered = availableTeams.filter(team =>
      team.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTeams(filtered);
    setShowTeamDropdown(true);
  };

  const [selectedTeams, setSelectedTeams] = useState([]);

  const handleTeamSelect = (team) => {
    if (!selectedTeams.includes(team._id)) {
      setSelectedTeams([...selectedTeams, team._id]);
    }
    setTeamInputValue(team.name);
    setSelectedTeamName(team.name);
    setShowTeamDropdown(false);
  };

  const handleClearTeamInput = () => {
    setSelectedTeamName("");
    setTeamInputValue("");
    setShowTeamDropdown(false);
  };
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6

  useEffect(() => {
    const fetchUserRoleAndOrganization = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserRole(response.data.role);
        setOrganizationId(response.data.organizationId);
        fetchProjects(response.data.organizationId);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRoleAndOrganization();
  }, []);

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
      setCards(response.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(
          `${server}/api/organizations/${organizationId}/teams`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAvailableTeams(response.data.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    if (organizationId) {
      fetchTeams();
    }
  }, [organizationId]);

  const handleCardClick = async (projectId) => {
    try {
      navigate(`/projects/${projectId}/tasks`);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const checkDuplicateProjectName = async (name, excludeProjectId = null) => {
    try {
      const response = await axios.get(
        `${server}/api/projects/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const existingProjects = response.data.projects;
      return existingProjects.some(
        (project) =>
          project.name.toLowerCase().replace(/\s+/g, "") ===
            name.toLowerCase().replace(/\s+/g, "") &&
          project._id !== excludeProjectId
      );
    } catch (error) {
      console.error("Error checking for duplicate project name:", error);
      return false;
    }
  };

  const handleAddCard = () => {
    setAddProjectModalVisible(true);
    setNewProject({
      name: "",
      description: "",
      projectManager: "",
<<<<<<< HEAD
      startDate: null,
      teams: [],
    });
    setNewCardErrors({
      name: false,
      description: false,
      email: false,
      startDate: false,
    });
=======
      isNew: true,
    };
    setCards((prevCards) => [...prevCards, newCard]);
    setEditableCard(newCard._id);
    setNewCardErrors({ name: false, description: false, email: false });
    setIsAddingCard(true);
  };
  const resetTeamsState = () => {
    setSelectedTeams([]);
    setSelectedTeamName("");
    setTeamInputValue("");
    setFilteredTeams([]);
    setShowTeamDropdown(false);
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
  };

  const handleSaveNewCard = async () => {
    const newErrors = { ...newCardErrors };
    let hasError = false;

    if (!newProject.name.trim()) {
      newErrors.name = true;
      hasError = true;
    }
    if (!newProject.description.trim()) {
      newErrors.description = true;
      hasError = true;
    }
    if (
      !newProject.projectManager ||
      !isValidEmail(newProject.projectManager)
    ) {
      newErrors.email = true;
      hasError = true;
    }
    if (!newProject.startDate) {
      newErrors.startDate = true;
      hasError = true;
    }
    if (newProject.teams.length === 0) {
      setTeamInputError(true);
      hasError = true;
    }

    if (hasError) {
      setNewCardErrors(newErrors);
      return;
    }

    const isDuplicate = await checkDuplicateProjectName(newProject.name);
    if (isDuplicate) {
      setNewCardErrors({ ...newErrors, name: true });
      notification.warning({
        message: "Project name taken. Choose another",
      });
      return;
    }
<<<<<<< HEAD

=======
    // Check if email is part of the organization
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
    try {
      const response = await axios.get(`${server}/api/users/search`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          email: newProject.projectManager,
          fields: "email status name",
        },
      });

      if (response.data.users.length === 0) {
        setNewCardErrors({ ...newErrors, email: true });
        setProjectManagerError(true);
        return;
      }

      const statusResponse = await axios.get(`${server}/api/user-status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: { email: newProject.projectManager },
      });

      if (statusResponse.data.status === "unverified") {
        setNewCardErrors({ ...newErrors, email: true });
        notification.warning({
          message: "Verify email before creating project",
        });
        return;
      }

      const createdBy = await fetchUserEmail();

      const projectResponse = await axios.post(
        `${server}/api/projects`,
        {
          organizationId: organizationId,
          name: newProject.name.trim(),
          description: newProject.description.trim(),
          projectManager: newProject.projectManager,
          startDate: newProject.startDate,
          teams: newProject.teams,
          createdBy: createdBy,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const newProjectData = projectResponse.data.project;
      setCards((prevCards) => [
        ...prevCards,
        {
          ...newProjectData,
          projectManagerStatus: projectResponse.data.projectManagerStatus,
        },
      ]);
      setAddProjectModalVisible(false);
      fetchProjects(organizationId);
    } catch (error) {
      console.error("Error creating new project:", error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await axios.delete(`${server}/api/projects/${cardId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCards((prevCards) => prevCards.filter((card) => card._id !== cardId));
      setShowTooltipIndex(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteCard(cards[deleteIndex]._id);
    setDeleteDialogVisible(false);
    setDeleteIndex(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogVisible(false);
    setDeleteIndex(null);
  };

  const handleRenameCard = (index) => {
    setRenameIndex(index);
    setRenameInputValue(cards[index].name);
    setDescriptionInputValue(cards[index].description);
    setProjectManager(cards[index].projectManager);
    setRenameDialogVisible(true);
  };

  const handleSaveRename = async () => {
    if (!renameInputValue) {
      setRenameInputError(true);
      return;
    }
    if (!descriptionInputValue) {
      setDescriptionInputError(true);
      return;
    }
    if (!projectManager) {
      setProjectManagerError(true);
      return;
    }
    if (projectManagerError) {
      return;
    }

    let updatedBy;
    try {
      updatedBy = await fetchUserEmail();
    } catch (error) {
      console.error("Error fetching logged-in user's email:", error);
      return;
    }

    const isDuplicate = await checkDuplicateProjectName(
      renameInputValue,
      cards[renameIndex]._id
    );
    if (isDuplicate) {
      setRenameInputError(true);
      notification.warning({
        message: "Name already exists. Choose another",
      });
      return;
    }

    try {
      const response = await axios.put(
        `${server}/api/projects/${cards[renameIndex]._id}`,
        {
          name: renameInputValue,
          description: descriptionInputValue,
          projectManager: projectManager,
          updatedBy: updatedBy,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedProject = response.data.project;

      setCards((prevCards) =>
        prevCards.map((card) =>
          card._id === updatedProject._id ? updatedProject : card
        )
      );

      setRenameDialogVisible(false);
      setRenameIndex(null);
      setShowTooltipIndex(null);
    } catch (error) {
      console.error("Error renaming project:", error);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTooltipIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProjectManagerChange = async (value) => {
    setNewProject((prev) => ({ ...prev, projectManager: value }));
    setProjectManagerError(false);

    if (value) {
      try {
        const response = await axios.get(`${server}/api/users/search`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: { email: value, organizationId: organizationId },
        });

        if (response.data.users.length > 0) {
          setEmailSuggestions(response.data.users);
          setProjectManagerError(false);
        } else {
          setEmailSuggestions([]);
          setProjectManagerError(true);
        }
      } catch (error) {
        console.error("Error fetching user emails:", error);
        setEmailSuggestions([]);
        setProjectManagerError(true);
      }
    } else {
      setEmailSuggestions([]);
      setProjectManagerError(false);
    }
  };

  const isValidEmail = (email) => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const fetchUserEmail = async () => {
    try {
      const response = await axios.get(`${server}/api/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data.user.email;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-light-white rounded-3xl p-8">
      <div className="flex justify-between items-center mb-4">
        {userRole === "ADMIN" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddCard}
            disabled={isAddingCard}
          >
            Add Project
          </Button>
        )}
      </div>
<<<<<<< HEAD

      <div className="flex flex-wrap justify-start">
  {cards.map((card, index) => (
    <Card
      key={card._id}
      className="m-4 w-64 cursor-pointer relative" // Adjust width
      hoverable
      onClick={() => handleCardClick(card._id)}
      style={{ backgroundImage: card.bgUrl ? `url(${card.bgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' ,objectFit:"co"}} // Set background image
    >
      <div className="flex justify-between items-center">
        <Tooltip >
          <h3 className="font-bold text-black truncate">{card.name}</h3>
        </Tooltip>
        {userRole !== "USER" && (
          <Tooltip title="More actions">
            <EllipsisOutlined
              className=""
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltipIndex(
                  showTooltipIndex === index ? null : index
                );
              }}
            />
          </Tooltip>
        )}
=======
      <div className="flex flex-wrap justify-right">
        {cards.map((card, index) => (
          <div
            key={card._id}
            className={`bg-white rounded-3xl border-t-4 border-black relative shadow-xl p-6 m-4 w-72 cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl ${editableCard === card._id ? 'h-auto' : 'h-48'}`}
          >
            {editableCard === card._id ? (
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="text"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="project name"
                  value={card.name}
                  onChange={(event) => handleTitleChange(event, index)}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${newCardErrors.name ? "border-red-500" : ""}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {newCardErrors.name && (
                  <span className="text-red-500">This field is required</span>
                )}
                <label
                  className="block text-gray-700 pt-2 text-sm font-bold mb-2"
                  htmlFor="text"
                >
                  Project Description
                </label>
                <textarea
                  placeholder="Project description"
                  value={card.description}
                  onChange={(event) => handleDescriptionChange(event, index)}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${newCardErrors.description ? "border-red-500" : ""}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {newCardErrors.description && (
                  <span className="text-red-500">This field is required</span>
                )}
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="text"
                >
                  Project Manager
                </label>
                <input
                  type="email"
                  placeholder="Project manager email"
                  value={card.projectManager}
                  onChange={(event) => {
                    handleProjectManagerChange(event);
                    setCards((prevCards) => {
                      const updatedCards = [...prevCards];
                      updatedCards[index].projectManager = event.target.value;
                      return updatedCards;
                    });
                  }}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${newCardErrors.email || projectManagerError
                      ? "border-red-500"
                      : ""
                    }`}
                  onClick={(e) => e.stopPropagation()}
                />
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={card.startDate}
                  onChange={(event) =>
                    handleDateChange(event, index, "startDate")
                  }
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${newCardErrors.startDate ? "border-red-500" : ""}`}
                />
                {newCardErrors.startDate && (
                  <span className="text-red-500">Start date is required</span>
                )}

                {newCardErrors.email && (
                  <span className="text-red-500">
                    {projectManagerError
                      ? "This mail is not a part of this organization"
                      : "This field is required"}
                  </span>
                )}
                {emailSuggestions.length > 0 &&
                  card.projectManager.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                      {emailSuggestions.map((user) => (
                        <li
                          key={user._id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setCards((prevCards) => {
                              const updatedCards = [...prevCards];
                              updatedCards[index].projectManager = user.email;
                              return updatedCards;
                            });
                            setProjectManager(user.email);
                            setEmailSuggestions([]);
                            setProjectManagerError(false);
                          }}
                        >
                          {user.email}
                        </li>
                      ))}
                    </ul>
                  )}

                <label className="block text-gray-700 text-sm font-bold mb-2">Teams</label>
                <div className="relative">
                  <input
                    type="text"
                    value={teamInputValue}
                    onChange={handleTeamInputChange}
                    onFocus={handleTeamInputFocus}
                    onBlur={() => setTimeout(() => setShowTeamDropdown(false), 200)}
                    placeholder="Type to select a team..."
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  {showTeamDropdown && filteredTeams.length > 0 && (
                    <ul
                      style={{
                        position: 'absolute',
                        zIndex: 10,
                        width: '100%',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        marginTop: '4px',
                        borderRadius: '0.375rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        maxHeight: '120px',
                        overflowY: 'auto'
                      }}
                    >
                      {filteredTeams.map((team) => (
                        <li
                          key={team._id}
                          onClick={() => handleTeamSelect(team)}
                          style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #e2e8f0',
                            ':hover': {
                              backgroundColor: '#f7fafc'
                            }
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                        >
                          {team.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-2">
                  {selectedTeams.map(teamId => {
                    const team = availableTeams.find(t => t._id === teamId);
                    // return (
                    //   <span key={teamId} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    //     {team ? team.name : 'Unknown Team'}
                    //     <button
                    //       onClick={() => handleRemoveTeam(teamId)}
                    //       className="ml-2 text-red-500 font-bold"
                    //     >
                    //       &times;
                    //     </button>
                    //   </span>
                    // );
                  })}
                </div>

                <div className="flex justify-between">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                    onClick={() => handleSaveNewCard(index)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelNewCard();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div onClick={() => handleCardClick(card._id)}>
                  <div className="relative group">
                    <span className="block font-bold text-black truncate max-w-[200px]">
                      {card.name}
                    </span>
                    {card.name.length > 20 && (
                      <span className="absolute hidden group-hover:block bg-black text-white p-2 rounded z-10 -mt-1 ml-14">
                        {card.name}
                      </span>
                    )}
                  </div>
                  <div className="relative group mt-2">
                    <span className="block truncate max-w-[200px] text-gray-500">
                      {card.description}
                    </span>
                    {card.description.length > 20 && (
                      <span className="absolute hidden group-hover:block bg-black text-white p-2 rounded z-10 -mt-1 ml-14">
                        {card.description}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="font-semi" style={{ backgroundColor: '#9ceb9b ', color: 'black', padding: '2px 5px', borderRadius: '4px', display: 'inline-block' }}>
                          {"Start Dt: " + dayjs(card.startDate).format("DD/MM/YYYY")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-full">
                      {card.projectManager.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-gray-700 relative group">
                      {card.projectManager.length > 20
                        ? card.projectManager.substring(0, 20) + "..."
                        : card.projectManager}
                      {card.projectManager.length > 20 && (
                        <span className="absolute hidden group-hover:block bg-black text-white p-1 rounded z-10 left-0 mt-1">
                          {card.projectManager}
                        </span>
                      )}
                    </span>
                    {card.projectManagerStatus === "unverify" && (
                      <span className="ml-2 text-yellow-500">(Unverified)</span>
                    )}
                  </div>
                </div>

                <div className="absolute top-0 right-0 p-2">
                  {userRole !== "USER" && (
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(index);
                      }}
                    >
                      &#x2022;&#x2022;&#x2022;
                    </button>
                  )}
                  {showTooltipIndex === index && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-lg"
                      ref={menuRef}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-700 rounded-2xl hover:bg-gray-100"
                        onClick={() => handleRenameCard(index)}
                      >
                        Rename
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-red-500 rounded-2xl hover:bg-gray-100"
                        onClick={() => handleDelete(index)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
      </div>
      <Tooltip >
        <p className="truncate text-gray-500">{card.description}</p>
      </Tooltip>
      <div className="mt-2 flex justify-between items-center">
        <p className="bg-green-100 text-black  rounded-md text-sm inline-block">
          Start Date: {dayjs(card.startDate).format("DD/MM/YYYY")}
        </p>
        <Tooltip title={card.projectManager}>
          <div className="w-5 h-5 bg-blue-600 text-white flex items-center justify-center rounded-full text-xs">
            {card.projectManager.charAt(0).toUpperCase()}
          </div>
        </Tooltip>
      </div>
      {card.projectManagerStatus === "unverify" && (
        <span className="text-yellow-500">(Unverified)</span>
      )}
      {showTooltipIndex === index && (
        <div
          ref={dropdownRef}
          className="absolute left-full top-0 ml-2 w-36 bg-white border rounded-md shadow-lg z-10" // Position to the right of the card
          onClick={(e) => e.stopPropagation()} // Stop click event from closing the menu
        >
          <Button
            type="text"
            block
            icon={<BsFillPencilFill />}
            onClick={(e) => {
              e.stopPropagation();
              handleRenameCard(index);
              setShowTooltipIndex(null); // Close menu after action
            }}
          >
            Rename
          </Button>
          <Button
            type="text"
            block
            icon={<DeleteOutlined />}
            danger
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(index);
              setShowTooltipIndex(null); // Close menu after action
            }}
          >
            Delete
          </Button>
        </div>
      )}
    </Card>
  ))}
</div>


      <Modal
        title="Add New Project"
        visible={addProjectModalVisible}
        onOk={handleSaveNewCard}
        onCancel={() => setAddProjectModalVisible(false)}
        width={600}
      >
        <Input
          placeholder="Project Name"
          value={newProject.name}
          onChange={(e) =>
            setNewProject((prev) => ({ ...prev, name: e.target.value }))
          }
          className={newCardErrors.name ? "border-red-500" : ""}
        />
        {newCardErrors.name && (
          <p className="text-red-500">Project Name is required</p>
        )}

        <TextArea
          placeholder="Project Description"
          value={newProject.description}
          onChange={(e) =>
            setNewProject((prev) => ({ ...prev, description: e.target.value }))
          }
          className={`mt-4 ${
            newCardErrors.description ? "border-red-500" : ""
          }`}
        />
        {newCardErrors.description && (
          <p className="text-red-500">Project Description is required</p>
        )}

        <Select
          className="mt-4 w-full"
          placeholder="Select a Project Manager"
          value={
            newProject.projectManager.length > 0
              ? newProject.projectManager
              : null
          }
          onChange={handleProjectManagerChange}
          onSearch={handleProjectManagerChange}
          filterOption={false}
          showSearch
          
        >
          {emailSuggestions.map((user) => (
            <Option key={user._id} value={user.email}>
              {user.email}
            </Option>
          ))}
        </Select>

        {newCardErrors.email && (
          <p className="text-red-500">
            Valid Project Manager email is required
          </p>
        )}

        <DatePicker
          className="mt-4 w-full"
          placeholder="Start Date"
          value={newProject.startDate ? dayjs(newProject.startDate) : null}
          onChange={(date) =>
            setNewProject((prev) => ({
              ...prev,
              startDate: date ? date.toDate() : null,
            }))
          }
        />
        {newCardErrors.startDate && (
          <p className="text-red-500">Start Date is required</p>
        )}

        <Select
          className="mt-4 w-full"
          mode="multiple"
          placeholder="Select Teams"
          value={newProject.teams}
          onChange={(values) =>
            setNewProject((prev) => ({ ...prev, teams: values }))
          }
        >
          {availableTeams.map((team) => (
            <Option key={team._id} value={team._id}>
              {team.name}
            </Option>
          ))}
        </Select>
        {teamInputError && (
          <p className="text-red-500">At least one team is required</p>
        )}
      </Modal>

      <Modal
        title="Rename Project"
        visible={renameDialogVisible}
        onOk={handleSaveRename}
        onCancel={() => setRenameDialogVisible(false)}
      >
        <Input
          placeholder="Project Name"
          value={renameInputValue}
          onChange={(e) => {
            setRenameInputValue(e.target.value);
            setRenameInputError(false);
          }}
          className={renameInputError ? "border-red-500" : ""}
        />
        {renameInputError && (
          <p className="text-red-500">Project Name is required</p>
        )}

        <TextArea
          placeholder="Project Description"
          value={descriptionInputValue}
          onChange={(e) => {
            setDescriptionInputValue(e.target.value);
            setDescriptionInputError(false);
          }}
          className={`mt-4 ${descriptionInputError ? "border-red-500" : ""}`}
        />
        {descriptionInputError && (
          <p className="text-red-500">Project Description is required</p>
        )}

        <Input
          placeholder="Project Manager Email"
          value={projectManager}
          onChange={(e) => {
            setProjectManager(e.target.value);
            setProjectManagerError(false);
          }}
          className={`mt-4 ${projectManagerError ? "border-red-500" : ""}`}
        />
        {projectManagerError && (
          <p className="text-red-500">
            Valid Project Manager email is required
          </p>
        )}
      </Modal>

      <Modal
        title="Confirm Project Deletion"
        visible={deleteDialogVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
      >
        <p>Are you sure you want to delete this project?</p>
      </Modal>
    </div>
  );
};
<<<<<<< HEAD

=======
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
export default Projects;
