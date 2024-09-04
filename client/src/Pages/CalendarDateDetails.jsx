import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Table, Popover, Input, message } from "antd";
import axios from "axios";
import { server } from "../constant";

const CalendarDateDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [activeCardId, setActiveCardId] = useState(null);
    const [logHoursVisible, setLogHoursVisible] = useState(false);
    const [loggedHours, setLoggedHours] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [error, setError] = useState(false);
    const { organizationId, date } = useParams(); // Get date from URL

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
                console.log("projectid", response.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, [organizationId]);

    useEffect(() => {
        if (events.length > 0 && date) {
            const filtered = events.filter(event => {
                const eventDate = new Date(event.date).toLocaleDateString('en-GB');
                return eventDate === new Date(date).toLocaleDateString('en-GB');
            });
            setFilteredEvents(filtered);
        }
    }, [events, date]);

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
        setError(false);
    };

    const handleLogHours = async () => {
        if (loggedHours.trim() === "") {
            setError(true);
            return;
        }
    
        if (activeCardId && loggedHours) {
            const activeEvent = filteredEvents.find(event => event.cardId === activeCardId);
    
            // Calculate the total hours after logging the new hours
            const totalHours = activeEvent.utilizedHours + parseFloat(loggedHours);
    
            // Check if total utilized hours exceed estimated hours
            if (totalHours > activeEvent.estimatedHours) {
                message.error("Logged hours exceed the estimated hours.");
                return;
            }
    
            try {
                // Log the hours and update the status if necessary
                const response = await axios.post(
                    `${server}/api/log-hours`,
                    {
                        projectId: activeEvent.projectId,
                        taskId: activeEvent.taskId,
                        cardId: activeCardId,
                        hours: parseFloat(loggedHours),
                        loggedBy: userEmail,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
    
                // Update the local state to reflect the new status and utilized hours
                const updatedEvents = filteredEvents.map(event =>
                    event.cardId === activeCardId
                        ? {
                            ...event,
                            utilizedHours: totalHours,
                            status: response.data.cardStatus,
                        }
                        : event
                );
    
                setFilteredEvents(updatedEvents);
    
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
                onChange={(e) => {
                    setLoggedHours(e.target.value);
                    setError(false);
                }}
                style={{ marginBottom: '10px' }}
            />
            {error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                    Please enter the log hours.
                </div>
            )}
            <Button type="primary" onClick={handleLogHours}>
                Submit
            </Button>
        </div>
    );

    const columns = [
        {
            title: "Project Name", dataIndex: "projectName", key: "projectName",
            render: (text) => (
                <div style={{ maxWidth: '100px', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
                    {text}
                </div>
            ),
        },
        {
            title: "Task Name", dataIndex: "taskName", key: "taskName",
            render: (text) => (
                <div style={{ maxWidth: '100px', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
                    {text}
                </div>
            ),
        },
        {
            title: "Column Name", dataIndex: "cardName", key: "cardName",
            render: (text) => (
                <div style={{ maxWidth: '150px', overflow: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
                    <span className="truncate">{text}</span>
                </div>
            ),
        },

        {
            title: "Assigned To", dataIndex: "assignedTo", key: "assignedTo",
            render: (text) => (
                <div style={{ maxWidth: '150px', overflow: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
                    <span className="truncate">{text}</span>
                </div>
            ),
        },
        { title: "Status", dataIndex: "status", key: "status" },
        {
            title: "End Date",
            dataIndex: "endDate",
            key: "endDate",
            render: (date) => new Date(date).toLocaleDateString('en-In')
        },
        { title: "Estimated Hours", dataIndex: "estimatedHours", key: "estimatedHours" },
        { title: "Utilized Hours", dataIndex: "utilizedHours", key: "utilizedHours" },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <>
                    <Popover
                        content={<div style={{ width: '250px' }}>{logHoursContent}</div>}
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
                Project Details for {new Date(date).toLocaleDateString('en-GB')}
            </h2>

            <Button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>Back to Calendar</Button>
            <div className="overflow-x-auto">
                <Table
                    columns={columns}
                    dataSource={filteredEvents}
                    rowKey="id"
                />
            </div>
        </div>
    );
};

export default CalendarDateDetails;
