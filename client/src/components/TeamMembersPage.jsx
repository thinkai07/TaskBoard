//teammemberspage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { server } from "../constant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";

const TeamMembersPage = () => {
  const location = useLocation();
  const { teamName, organizationId, teamId } = location.state || {};

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [addMemberError, setAddMemberError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(
          `${server}/api/organizations/${organizationId}/teams/${teamId}/users`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMembers(response.data.users || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching members:", error);
        setLoading(false);
      }
    };

    fetchMembers();
  }, [organizationId, teamId,members]);

  const handleEmailChange = async (event) => {
    setNewMemberEmail(event.target.value);
    if (event.target.value.length > 0) {
      try {
        const response = await axios.get(`${server}/api/users/search`, {
          params: { email: event.target.value ,fields: 'email status name',},
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEmailSuggestions(response.data.users || []);
      } catch (error) {
        console.error("Error fetching email suggestions:", error);
      }
    } else {
      setEmailSuggestions([]);
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await axios.post(
        `${server}/api/organizations/${organizationId}/teams/${teamId}/users`,
        { email: newMemberEmail, role: "USER" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.user) {
        setMembers((prevMembers) => [...prevMembers, response.data.user]);
      } else {
        console.error("Unexpected response format:", response);
      }
      setNewMemberEmail("");
      setEmailSuggestions([]);
      setAddMemberError(false);
    } catch (error) {
      console.error("Error adding member:", error);
      setAddMemberError(true);
    }
  };

  const openModal = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const handleDeleteMember = async () => {
    try {
      await axios.delete(
        `${server}/api/organizations/${organizationId}/teams/${teamId}/users/${selectedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: { removedBy: localStorage.getItem("userId") }, // Add removedBy info
        }
      );
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== selectedUserId));
      closeModal();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  if (loading) {
    return <p>Loading members...</p>;
  }

  return (
    <div className="min-h-full bg-light-white rounded-3xl p-8">
      <h1 className="text-2xl text-gray-500 font-semibold mb-4">
        Team Name: {teamName}
      </h1>

      <div className="flex items-start space-x-2">
        <div className="relative w-full">
          <div className="flex items-center space-x-2">
            <input
              type="email"
              placeholder="Enter member email"
              value={newMemberEmail}
              onChange={handleEmailChange}
              className={`shadow appearance-none border rounded-2xl w-96 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                addMemberError ? "border-red-500" : ""
              }`}
            />
            <button
              onClick={handleAddMember}
              className="bg-blue-500 text-white px-3 py-2 rounded-2xl"
            >
              Add
            </button>
          </div>
          {emailSuggestions.length > 0 && newMemberEmail.length > 0 && (
            <ul className="absolute z-10 w-96 bg-white border border-gray-300 mt-1 rounded-3xl shadow-lg max-h-60 overflow-auto">
              {emailSuggestions
        .filter((user) => user.status === 'VERIFIED') // Filter out users with 'UNVERIFY' status
        .map((user) =>  (
                <li
                  key={user.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setNewMemberEmail(user.email);
                    setEmailSuggestions([]);
                    setAddMemberError(false);
                  }}
                >
                  {user.email}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <table className="w-full bg-white mt-7 border-t-4 shadow-xl">
        <thead>
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td className="border px-4 py-2">{member.email}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(member.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Delete Confirmation"
        className="flex items-center justify-center fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-3xl p-6 w-96">
          <h2 className="text-xl font-semibold mb-4">Delete Confirmation</h2>
          <p className="mb-4">Are you want to delete this member?</p>
          <div className="flex justify-between">
            <button
              onClick={closeModal}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-2xl mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMember}
              className="bg-red-500 text-white px-4 py-2 rounded-2xl"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamMembersPage;