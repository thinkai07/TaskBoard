// TeamsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../constant";
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { Modal, notification, Button, Table, Input, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(""); // 'add' or 'edit'
    const [currentTeam, setCurrentTeam] = useState(null);
    const [teamName, setTeamName] = useState("");
    const [organizationId, setOrganizationId] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const handleDeleteTeam = (teamId) => {
        confirm({
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

    const columns = [
        {
            title: 'Team Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <a onClick={() => navigate(`/teams/${record._id}/members`, {
                    state: {
                        teamName: record.name,
                        teamId: record._id,
                        organizationId: organizationId
                    }
                })}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <span>
                    <Button type="link" icon={<FaEdit />} onClick={() => showModal('edit', record)}>
                        Edit
                    </Button>
                    <Button type="link" icon={<FaTrash />} onClick={() => handleDeleteTeam(record._id)} danger>
                        Delete
                    </Button>
                </span>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Button
                    type="primary"
                    icon={<FaPlus />}
                    onClick={() => showModal('add')}
                >
                    Create Team
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={teams}
                rowKey="_id"
                pagination={{ pageSize: 8 }}
            />
            <Modal
                title={modalType === 'add' ? 'Add Team' : 'Edit Team'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={modalType === 'add' ? 'Add' : 'Update'}
            >
                <Input
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default TeamsPage;
