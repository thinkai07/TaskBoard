import React, { useEffect, useState } from "react";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale, // Import CategoryScale
  LinearScale,
  BarElement,
} from "chart.js";
import { server } from "../constant";
import useTokenValidation from "./UseTockenValidation";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Select } from "antd";
import { Button } from "antd";
import { AiOutlineProject } from "react-icons/ai";
import { FaSpinner, FaTasks } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Overview = () => {
  useTokenValidation();
  const [userRole, setUserRole] = useState("");
  const [organizationId, setOrganizationId] = useState(null);
  const [overviewData, setOverviewData] = useState({
    totalProjects: 0,
    totalTasks: 0,
    totalMembers: 0,
    totalCards: 0,
    projects: [],
  });
  const [users, setUsers] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [totalCardCount, setTotalCardCount] = useState(0);
  const [userCardCounts, setUserCardCounts] = useState({
    pending: 0,
    inprogress: 0,
    completed: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [cards, setCards] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRoleAndOrganization = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Role and Organization ID Response:", response.data);
        setUserRole(response.data.role);
        setOrganizationId(response.data.organizationId);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRoleAndOrganization();
  }, []);

  useEffect(() => {
    if (organizationId) {
      axios
        .get(`${server}/api/overview/${organizationId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          console.log("Overview Data Response:", response.data);
          setOverviewData(response.data);
        })
        .catch((error) => {
          console.error(
            "There was an error fetching the overview data!",
            error
          );
        });

      axios
        .get(`${server}/api/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          console.log("Users Data Response:", response.data);
          setUsers(response.data.users);
        })
        .catch((error) => {
          console.error("There was an error fetching the users!", error);
        });
    }
  }, [organizationId]);

  //added

  // const handleUserChange = async (event) => {
  //   const userId = event.target.value;
  //   setSelectedUser(userId);

  //   if (userId) {
  //     try {
  //       const response = await axios.get(`${server}/api/cards/user/${userId}`);
  //       const userCards = response.data;
  //       setCards(userCards);

  //       // Calculate card counts for the selected user
  //       const counts = userCards.reduce((acc, card) => {
  //         acc[card.status] = (acc[card.status] || 0) + 1;
  //         return acc;
  //       }, {});

  //       setTotalCardCount(userCards.length); // Total cards for the selected user
  //       setUserCardCounts({
  //         pending: counts['pending'] || 0,
  //         inprogress: counts['inprogress'] || 0,
  //         completed: counts['completed'] || 0,
  //       });

  //       // Render the bar chart when cards data changes
  //       setGroupedData(groupByMonthAndStatus(userCards));

  //     } catch (error) {
  //       console.error('Error fetching cards:', error);
  //     }
  //   } else {
  //     setCards([]);
  //     setUserCardCounts({
  //       pending: 0,
  //       inprogress: 0,
  //       completed: 0,
  //     });
  //     setTotalCardCount(0);
  //     setGroupedData({});
  //   }
  // };

  const handleMenuClick = async (e) => {
    const userId = e.key;
    setSelectedUser(userId);

    if (userId) {
      try {
        const response = await axios.get(`${server}/api/cards/user/${userId}`);
        const userCards = response.data;
        setCards(userCards);

        // Calculate card counts for the selected user
        const counts = userCards.reduce((acc, card) => {
          acc[card.status] = (acc[card.status] || 0) + 1;
          return acc;
        }, {});

        setTotalCardCount(userCards.length); // Total cards for the selected user
        setUserCardCounts({
          pending: counts["pending"] || 0,
          inprogress: counts["inprogress"] || 0,
          completed: counts["completed"] || 0,
        });

        // Render the bar chart when cards data changes
        setGroupedData(groupByMonthAndStatus(userCards));
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    } else {
      setCards([]);
      setUserCardCounts({
        pending: 0,
        inprogress: 0,
        completed: 0,
      });
      setTotalCardCount(0);
      setGroupedData({});
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick} style={{ width: "200px" }}>
      <Menu.Item key="">Select a user</Menu.Item>
      {users.map((user) => (
        <Menu.Item key={user._id}>{user.name}</Menu.Item>
      ))}
    </Menu>
  );

  // Calculate sums for the pie chart
  const totalCards = overviewData.projects.reduce(
    (acc, project) => acc + project.totalCards,
    0
  );
  const totalPendingCards = overviewData.projects.reduce(
    (acc, project) => acc + project.totalPendingCards,
    0
  );
  const totalInProgressCards = overviewData.projects.reduce(
    (acc, project) => acc + project.totalInProgressCards,
    0
  );
  const totalCompletedCards = overviewData.projects.reduce(
    (acc, project) => acc + project.totalCompletedCards,
    0
  );
  const noDataColor = "#e5e7eb";

  const data = {
    labels: ["Pending", "In-Progress", "Completed"],
    datasets: [
      {
        label: "Cards Overview",
        data: totalCards
          ? [totalPendingCards, totalInProgressCards, totalCompletedCards]
          : [1],
        backgroundColor: totalCards
          ? ["#f7665a", " #efe152", "#10b981"]
          : [noDataColor], // Yellow for Pending, Orange for In Progress, Green for Completed
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 10,
        },
      },
    },
  };

  const data1 = {
    labels: ["Pending", "In-Progress", "Completed"],
    datasets: [
      {
        label: "User Cards Overview",
        data: totalCardCount
          ? [
              userCardCounts.pending,
              userCardCounts.inprogress,
              userCardCounts.completed,
            ]
          : [1],
        backgroundColor: totalCardCount
          ? ["#f7665a", " #efe152", "#10b981"]
          : [noDataColor],
      },
    ],
  };

  const handleViewProjectTasks = (projectId) => {
    navigate(`/projects/${projectId}/view`);
  };

  // Function to group user cards by month and status for bar chart
  const groupByMonthAndStatus = (cards) => {
    const result = {};

    cards.forEach((card) => {
      const date = new Date(card.assignDate); // Use assignDate field
      const month = date.toLocaleString("default", { month: "long" });
      const status = card.status.toLowerCase();

      if (!result[month]) {
        result[month] = { pending: 0, inprogress: 0, completed: 0 };
      }

      result[month][status] = (result[month][status] || 0) + 1;
    });

    return result;
  };

  // Prepare data for bar chart
  const [groupedData, setGroupedData] = useState({});
  const months = Object.keys(groupedData);
  const pendingData = months.map((month) => groupedData[month].pending);
  const inprogressData = months.map((month) => groupedData[month].inprogress);
  const completedData = months.map((month) => groupedData[month].completed);

  // const barData = {
  //   labels: months,
  //   datasets: [
  //     {
  //       label: 'Pending',
  //       data: pendingData,
  //       backgroundColor: '#f7665a',

  //     },
  //     {
  //       label: 'In-Progress',
  //       data: inprogressData,
  //       backgroundColor: '#efe152',

  //     },
  //     {
  //       label: 'Completed',
  //       data: completedData,
  //       backgroundColor: '#10b981',

  //     },
  //   ],
  // };

  const barData = {
    labels: months,
    datasets: [
      {
        label: "Pending",
        data: pendingData,
        backgroundColor: "#f7665a",
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
      {
        label: "In-Progress",
        data: inprogressData,
        backgroundColor: "#efe152",
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
      {
        label: "Completed",
        data: completedData,
        backgroundColor: "#10b981",
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    ],
  };

  const defaultDoughnutData = {
    labels: ["No Data"],
    datasets: [
      {
        data: [100],
        backgroundColor: ["#e2e8f0"], // Default color
      },
    ],
  };

  const defaultBarData = {
    labels: ["No Data"],
    datasets: [
      {
        label: "No Data",
        data: [100],
        backgroundColor: "#e2e8f0", // Default color
      },
    ],
  };

  // const barOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'bottom',

  //     },
  //     title: {
  //       display: true,
  //       text: 'User Card Status by Month',
  //     },
  //   },
  // };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 20,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "User Card Status by Month",
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#e2e8f0",
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  };

  if (!overviewData.projects.length) {
    return (
      <div className="flex justify-center mt-80 items-center">
        {" "}
        <FaSpinner className="animate-spin" />
        <span className="items-center ml-2"> Loading...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "12px",
        backgroundColor: "#f7fafc",
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      <div className="flex justify-end">
      <Dropdown overlay={menu} trigger={["click"]} className="text-sm mb-2">
          <a
            onClick={(e) => e.preventDefault()}
            style={{
              padding: "8px",
              fontSize: "16px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              width: "230px",
              textAlign: "left",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              className="mr-2 text-sm"
              style={{
                whiteSpace: "nowrap",        // Prevents text from wrapping to the next line
                overflow: "hidden",          // Hides any overflowing text
                paddingRight: "24px",        // Ensures space for the dropdown icon
                textOverflow: "ellipsis",    // Adds ellipsis if text overflows
                maxWidth: "calc(100% - 30px)", // Takes full space except for the dropdown icon
              }}
            >
              {selectedUser
                ? users.find((user) => user._id === selectedUser)?.name
                : "Select a user"}
            </span>
            <DownOutlined style={{ position: "absolute", right: "8px" }} />
          </a>
        </Dropdown>
      </div>
      <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
        <div style={{ flex: 3 }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div className="flex justify-center gap-16">
              <div className="bg-[#D1E9FC] shadow-lg rounded-2xl p-5 text-center w-52 h-36 transition-transform duration-300 transform hover:scale-105 hover:shadow-xl">
                <span className="flex justify-center">
                  <span className="flex justify-center items-center text-xl bg-[#B5CFED] w-10 h-10 rounded-full">
                    <AiOutlineProject />
                  </span>
                </span>

                <p className="mt-3 text-3xl font-bold text-[#0B2268] flex flex-col">
                  +{overviewData.totalProjects}
                  <span className="text-[#0B2268] font-semibold text-xs">
                    Total Projects
                  </span>
                </p>
              </div>

              <div className="bg-[#FFE7D9] shadow-lg rounded-2xl p-5 text-center w-52 h-36 transition-transform duration-300 transform hover:scale-105 hover:shadow-xl">
                <span className="flex justify-center">
                  <span className="flex justify-center text-2xl w-10 h-10 items-center bg-[#F6CAC1] rounded-full">
                    <IoIosPeople color="#A14C60" />
                  </span>
                </span>
                <p className="mt-3 text-3xl font-bold text-[#A14C60] flex flex-col">
                  +{overviewData.totalMembers}
                  <span className="text-[#A14C60] font-semibold text-xs">
                    Total Members
                  </span>
                </p>
              </div>

              <div className="bg-[#FFF7CC] shadow-lg rounded-2xl p-5 text-center w-52 h-36 transition-transform duration-300 transform hover:scale-105 hover:shadow-xl">
                <span className="flex justify-center">
                  <span className="flex justify-center w-10 h-10 items-center bg-[#FAEEC0] text-xl rounded-full">
                    <FaTasks color="#9c8349" />
                  </span>
                </span>

                <p className="mt-3 text-3xl font-bold text-[#BAA065] flex flex-col">
                  +{overviewData.totalCards}
                  <span className="text-[#BAA065] font-semibold text-xs ml-2">
                    Total Tasks
                  </span>
                </p>
              </div>

              <div className="bg-[#D0F2FE] shadow-lg rounded-2xl p-3 text-center w-52 h-36 transition-transform duration-300 transform hover:scale-105 hover:shadow-xl">
                <Pie data={data} options={options} />
              </div>
            </div>

            <div
              // style={{ flex: 1.2, minWidth: "200px" }}
              className="flex flex-row justify-around mt-6"
            >
              <div className="shadow-md rounded-md w-[500px]   p-4">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: "600",
                      color: "#4a5568",
                    }}
                  >
                    User Details
                  </h3>
                </div>

                <div className="mt-4">
                  <Doughnut
                    data={selectedUser ? data1 : defaultDoughnutData}
                    options={options}
                  />
                </div>
              </div>

              <div className="shadow-md rounded-md w-[500px] h-60 p-4">
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: "600",
                    color: "#4a5568",
                  }}
                >
                  Bar plot
                </h3>
                <Bar
                  data={selectedUser ? barData : defaultBarData}
                  options={barOptions}
                />
              </div>
            </div>

            <div className="mt- p-4">
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  color: "#4a5568",
                  marginBottom: "16px",
                }}
              >
                Project Details
              </h3>
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    maxHeight: "330px",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontFamily: "'Open Sans', sans-serif",
                      fontSize: "12px",
                    }}
                  >
                    <thead className="sticky top-0 z-10 bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-gray-700 text-left">
                          Project Name
                        </th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-gray-700 text-left">
                          Project Members
                        </th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-gray-700 text-left">
                          Total Tasks
                        </th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-gray-700 text-left">
                          Pending Tasks
                        </th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-gray-700 text-left">
                          In-Progress Tasks
                        </th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-gray-700 text-left">
                          Completed Tasks
                        </th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-gray-700 text-left">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewData.projects.map((project, index) => (
                        <tr
                          key={index}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#f7fafc" : "white",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#edf2f7")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              index % 2 === 0 ? "#f7fafc" : "white")
                          }
                        >
                          <td
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {project.name}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {project.projectMembers.length}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {project.totalCards}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {project.totalPendingCards}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {project.totalInProgressCards}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {project.totalCompletedCards}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            <Button
                              type="primary"
                              style={{
                                padding: "4px 12px",
                                borderRadius: "8px",
                              }}
                              onClick={() => handleViewProjectTasks(project.id)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#4a5568', paddingTop: '40px' }}>Bar plot</h3>
            <Bar data={selectedUser ? barData : defaultBarData} options={barOptions} />
          </div> */}
    </div>
  );
};

export default Overview;
