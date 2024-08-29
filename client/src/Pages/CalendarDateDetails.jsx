// CalendarDateDetails.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Table, Popover, Input, message, Tooltip } from "antd";
import axios from "axios";
import { server } from "../constant";

const CalendarDateDetails = () => {
    const location = useLocation();  
    const navigate = useNavigate();
    const { events } = location.state;
    const [activeCardId, setActiveCardId] = useState(null);
    const [logHoursVisible, setLogHoursVisible] = useState(false);
    const [loggedHours, setLoggedHours] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [updatedEvents, setUpdatedEvents] = useState(events);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${server}/api/user`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (response.data.success) {
                    setUserEmail(response.data.user.email);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                message.error("Failed to fetch user data");
            }
        };

        fetchUserData();
    }, []);

    const handleViewProjectTasks = (projectId) => {
        navigate(`/projects/${projectId}/view`);
    };

    const handleStartLogging = (cardId) => {
        setActiveCardId(cardId);
        setLogHoursVisible(true);
    };



    const handleLogHours = async () => {
        if (activeCardId && loggedHours) {
            try {
                const activeEvent = updatedEvents.find(event => event.cardId === activeCardId);
                const response = await axios.post(
                    `${server}/api/log-hours`,
                    {
                        projectId: activeEvent.projectId,
                        taskId: activeEvent.taskId,
                        cardId: activeCardId,
                        hours: parseFloat(loggedHours),
                        loggedBy: userEmail
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                // Calculate new utilized hours
                const newUtilizedHours = activeEvent.utilizedHours + parseFloat(loggedHours);

                // Update the events array with the new utilized hours
                const newEvents = updatedEvents.map(event =>
                    event.cardId === activeCardId
                        ? { ...event, utilizedHours: newUtilizedHours }
                        : event
                );
                setUpdatedEvents(newEvents);

                // Reset states
                setActiveCardId(null);
                setLogHoursVisible(false);
                setLoggedHours("");
                message.success("Hours logged successfully");

            } catch (error) {
                console.error("Error logging hours:", error);
                message.error("Failed to log hours");
            }
        }
    };


    const logHoursContent = (
        <div>
            <Input
                placeholder="Enter hours"
                value={loggedHours}
                onChange={(e) => setLoggedHours(e.target.value)}
                style={{ marginBottom: '10px' }}
            />
            <Button type="primary" onClick={handleLogHours}>
                Submit
            </Button>
        </div>
    );

    const columns = [
        {
            title: "Project Name", dataIndex: "projectName", key: "projectName",
            render: (text) => (
                <Tooltip title={text}>
                    <span>{text.length > 14 ? `${text.slice(0, 14)}...` : text}</span>
                </Tooltip>
            ),
        },
        {
            title: "Task Name", dataIndex: "taskName", key: "taskName",
            render: (text) => (
                <Tooltip title={text}>
                    <span>{text.length > 14 ? `${text.slice(0, 14)}...` : text}</span>
                </Tooltip>
            ),
        },
        {
            title: "Column Name", dataIndex: "cardName", key: "cardName",
            render: (text) => (
                <Tooltip title={text}>
                    <span>{text.length > 14 ? `${text.slice(0, 14)}...` : text}</span>
                </Tooltip>
            ),
        },
        {
            title: "Assigned To", dataIndex: "assignedTo", key: "assignedTo",

        },
        { title: "Status", dataIndex: "status", key: "status" },
        {
            title: "End Date",
            dataIndex: "endDate",
            key: "endDate",
            render: (date) => new Date(date).toLocaleDateString('en-In')
        }
        ,
        { title: "Estimated Hours", dataIndex: "estimatedHours", key: "estimatedHours" },
        { title: "Utilized Hours", dataIndex: "utilizedHours", key: "utilizedHours" },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <>
                    <Popover
                        content={logHoursContent}
                        title="Log Hours"
                        trigger="click"
                        visible={logHoursVisible && activeCardId === record.cardId}
                        onVisibleChange={(visible) => !visible && setLogHoursVisible(false)}
                    >
                        <Button
                            type="primary"
                            onClick={() => handleStartLogging(record.cardId)}
                            style={{ backgroundColor: 'green' }}
                        >
                            Start
                        </Button>
                    </Popover>
                    <Button
                        type="primary"
                        onClick={() => handleViewProjectTasks(record.projectId)}
                        style={{ marginLeft: '10px' }}
                    >
                        View
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                Project Details for {new Date(updatedEvents[0]?.date).toLocaleDateString('en-GB')}
            </h2>

            <Button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>Back to Calendar</Button>
            <Table columns={columns} dataSource={updatedEvents} rowKey="id" />
        </div>
    );
};

export default CalendarDateDetails;