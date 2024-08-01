// // //Teamspage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../constant";
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { Modal, notification } from 'antd';
import { Link } from 'react-router-dom';
const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamError, setNewTeamError] = useState(false);
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

        fetchUserRoleAndOrganization();
        fetchTeams();
    }, [organizationId]);

    const handleAddTeam = () => {
        setIsAddingTeam(true);
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
            content: '',
            okText: 'Delete',
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
        return <p>Loading teams...</p>;
    }

    return (
        <div className="min-h-full bg-light-white rounded-3xl p-8 h-auto">
            <div className="flex justify-between items-center mb-4">
                <button
                    className="border border-blue-500 text-blue-500 py-2 px-4 rounded-full flex items-center hover:bg-blue-500 hover:text-white"
                    onClick={handleAddTeam}
                    disabled={isAddingTeam}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Create Team
                </button>
               
            </div>
            <div className="flex flex-wrap justify-start">
                {teams.map((team) => (
                    <Link
                        key={team._id}
                        to={`/teams/${team._id}/members`}
                        state={{
                            teamName: team.name,
                            teamId: team._id,
                            organizationId: organizationId
                        }}
                        className="bg-white rounded-3xl border-t-4 border-black relative shadow-xl p-6 m-4 w-72 cursor-pointer block"
                    >
                        <div className="relative group">
                            {editingTeamId === team._id ? (
                                <input
                                    type="text"
                                    value={editingTeamName}
                                    onChange={(e) => setEditingTeamName(e.target.value)}
                                    className="block w-full text-xl font-semibold mb-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                />
                            ) : (
                                <span className="block truncate max-w-[200px] text-xl font-semibold mb-2">
                                    {team.name}
                                </span>
                            )}
                            <div className="flex justify-between mt-2">
                                {editingTeamId === team._id ? (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevents the button click from triggering the card navigation
                                                handleSaveUpdatedTeam(team._id);
                                            }}
                                            className="text-green-500 hover:text-green-700 mr-4"
                                        >
                                            <FaSave className="inline mr-1" /> Save
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevents the button click from triggering the card navigation
                                                handleCancelUpdateTeam();
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <FaTimes className="inline mr-1" /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevents the button click from triggering the card navigation
                                                handleUpdateTeam(team._id, team.name);
                                            }}
                                            className="text-gray-500 hover:text-blue-700 mr-4"
                                        >
                                            <FaEdit className="inline mr-1" /> Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevents the button click from triggering the card navigation
                                                handleDeleteTeam(team._id);
                                            }}
                                            className="text-gray-500 hover:text-red-700"
                                        >
                                            <FaTrash className="inline mr-1" /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}

                {isAddingTeam && (
                    <div className="bg-white rounded-3xl border-t-4 border-black relative shadow-xl p-6 m-4 w-96">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="text"
                        >
                            Team Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter team name"
                            value={newTeamName}
                            onChange={(e) => {
                                setNewTeamName(e.target.value);
                                setNewTeamError(false);
                            }}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${newTeamError ? "border-red-500" : ""
                                }`}
                        />
                        {newTeamError && (
                            <span className="text-red-500 text-sm">This field is required</span>
                        )}
                        <div className="flex justify-between mt-4">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                onClick={handleSaveNewTeam}
                            >
                                Save
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                onClick={handleCancelNewTeam}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamsPage;