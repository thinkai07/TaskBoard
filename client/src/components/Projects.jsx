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
<<<<<<< HEAD
  
=======

>>>>>>> 8153153255c5360b0a271a54212e5094728a3356

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

<<<<<<< HEAD
  
=======

>>>>>>> 8153153255c5360b0a271a54212e5094728a3356

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
      startDate: null,
      teams: [],
    });
    setNewCardErrors({
      name: false,
      description: false,
      email: false,
      startDate: false,
    });
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

>>>>>>> 8153153255c5360b0a271a54212e5094728a3356
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

      <div className="flex flex-wrap justify-start">
<<<<<<< HEAD
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
=======
        {cards.map((card, index) => (
          <Card
            key={card._id}
            className="m-4 w-64 cursor-pointer relative " // Adjust width
            hoverable
            onClick={() => handleCardClick(card._id)}
            style={{ backgroundImage: card.bgUrl ? `url(${card.bgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', objectFit: "co" }} // Set background image
          >
            <div className="flex justify-between items-center">
              <Tooltip title={card.name}>
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
            </div>
            <Tooltip title={card.description}>
              <p className="truncate text-gray-500">{card.description}</p>
            </Tooltip>
            <div className="mt-2 flex justify-between items-center">
              <p className="bg-green-100 text-black px-1 py-0.5 rounded-md text-sm inline-block">
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
>>>>>>> 8153153255c5360b0a271a54212e5094728a3356


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
<<<<<<< HEAD
          className={`mt-4 ${
            newCardErrors.description ? "border-red-500" : ""
          }`}
=======
          className={`mt-4 ${newCardErrors.description ? "border-red-500" : ""
            }`}
>>>>>>> 8153153255c5360b0a271a54212e5094728a3356
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
<<<<<<< HEAD
          
=======

>>>>>>> 8153153255c5360b0a271a54212e5094728a3356
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
export default Projects;
=======

export default Projects;






















>>>>>>> 8153153255c5360b0a271a54212e5094728a3356
