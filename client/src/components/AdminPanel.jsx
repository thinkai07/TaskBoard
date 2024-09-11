import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../constant";
import { Table, Button, Input, Modal, Select, message, Spin } from "antd";
import { AiOutlineCheckCircle } from "react-icons/ai";
import useTokenValidation from "./UseTockenValidation";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoIosSearch, IoMdPersonAdd } from "react-icons/io";

const AdminPanel = () => {
  useTokenValidation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("");  // New state for username
  const [employeeId, setEmployeeId] = useState("");  // New state for employeeId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${server}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data.users);
      setFilteredData(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserRole = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${server}/api/role`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserRole();
  }, []);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleAddUser = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError(null);

    if (!name.trim() || !username.trim() || !employeeId.trim()) {
      setError("Please enter a valid name, username, and employee ID.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (data.some((user) => user.email === email.trim())) {
      setError("Email is already registered.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${server}/api/addUser`,
        {
          name,
          email: email.trim(),
          role,
          username,  // Send username
          employeeId,  // Send employeeId
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData([...data, response.data.user]);
      setFilteredData([...data, response.data.user]);
      setName("");
      setEmail("");
      setRole("user");
      setUsername("");  // Reset username
      setEmployeeId("");  // Reset employeeId
      setIsModalOpen(false);
      message.success("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = (userId) => {
    setUserIdToDelete(userId);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteUser = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${server}/api/deleteUser/${userIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = data.filter((user) => user._id !== userIdToDelete);
      setData(updatedData);
      setFilteredData(updatedData);
      setIsConfirmModalOpen(false);
      setUserIdToDelete(null);
      message.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = data.filter(
      (user) =>
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.username.toLowerCase().includes(value)  // Include username in search
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      title: "Git username",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Username",
      dataIndex: "username",  // New column for username
      key: "username",
    },
    {
      title: "Employee ID",
      dataIndex: "employeeId",  // New column for employeeId
      key: "employeeId",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    ...(userRole === "ADMIN"
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
              <Button
                type="primary"
                danger
                onClick={() => confirmDeleteUser(record._id)}
              >
                Delete
              </Button>
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          height: "100vh", // Full height of the viewport
        }}
      >
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          style={{ marginRight: "10px" }}
        />
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 m-4 rounded-lg shadow-md">
      <div className="flex justify-end gap-10 mb-4">
        <Input
          placeholder="Search by name, email, or username"
          value={searchTerm}
          onChange={handleSearch}
          className="w-1/3"
          prefix={<IoIosSearch />}
        />
        {userRole === "ADMIN" && (
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Add User <IoMdPersonAdd size={18} />
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record._id}
        loading={loading}
        className="p-2"
      />

      <Modal
        title="Add User"
        visible={isModalOpen}
        onOk={handleAddUser}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
      >
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <Input
          placeholder="Git Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />
        <Input
          placeholder="Username"
          value={username}  // New input for username
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4"
        />
        <Input
          placeholder="Employee ID"
          value={employeeId}  // New input for employeeId
          onChange={(e) => setEmployeeId(e.target.value)}
          className="mb-4"
        />
      </Modal>

      <Modal
        title="Confirm Delete"
        visible={isConfirmModalOpen}
        onOk={handleDeleteUser}
        onCancel={() => setIsConfirmModalOpen(false)}
        confirmLoading={loading}
      >
        <p>
          Are you sure you want to delete this user? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
};

export default AdminPanel;
