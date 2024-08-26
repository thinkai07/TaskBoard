// CalendarDateDetails.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Table, Popover, Input, message } from "antd";
import axios from "axios";
import { server } from "../constant";

const CalendarDateDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { events } = location.state;
  const [activeCardId, setActiveCardId] = React.useState(null);
  const [logHoursVisible, setLogHoursVisible] = React.useState(false);
  const [loggedHours, setLoggedHours] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");

  React.useEffect(() => {
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
        const activeEvent = events.find(event => event.cardId === activeCardId);
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
        console.log(response.data.message);
        // Reset states
        setActiveCardId(null);
        setLogHoursVisible(false);
        setLoggedHours("");
        // Optionally, refresh the events data here
      } catch (error) {
        console.error("Error logging hours:", error);
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
    { title: "Project Name", dataIndex: "projectName", key: "projectName" },
    { title: "Task Name", dataIndex: "taskName", key: "taskName" },
    { title: "Column Name", dataIndex: "cardName", key: "cardName" },
    { title: "Assigned To", dataIndex: "assignedTo", key: "assignedTo" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
        title: "End Date",
        dataIndex: "endDate",
        key: "endDate",
        render: (date) => new Date(date).toLocaleDateString('en-GB')
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
  Project Details for {new Date(events[0]?.date).toLocaleDateString('en-GB')}
</h2>

      <Button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>Back to Calendar</Button>
      <Table columns={columns} dataSource={events} rowKey="id" />
    </div>
  );
};

export default CalendarDateDetails;