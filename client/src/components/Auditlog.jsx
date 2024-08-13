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
    <div style={{ padding: "20px" }}>
    <Card bordered={false} style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title level={4} style={{ fontWeight: 600 }}> {/* Semi-bold font */}
          Audit Logs
        </Title>
        <Select
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
  );
};

export default AuditLog;