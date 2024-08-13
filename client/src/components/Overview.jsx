import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
=======
import { Pie,Bar,Doughnut } from 'react-chartjs-2';
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale, // Import CategoryScale
  LinearScale,
  BarElement
} from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { server } from '../constant';
import useTokenValidation from './UseTockenValidation';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { Button } from 'antd';

<<<<<<< HEAD

=======
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Overview = () => {
  useTokenValidation();
  const [userRole, setUserRole] = useState("");
  const [organizationId, setOrganizationId] = useState(null);
  const [overviewData, setOverviewData] = useState({
    totalProjects: 0,
    totalTasks: 0,
    totalMembers: 0,
    totalCards: 0,
    projects: []
  });
  const [users, setUsers] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [totalCardCount, setTotalCardCount] = useState(0);
  const [userCardCounts, setUserCardCounts] = useState({
<<<<<<< HEAD
    pending: 0,
    inprogress: 0,
    completed: 0
  });
=======
      pending: 0,
      inprogress: 0,
      completed: 0
    });
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
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
      axios.get(`${server}/api/overview/${organizationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(response => {
          console.log("Overview Data Response:", response.data);
          setOverviewData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the overview data!', error);
<<<<<<< HEAD

        });




      axios.get(`${server}/api/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(response => {
          console.log("Users Data Response:", response.data);
          setUsers(response.data.users);
        })
        .catch(error => {
          console.error('There was an error fetching the users!', error);
        });
    }
=======
       
       });
       
    
    

    axios.get(`${server}/api/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => {
        console.log("Users Data Response:", response.data);
        setUsers(response.data.users);
      })
      .catch(error => {
        console.error('There was an error fetching the users!', error);
      });
  }
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6

  }, [organizationId]);
  
  const handleUserChange = async (event) => {
    const userId = event.target.value;
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
          pending: counts['pending'] || 0,
          inprogress: counts['inprogress'] || 0,
          completed: counts['completed'] || 0,
        });
  
        // Render the bar chart when cards data changes
        setGroupedData(groupByMonthAndStatus(userCards));
        
      } catch (error) {
        console.error('Error fetching cards:', error);
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
          pending: counts['pending'] || 0,
          inprogress: counts['inprogress'] || 0,
          completed: counts['completed'] || 0,
        });

        // Render the bar chart when cards data changes
        setGroupedData(groupByMonthAndStatus(userCards));

      } catch (error) {
        console.error('Error fetching cards:', error);
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
      <Menu.Item key="">
        Select a user
      </Menu.Item>
      {users.map((user) => (
        <Menu.Item key={user._id}>
          {user.name}
        </Menu.Item>
      ))}
    </Menu>
  );






  // Calculate sums for the pie chart
  const totalCards = overviewData.projects.reduce((acc, project) => acc + project.totalCards, 0);
  const totalPendingCards = overviewData.projects.reduce((acc, project) => acc + project.totalPendingCards, 0);
  const totalInProgressCards = overviewData.projects.reduce((acc, project) => acc + project.totalInProgressCards, 0);
  const totalCompletedCards = overviewData.projects.reduce((acc, project) => acc + project.totalCompletedCards, 0);
  const noDataColor = '#e5e7eb';

  const data = {
<<<<<<< HEAD
    labels: ['Pending', 'In-Progress', 'Completed'],
=======
    labels: [ 'Pending', 'In-Progress', 'Completed'],
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
    datasets: [
      {
        label: 'Cards Overview',
        data: totalCards ? [totalPendingCards, totalInProgressCards, totalCompletedCards] : [1],
        backgroundColor: totalCards ? ['#f7665a', ' #efe152', '#10b981'] : [noDataColor], // Yellow for Pending, Orange for In Progress, Green for Completed
<<<<<<< HEAD
      }

=======
    }
    
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
<<<<<<< HEAD
          padding: 10,
=======
          padding: 20,
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
        },
      },
    },
  };

  const data1 = {
    labels: ['Pending', 'In-Progress', 'Completed'],
    datasets: [
      {
        label: 'User Cards Overview',
        data: totalCardCount ? [userCardCounts.pending, userCardCounts.inprogress, userCardCounts.completed] : [1],
        backgroundColor: totalCardCount ? ['#f7665a', ' #efe152', '#10b981'] : [noDataColor],
      },
    ],
  };


<<<<<<< HEAD

=======
  
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6

  const handleViewProjectTasks = (projectId) => {
    navigate(`/projects/${projectId}/view`);
  };

  // Function to group user cards by month and status for bar chart
  const groupByMonthAndStatus = (cards) => {
    const result = {};

    cards.forEach((card) => {
      const date = new Date(card.assignDate); // Use assignDate field
      const month = date.toLocaleString('default', { month: 'long' });
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

<<<<<<< HEAD

=======
  
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
  const barData = {
    labels: months,
    datasets: [
      {
        label: 'Pending',
        data: pendingData,
        backgroundColor: '#f7665a',
      },
      {
        label: 'In-Progress',
        data: inprogressData,
        backgroundColor: '#efe152',
      },
      {
        label: 'Completed',
        data: completedData,
        backgroundColor: '#10b981',
      },
    ],
  };

  const defaultDoughnutData = {
<<<<<<< HEAD
    labels: ['No Data'],
    datasets: [
      {
        data: [100],
        backgroundColor: ['#e2e8f0'], // Default color
      },
    ],
  };

  const defaultBarData = {
    labels: ['No Data'],
    datasets: [
      {
        label: 'No Data',
        data: [100],
        backgroundColor: '#e2e8f0', // Default color
      },
    ],
  };
=======
  labels: ['No Data'],
  datasets: [
    {
      data: [100],
      backgroundColor: ['#e2e8f0'], // Default color
    },
  ],
};

const defaultBarData = {
  labels: ['No Data'],
  datasets: [
    {
      label: 'No Data',
      data: [100],
      backgroundColor: '#e2e8f0', // Default color
    },
  ],
};
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
<<<<<<< HEAD
        position: 'bottom',
        pointStyle: 'circle',
          padding: 10,
        
=======
        position: 'top',
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
      },
      title: {
        display: true,
        text: 'User Card Status by Month',
      },
    },
  };
<<<<<<< HEAD


=======
  
  
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
  if (!overviewData.projects.length) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center', // Center horizontally
            alignItems: 'center', // Center vertically
            height: '100vh' // Full height of the viewport
        }}>
            <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '10px' }} />
            Loading...
        </div>
    );
}


  return (
<<<<<<< HEAD
    <div style={{ padding: '24px', backgroundColor: '#f7fafc', fontFamily: "'Open Sans', sans-serif" }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
        <div style={{ flex: 3 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '16px' }}>
              <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '15px', padding: '20px', textAlign: 'center', width: '200px', height: '130px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#4a5568' }}>Total Projects</h3>
                <p style={{ marginTop: '16px', fontSize: '36px', fontWeight: '700', color: '#3b82f6' }}>+{overviewData.totalProjects}</p>
              </div>
              <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '15px', padding: '20px', textAlign: 'center', width: '200px', height: '130px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#4a5568' }}>Total Members</h3>
                <p style={{ marginTop: '16px', fontSize: '36px', fontWeight: '700', color: '#3b82f6' }}>+{overviewData.totalMembers}</p>
              </div>
              <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '15px', padding: '20px', textAlign: 'center', width: '200px', height: '130px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#4a5568' }}>Total Tasks</h3>
                <p style={{ marginTop: '16px', fontSize: '36px', fontWeight: '700', color: '#3b82f6' }}>+{overviewData.totalCards}</p>
              </div>
              <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '15px', padding: '20px', textAlign: 'center', width: '200px', height: '130px' }}>
                <Pie data={data} options={options} />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#4a5568', marginBottom: '16px' }}>Project Details</h3>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ maxHeight: '330px', overflowY: 'auto', scrollbarWidth: "none" }}>
                  <table style={{ width: '100%', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'Open Sans', sans-serif",fontSize:"12px" }}>
                    <thead className="sticky top-0 z-10 bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Project Name</th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Project Members</th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Total Tasks</th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Pending Tasks</th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-left">In-Progress Tasks</th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Completed Tasks</th>
                        <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewData.projects.map((project, index) => (
                        <tr
                          key={index}
                          style={{ backgroundColor: index % 2 === 0 ? '#f7fafc' : 'white', cursor: 'pointer' }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#edf2f7'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f7fafc' : 'white'}
                        >
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.name}</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.projectMembers.length}</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalCards}</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalPendingCards}</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalInProgressCards}</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalCompletedCards}</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                            <Button
                              type="primary"
                              style={{ padding: '4px 12px', borderRadius: '8px' }}
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
=======
    <div style={{ padding: '24px', backgroundColor: '#f7fafc',fontWeight:"600px" }}>
    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
      <div style={{ flex: 3 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '16px' }}>
            <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '24px', padding: '10px', textAlign: 'center', width: '200px', height: '150px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600px', color: '#4a5568' }}>Total Projects</h3>
              <p style={{ marginTop: '16px', fontSize: '36px', fontWeight: '700', color: '#3b82f6' }}>+{overviewData.totalProjects}</p>
            </div>
            <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '24px', padding: '10px', textAlign: 'center', width: '200px', height: '150px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600px', color: '#4a5568' }}>Total Members</h3>
              <p style={{ marginTop: '16px', fontSize: '36px', fontWeight: '700', color: '#3b82f6' }}>+{overviewData.totalMembers}</p>
            </div>
            <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '24px', padding: '10px', textAlign: 'center', width: '200px', height: '150px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600px', color: '#4a5568' }}>Total Tasks</h3>
              <p style={{ marginTop: '16px', fontSize: '36px', fontWeight: '700', color: '#3b82f6' }}>+{overviewData.totalCards}</p>
            </div>
            <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '24px', padding: '10px', textAlign: 'center', width: '200px', height: '150px' }}>
              <Pie data={data} options={options} />
            </div>
          </div>
          <div style={{ marginTop: '16px',marginBottom:'16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#4a5568', marginBottom: '16px' }}>Project Details</h3>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ maxHeight: '370px', overflowY: 'auto', scrollbarWidth: "none" }}>
              <table style={{ width: '100%', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight:"600px" }}>
  <thead className="top-0 z-10 sticky bg-gray-100">
    <tr>
      <th className="px-4 py-3 border-b-2 border-gray-200 text-left font-normal">Project Name</th>
      <th className="px-4 py-3 border-b-2 border-gray-200 text-left font-normal">Project Members</th>
      <th className="px-4 py-3 border-b-2 border-gray-200 text-left font-normal">Total Tasks</th>
      <th className="px-4 py-3 border-b-2 border-gray-200 text-left font-normal">Pending Tasks</th>
      <th className="px-4 py-3 border-b-2 border-gray-200 text-left font-normal">In-Progress Tasks</th>
      <th className="px-4 py-3 border-b-2 border-gray-200 text-left font-normal">Completed Tasks</th>
      <th className="px-4 py-3 border-b-2 border-gray-200 text-left font-normal">Action</th>
    </tr>
  </thead>
  <tbody>
    {overviewData.projects.map((project, index) => (
      <tr
        key={index}
        style={{ backgroundColor: index % 2 === 0 ? '#f7fafc' : 'white', cursor: 'pointer' }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#edf2f7'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f7fafc' : 'white'}
      >
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.name}</td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.projectMembers.length}</td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalCards}</td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalPendingCards}</td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalInProgressCards}</td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalCompletedCards}</td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <button
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '8px' }}
            onClick={() => handleViewProjectTasks(project.id)}
          >
            View
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
              </div>
            </div>
          </div>
        </div>
<<<<<<< HEAD
        <div style={{ flex: 1.2, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#4a5568' }}>User Details</h3>
            <Dropdown overlay={menu} trigger={['click']}>
              <a onClick={e => e.preventDefault()} style={{

                padding: '8px', fontSize: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', width: "200px", textAlign: "left", position: "relative"
              }}>
                <span className='mr-2 ,w-24'>
                  {selectedUser ? users.find(user => user._id === selectedUser)?.name : 'Select a user'} <DownOutlined style={{ position: 'absolute', right: '8px' }} />
                </span>
              </a>

            </Dropdown>
            {/* <Dropdown overlay={menu} trigger={['click']}>
    <a onClick={e => e.preventDefault()} className="flex items-center p-2 text-lg border border-gray-300 rounded-lg">
      <span className="mr-2">
        {selectedUser ? users.find(user => user._id === selectedUser)?.name : 'Select a user'}
      </span>
      <DownOutlined />
    </a>
</Dropdown> */}

          </div>

          <div style={{ marginBottom: '40px' }}>
            <Doughnut data={selectedUser ? data1 : defaultDoughnutData} options={options} />
          </div>
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#4a5568' }}>Bar plot</h3>
            <Bar data={selectedUser ? barData : defaultBarData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>


  );
};

export default Overview;
=======
      </div>
      <div style={{ flex: 1.2, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600px', color: '#4a5568' }}>User Details</h3>
          <select
            onChange={handleUserChange}
            value={selectedUser || ''}
            style={{ padding: '8px', fontSize: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '110px' }}>
          <Doughnut data={selectedUser ? data1 : defaultDoughnutData} options={options} />
        </div>
        <div style={{ marginTop: '16px',height:'300px' }}>
         
          <Bar data={selectedUser ? barData : defaultBarData} options={barOptions} />
        </div>
      </div>
    </div>
  </div>

  
  );
};

export default Overview;
>>>>>>> f5006441aad4b7f5f174bc5593d81e9d42ca6fb6
