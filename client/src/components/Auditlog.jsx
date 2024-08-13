import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../constant";
import useTokenValidation from "./UseTockenValidation";
import { Select, Table, Typography, Card } from "antd";

const { Option } = Select;
const { Title } = Typography;

const AuditLog = () => {
  useTokenValidation();
  const [selectedProject, setSelectedProject] = useState("");
  const [userRole, setUserRole] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [cards, setCards] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

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
      const projectsResponse = await axios.get(
        `${server}/api/projects/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProjects(projectsResponse.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchTasksAndCards = async (projectId) => {
    try {
      const tasksResponse = await axios.get(
        `${server}/api/projects/${projectId}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTasks(tasksResponse.data.tasks);

      // Fetch cards for all tasks
      const cardsPromises = tasksResponse.data.tasks.map((task) =>
        axios.get(`${server}/api/tasks/${task.id}/cards`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      );
      const cardsResponses = await Promise.all(cardsPromises);
      const allCards = cardsResponses.flatMap(
        (response) => response.data.cards
      );
      setCards(allCards);
    } catch (error) {
      console.error("Error fetching tasks and cards:", error);
    }
  };

  const fetchAuditLogs = async (projectId) => {
    try {
      const response = await axios.get(
        `${server}/api/projects/${projectId}/audit-logs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Sort logs by actionDate in descending order
      const sortedLogs = response.data.sort(
        (a, b) => new Date(b.actionDate) - new Date(a.actionDate)
      );
      setAuditLogs(sortedLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  const handleProjectChange = (value) => {
    setSelectedProject(value);
    if (value) {
      fetchTasksAndCards(value);
      fetchAuditLogs(value);
    } else {
      setTasks([]);
      setCards([]);
      setAuditLogs([]);
    }
  };

  const columns = [
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
      render: () =>
        projects.find((p) => p._id === selectedProject)?.name || "-",
    },
    {
      title: "Column Name",
      dataIndex: "columnName",
      key: "columnName",
      render: (_, log) =>
        log.entityType === "Task"
          ? tasks.find((t) => t.id === log.entityId)?.name ||
            `#${log.entityId.slice(-6)}`
          : "-",
    },
    {
      title: "Task Name",
      dataIndex: "taskName",
      key: "taskName",
      render: (_, log) =>
        log.entityType === "Card"
          ? cards.find((c) => c.id === log.entityId)?.name ||
            `#${log.entityId.slice(-6)}`
          : "-",
    },
    {
      title: "Action By",
      dataIndex: "performedBy",
      key: "performedBy",
      render: (text) => text || "-",
    },
    {
      title: "Activity Date",
      dataIndex: "actionDate",
      key: "actionDate",
      render: (text) => (text ? new Date(text).toLocaleDateString() : "-"),
    },
    {
      title: "Activity",
      dataIndex: "actionType",
      key: "actionType",
      render: (text) => text || "-",
    },
    {
      title: "Old Value",
      dataIndex: "oldValue",
      key: "oldValue",
      render: (_, log) =>
        log.changes.length > 0 ? JSON.stringify(log.changes[0].oldValue) : "-",
    },
    {
      title: "New Value",
      dataIndex: "newValue",
      key: "newValue",
      render: (_, log) =>
        log.changes.length > 0 ? JSON.stringify(log.changes[0].newValue) : "-",
    },
  ];

  return (
<<<<<<< HEAD
    <div style={{ padding: "20px" }}>
    <Card bordered={false} style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title level={4} style={{ fontWeight: 600 }}> {/* Semi-bold font */}
          Audit Logs
        </Title>
        <Select
=======
    <div className="h-auto text-md  p-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-4">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <select
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
          value={selectedProject}
          onChange={handleProjectChange}
          style={{ width: 200, fontWeight: 600  }}
          placeholder="Select a Project"
        >
          <Option value="" disabled>
            Select a Project
          </Option>
          {projects.map((project) => (
            <Option key={project._id} value={project._id}>
              {project.name}
            </Option>
          ))}
        </Select>
      </div>
<<<<<<< HEAD
    </Card>
  
    {selectedProject ? (
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={auditLogs.map((log) => ({
            ...log,
            key: log._id,
          }))}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    ) : (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Title level={5} style={{ color: "#888", fontWeight: 600 }}> {/* Semi-bold font */}
          No project selected. Please select a project.
        </Title>
      </div>
    )}
  </div>
=======

      {selectedProject ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Old Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {projects.find((p) => p._id === selectedProject)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.entityType === 'Task' ? tasks.find(t => t.id === log.entityId)?.name || 'Unknown Task' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.entityType === 'Card' 
                      ? cards.find(c => c.id === log.entityId)?.name || 'Unknown Card' 
                      : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.performedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.actionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.actionType}
                  </td>
                  <td className="px-6 py-4  text-sm text-gray-500">
                    {log.changes.length > 0 && (
                      <div>
                        {log.changes[0].field}:{" "}
                        {JSON.stringify(log.changes[0].oldValue)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4  text-sm text-gray-500">
                    {log.changes.length > 0 && (
                      <div>
                        {log.changes[0].field}:{" "}
                        {JSON.stringify(log.changes[0].newValue)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40">
          <p className="text-lg text-gray-600 font-semibold">
            No project selected. Please select a project.
          </p>
        </div>
      )}
    </div>
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
  );
};

export default AuditLog;