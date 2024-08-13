<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { server } from "../constant";
import useTokenValidation from "./UseTockenValidation";
import { MdOutlineCancel } from "react-icons/md";
import {
  Calendar as AntCalendar,
  Badge,
  Button,
  Modal,
  Select,
  InputNumber,
  Table,
  Tooltip,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const { Option } = Select;
=======
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { server } from '../constant';
import useTokenValidation from './UseTockenValidation';
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6

const Calendar = () => {
  useTokenValidation();
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const navigate = useNavigate();

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
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRoleAndOrganization();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!organizationId) return;

      try {
        const response = await axios.get(
          `${server}/api/calendar/${organizationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [organizationId]);

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf("month").day();

  const datesArray = [...Array(daysInMonth)].map((_, index) =>
    currentMonth.date(index + 1).format("YYYY-MM-DD")
  );

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const handleDateClick = (date) => {
    const eventsForSelectedDate = events.filter(
      (event) => dayjs(event.date).format("YYYY-MM-DD") === date
    );
    if (eventsForSelectedDate.length > 0) {
      setSelectedDate(date);
      setShowModal(true);
      setSelectedEvents(eventsForSelectedDate);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const handleChangeMonth = (value) => {
    setCurrentMonth(currentMonth.month(value));
  };

  const handleChangeYear = (value) => {
    setCurrentMonth(currentMonth.year(value));
  };

  const generateDots = (eventsForDay) => {
    const statusCounts = {
      completed: 0,
      pending: 0,
      inprogress: 0,
    };

    eventsForDay.forEach((event) => {
      if (statusCounts.hasOwnProperty(event.status)) {
        statusCounts[event.status]++;
      }
    });

    return (
      <>
        {statusCounts.completed > 0 && (
          <Tooltip title={`${statusCounts.completed} completed card(s)`}>
            <span
              className="inline-block w-2 h-2 rounded-full mr-1 bg-green-500"
            ></span>
          </Tooltip>
        )}
        {statusCounts.inprogress > 0 && (
          <Tooltip title={`${statusCounts.inprogress} in-progress card(s)`}>
            <span
              className="inline-block w-2 h-2 rounded-full mr-1 bg-yellow-500"
            ></span>
          </Tooltip>
        )}
        {statusCounts.pending > 0 && (
          <Tooltip title={`${statusCounts.pending} pending card(s)`}>
            <span
              className="inline-block w-2 h-2 rounded-full mr-1 bg-orange-500"
            ></span>
          </Tooltip>
        )}
      </>
    );
  };

  const handleViewProjectTasks = (projectId) => {
    navigate(`/projects/${projectId}/view`);
  };

  const columns = [
    { title: "Project Name", dataIndex: "projectName", key: "projectName" },
    { title: "Task Name", dataIndex: "taskName", key: "taskName" },
    { title: "Column Name", dataIndex: "cardName", key: "cardName" },
    { title: "Assigned To", dataIndex: "assignedTo", key: "assignedTo" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleViewProjectTasks(record.projectId)}>
          View
        </Button>
      ),
    },
  ];

  return (
<<<<<<< HEAD
    <div className="p-4 text-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Calendar</h2>
      <div className="fixed bottom-12 right-12 flex flex-row space-x-2 pr-[30%] pt-6 pb-24 justify-center">
        <div className="flex justify items-center space-x-2 ">
          <div className="w-2 h-2 bg-orange-500 rounded-full "></div>
          <span className="text-black">Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-black">In Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-black">Completed</span>
        </div>
      </div>

      <div className="flex justify-between mb-4 items-center">
        <Button
          icon={<LeftOutlined />}
          onClick={handlePrevMonth}
          className="mr-2"
        />
        <Select
          className="mx-2"
          value={currentMonth.month()}
          onChange={handleChangeMonth}
          style={{ width: 120 }}
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <Option key={index} value={index}>
              {dayjs().month(index).format("MMMM")}
            </Option>
          ))}
        </Select>
        <InputNumber
          min={2000}
          max={2100}
          value={currentMonth.year()}
          onChange={handleChangeYear}
          className="mx-2"
        />
        <Button
          icon={<RightOutlined />}
          onClick={handleNextMonth}
        />
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
=======
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Calendar</h2>
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Previous
          </button>
          <select
            className="mx-4 border px-2 py-1"
            value={currentMonth.month()}
            onChange={handleChangeMonth}
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index} value={index}>
                {dayjs().month(index).format("MMMM")}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="border px-2 py-1"
            value={currentMonth.year()}
            onChange={(e) => handleChangeYear(e)}
          />
        </div>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-blue-600">
            {day}
          </div>
        ))}
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <div key={index}></div>
        ))}
        {datesArray.map((date) => {
          const formattedDate = dayjs(date).format("YYYY-MM-DD");
          const isToday = formattedDate === dayjs().format("YYYY-MM-DD");
          const eventsForDay = events.filter(
            (event) => dayjs(event.date).format("YYYY-MM-DD") === formattedDate
          );
          const hasEvents = eventsForDay.length > 0;
<<<<<<< HEAD
          

          return (
            <div
              key={formattedDate}
              className={`border p-2 rounded-lg ${
                isToday ? "bg-blue-100" : "bg-white"
              } shadow-md hover:bg-blue-200 cursor-pointer`}
              onClick={() => handleDateClick(formattedDate)}
              title={hasEvents ? "" : "No tasks on this date"}
            >
              <div
                className={`font-medium ${
                  isToday ? "text-blue-600" : "text-gray-800"
                }`}
              >
                {dayjs(date).format("D")}
=======

          return (
            <div key={formattedDate} className={`border p-2 rounded-lg ${isToday ? 'bg-blue-100' : 'bg-white'} shadow-md`} onClick={() => handleDateClick(formattedDate)}>
              <div className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                {dayjs(date).format('D')}
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
              </div>
              <div className="flex mt-1">{generateDots(eventsForDay)}</div>
            </div>
          );
        })}
      </div>
<<<<<<< HEAD
      <Modal
        visible={showModal}
        title={`Project Details for ${selectedDate}`}
        onCancel={handleModalClose}
        footer={null}
        width="80%"
      >
        <Table columns={columns} dataSource={selectedEvents} rowKey="id" />
      </Modal>
=======

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center z-50 justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white w-3/4 h-3/4 p-8 rounded-lg shadow-lg overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Project, Column, and Card Details</h3>
            <p className="mb-4"><strong>Date:</strong> {selectedDate}</p>
            <table className="table-auto w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f0f4f8",
                    color: "#333",
                    textAlign: "left",
                  }}
                >
                  <th
                    className="px-4 py-2"
                    style={{ borderBottom: "2px solid #ddd" }}
                  >
                    Project Name
                  </th>
                  <th
                    className="px-4 py-2"
                    style={{ borderBottom: "2px solid #ddd" }}
                  >
                    Column Name
                  </th>
                  <th
                    className="px-4 py-2"
                    style={{ borderBottom: "2px solid #ddd" }}
                  >
                    Task Name
                  </th>
                  <th
                    className="px-4 py-2"
                    style={{ borderBottom: "2px solid #ddd" }}
                  >
                    Assigned To
                  </th>
                  <th
                    className="px-4 py-2"
                    style={{ borderBottom: "2px solid #ddd" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-2"
                    style={{ borderBottom: "2px solid #ddd" }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedEvents.map((event) => (
                  <tr
                    key={event.id}
                    style={{
                      backgroundColor: event.id % 2 === 0 ? "#fff" : "#f9fafb",
                    }}
                  >
                    <td
                      className="border px-4 py-2"
                      style={{ borderBottom: "1px solid #ddd" }}
                    >
                      {event.projectName}
                    </td>
                    <td
                      className="border px-4 py-2"
                      style={{ borderBottom: "1px solid #ddd" }}
                    >
                      {event.taskName}
                    </td>
                    <td
                      className="border px-4 py-2"
                      style={{ borderBottom: "1px solid #ddd" }}
                    >
                      {event.cardName}
                    </td>
                    <td
                      className="border px-4 py-2"
                      style={{ borderBottom: "1px solid #ddd" }}
                    >
                      {event.assignedTo}
                    </td>
                    <td
                      className="border px-4 py-2"
                      style={{ borderBottom: "1px solid #ddd" }}
                    >
                      {event.status}
                    </td>
                    <td
                      className="border px-4 py-2"
                      style={{ borderBottom: "1px solid #ddd" }}
                    >
                      <button
                        style={{
                          backgroundColor: "#3b82f6",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "8px",
                          transition: "background-color 0.3s",
                        }}
                        onClick={() => handleViewProjectTasks(event.projectId)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
    </div>
  );
};

<<<<<<< HEAD
export default Calendar;
=======
export default Calendar;








>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
