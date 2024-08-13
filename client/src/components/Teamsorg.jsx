// TeamsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../constant";
import { FaTrash, FaEdit, FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Modal, notification, Button, Card } from 'antd';
import { BsFillPencilFill } from "react-icons/bs";

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(""); // 'add' or 'edit'
    const [currentTeam, setCurrentTeam] = useState(null);
    const [teamName, setTeamName] = useState("");
    const [organizationId, setOrganizationId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingTeamId, setEditingTeamId] = useState(null);
    const [editingTeamName, setEditingTeamName] = useState("");



    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRoleAndOrganization = async () => {
            try {
                const response = await axios.get(`${server}/api/role`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setOrganizationId(response.data.organizationId);
            } catch (error) {
                console.error("Error fetching user role and organization:", error);
            }
        };

        fetchUserRoleAndOrganization();
    }, []);

    useEffect(() => {
        const fetchTeams = async () => {
            if (!organizationId) return;
            try {
                const response = await axios.get(`${server}/api/organizations/${organizationId}/teams`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setTeams(response.data.teams || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching teams:", error);
                setLoading(false);
            }
        };

        fetchTeams();
    }, [organizationId]);

    const showModal = (type, team = null) => {
        setModalType(type);
        setCurrentTeam(team);
        setTeamName(team ? team.name : "");
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        if (!teamName.trim()) {
            notification.error({
                message: 'Error',
                description: 'Team name cannot be empty.',
            });
            return;
        }

        if (modalType === 'add') {
            try {
                const addedBy = await fetchUserEmail();
                const response = await axios.post(
                    `${server}/api/organizations/${organizationId}/teams`,
                    { teamName: teamName.trim(), addedBy },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                setTeams((prevTeams) => [...prevTeams, response.data.team]);
                notification.success({
                    message: 'Success',
                    description: 'Team added successfully.',
                });
            } catch (error) {
                console.error("Error creating team:", error);
                notification.error({
                    message: 'Error',
                    description: 'There was an error creating the team.',
                });
            }
        } else if (modalType === 'edit') {
            try {
                const response = await axios.put(
                    `${server}/api/organizations/${organizationId}/teams/${currentTeam._id}`,
                    { teamName: teamName.trim() },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                setTeams(teams.map(team => team._id === currentTeam._id ? response.data.team : team));
                notification.success({
                    message: 'Success',
                    description: 'Team updated successfully.',
                });
            } catch (error) {
                console.error("Error updating team:", error);
                notification.error({
                    message: 'Error',
                    description: 'There was an error updating the team.',
                });
            }
        }

        setIsModalVisible(false);
        setTeamName("");
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setTeamName("");
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

    // const handleSaveNewTeam = async () => {
    //     if (!newTeamName.trim()) {
    //         setNewTeamError(true);
    //         return;
    //     }

    //     try {
    //         const addedBy = await fetchUserEmail();

    //         const response = await axios.post(
    //             `${server}/api/organizations/${organizationId}/teams`,
    //             { teamName: newTeamName.trim(), addedBy: addedBy },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //                 },
    //             }
    //         );

    //         const newTeam = response.data.team;
    //         setTeams((prevTeams) => [...prevTeams, newTeam]);
    //         setIsAddingTeam(false);
    //         setNewTeamName("");
    //         setNewTeamError(false);
    //     } catch (error) {
    //         console.error("Error creating team:", error);
    //         setNewTeamError(true);
    //     }
    // };


    const handleSaveNewTeam = async () => {
        if (!newTeamName.trim()) {
            setNewTeamError(true);
            return;
        }

        try {
            const addedBy = await fetchUserEmail();

            const response = await axios.post(
                `${server}/api/organizations/${organizationId}/teams`,
                { teamName: newTeamName.trim(), addedBy: addedBy },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const newTeam = response.data.team;
            setTeams((prevTeams) => [...prevTeams, newTeam]);
            setIsAddingTeam(false);
            setNewTeamName("");
            setNewTeamError(false);
        } catch (error) {
            console.error("Error creating team:", error);
            setNewTeamError(true);
        }
    };

    const handleCancelNewTeam = () => {
        setIsAddingTeam(false);
        setNewTeamName("");
        setNewTeamError(false);
    };

    const handleDeleteTeam = async (teamId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this team?',
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await axios.delete(`${server}/api/organizations/${organizationId}/teams/${teamId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    setTeams(teams.filter(team => team._id !== teamId));
                    notification.success({
                        message: 'Team Deleted',
                        description: 'The team has been successfully deleted.',
                    });
                } catch (error) {
                    console.error("Error deleting team:", error);
                    notification.error({
                        message: 'Error',
                        description: 'There was an error deleting the team.',
                    });
                }
            },
        });
    };

    const handleUpdateTeam = (teamId, teamName) => {
        setEditingTeamId(teamId);
        setEditingTeamName(teamName);
    };

    const handleSaveUpdatedTeam = async (teamId) => {
        if (!editingTeamName.trim()) {
            return;
        }

        try {
            const response = await axios.put(
                `${server}/api/organizations/${organizationId}/teams/${teamId}`,
                { teamName: editingTeamName.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const updatedTeam = response.data.team;
            setTeams(teams.map(team => team._id === teamId ? updatedTeam : team));
            setEditingTeamId(null);
            setEditingTeamName("");
        } catch (error) {
            console.error("Error updating team:", error);
        }
    };




    const handleCancelUpdateTeam = () => {
        setEditingTeamId(null);
        setEditingTeamName("");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <Button
                    type="primary"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition"
                    onClick={handleAddTeam}
                    disabled={isAddingTeam}
                >
                    <FaPlus className="inline mr-2" /> Create Team
                </Button>
            </div>
            <div className="flex flex-wrap justify-start mx-12">
                {teams.map((team) => (
                    <div key={team._id} className="w-1/4 p-2">
                        <Card
                            hoverable
                            className="border border-gray-300 shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl"
                            onClick={() => {
                                if (editingTeamId !== team._id) {
                                    navigate(`/teams/${team._id}/members`, {
                                        state: {
                                            teamName: team.name,
                                            teamId: team._id,
                                            organizationId: organizationId
                                        }
                                    });
                                }
                            }}
                        >
                            <div className="relative">
                                {editingTeamId === team._id ? (
                                    <input
                                        type="text"
                                        value={editingTeamName}
                                        onChange={(e) => setEditingTeamName(e.target.value)}
                                        className="block w-full text-xl font-semibold mb-4 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                        onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking on input
                                    />
                                ) : (
                                    <span className="block text-xl font-semibold mb-4 cursor-pointer truncate">
                                        {team.name}
                                    </span>
                                )}
                                <div className="flex justify-between" onClick={(e) => e.stopPropagation()}> {/* Prevent navigation when clicking on buttons */}
                                    {editingTeamId === team._id ? (
                                        <>
                                            <button
                                                onClick={() => handleSaveUpdatedTeam(team._id)}
                                                className="text-green-500 hover:text-green-600 transition"
                                            >
                                                <FaSave className="inline mr-2" /> Save
                                            </button>
                                            <button
                                                onClick={handleCancelUpdateTeam}
                                                className="text-gray-500 hover:text-gray-600 transition"
                                            >
                                                <FaTimes className="inline mr-2" /> Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Button type="text"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUpdateTeam(team._id, team.name);
                                                }}
                                                className="text-blue-500 hover:text-blue-600 transition"
                                            >
                                                <BsFillPencilFill className="inline " /> Edit
                                            </Button>
                                            <Button type="text"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTeam(team._id);
                                                }}
                                                className="text-red-500 bg-transparent"
                                            >
                                                <FaTrash className="inline mr-2 " /> Delete
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
                {isAddingTeam && (
                    <div className="w-1/4 p-4">
                        <Card className="rounded-3xl border border-gray-300 shadow-lg overflow-hidden">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamName">
                                Team Name
                            </label>
                            <input
                                type="text"
                                id="teamName"
                                placeholder="Enter team name"
                                value={newTeamName}
                                onChange={(e) => {
                                    setNewTeamName(e.target.value);
                                    setNewTeamError(false);
                                }}
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${newTeamError ? "border-red-500" : "border-gray-300"}`}
                            />
                            {newTeamError && (
                                <span className="text-red-500 text-sm">This field is required</span>
                            )}
                            <div className="flex justify-between mt-4">
                                <button
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-blue-600 transition"
                                    onClick={handleSaveNewTeam}
                                >
                                    Save
                                </button>
                                <button
                                    className="bg-gradient-to-r from-gray-600 to-gray-500 text-white px-4 py-2 rounded-md hover:from-gray-700 hover:to-gray-600 transition"
                                    onClick={handleCancelNewTeam}
                                >
                                    Cancel
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamsPage;






















