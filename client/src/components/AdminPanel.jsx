import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../constant";
import {
  Table,
  Button,
  Input,
  Modal,
  Select,
  message,
  Spin,
} from "antd";
import { AiOutlineCheckCircle } from "react-icons/ai";
import useTokenValidation from "./UseTockenValidation";



const AdminPanel = () => {
  useTokenValidation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
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

    if (!name.trim()) {
      setError("Please enter a valid name.");
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
        user.email.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

<<<<<<< HEAD
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
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
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        userRole === "ADMIN" && (
          <Button type="primary" danger onClick={() => confirmDeleteUser(record._id)}>
            Delete
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="p-4 m-4 bg-gray-100 rounded-lg shadow-md">
      <div className="flex justify-between mb-4">
        <Input
=======
  return (
    <div className="bg-white rounded-xl text-md overflow-hidden ">
      {successMessage && (
        <div className="flex justify-center items-center p-4 bg-green-100 w-96 text-green-800 rounded-2xl">
          <AiOutlineCheckCircle className="mr-2" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex justify-between p-4">
       
        <input
          type="text"
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearch}
          className="w-1/3"
        />
<<<<<<< HEAD
        {userRole === "ADMIN" && (
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Add User
          </Button>
        )}
      </div>
=======
         {userRole === "ADMIN" && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-2xl"
            onClick={() => setIsModalOpen(true)}
          >
            Add User
          </button>
        )}
      </div>
      <table className="min-w-full divide-y bg-gray-200 divide-gray-1000 ">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Role</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Status</th> {/* Add Status column */}
            {userRole === "ADMIN" && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-normal break-words max-w-xs">{item.name}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-normal break-words max-w-xs">{item.email}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{item.role}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{item.status}</td> {/* Display status */}
              {userRole === "ADMIN" && (
                <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-2xl" onClick={() => confirmDeleteUser(item._id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Add User
                    </h3>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => {
                          let inputValue = e.target.value;
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record._id}
        loading={loading}
      />

      <Modal
        title="Add User"
        visible={isModalOpen}
        onOk={handleAddUser}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
      >
        {error && (
          <div className="mb-4 text-red-600">{error}</div>
        )}
        <Input
          placeholder="Name"
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
      
      </Modal>

      <Modal
        title="Confirm Delete"
        visible={isConfirmModalOpen}
        onOk={handleDeleteUser}
        onCancel={() => setIsConfirmModalOpen(false)}
        confirmLoading={loading}
      >
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default AdminPanel;












