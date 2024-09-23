import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Dropdown, Menu, Select, Button, Modal, Input, DatePicker, Form } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { server } from '../constant';
import moment from 'moment';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const StatusSheet = () => {
   
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [dataSource, setDataSource] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);

    const [selectedColumn, setSelectedColumn] = useState(null);

    const [tasks, setTasks] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [organizationId, setOrganizationId] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [form] = Form.useForm(); // Add this line to create the form instance
    const [assignedEmail, setAssignedEmail] = useState('');
    const [selectedUserName, setSelectedUserName] = useState('');
    const [userProjects, setUserProjects] = useState([]);
    const [tableData, setTableData] = useState('');
    const [userEmail, setUserEmail] = useState("");

    // Fetch user role, organization ID, and createdBy email, then fetch users for the organization
    useEffect(() => {
        const fetchUserRoleAndOrganization = async () => {
            try {
                const roleResponse = await axios.get(`${server}/api/role`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUserRole(roleResponse.data.role);
                setOrganizationId(roleResponse.data.organizationId);

                // Fetch users based on organization ID
                const usersResponse = await axios.get(`${server}/api/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUsers(usersResponse.data.users);

                // Fetch createdBy from user API
                const userResponse = await axios.get(`${server}/api/user`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setCreatedBy(userResponse.data.user.email);

                // Fetch projects based on organizationId
                const projectsResponse = await axios.get(`${server}/api/organization/${roleResponse.data.organizationId}/projects`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setProjects(projectsResponse.data.projects);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchUserRoleAndOrganization();
    }, []);

    // Fetch cards assigned to the selected user
    const fetchUserCards = async (userId) => {
        try {
            const response = await axios.get(`${server}/api/cards/user/${userId}`);

            const modifiedData = response.data.map((card) => ({
                key: card._id, // Assuming each card has an '_id'
                projectName: card.project?.name || "N/A",
                columnName: card.task?.name || "N/A",
                assignedDate: card.assignDate ? new Date(card.assignDate).toLocaleDateString() : "N/A", // Format date for UI
                taskName: card.name || "N/A", // Map 'name' to 'taskName'
                estimatedHours: card.estimatedHours || "N/A",
                utilizedHours: card.utilizedHours || "N/A",
                status: card.status || "N/A",
            }));

            // console.log("Modified data for table:", modifiedData); // Log the modified data for debugging

            setDataSource(modifiedData); // Update table with the modified cards data

            // Extract unique projects by their IDs
            const uniqueProjects = response.data.reduce((acc, card) => {
                const project = card.project;
                if (project && !acc.find(p => p._id === project._id)) {
                    acc.push({ _id: project._id, name: project.name });
                }
                return acc;
            }, []);

            setProjects(uniqueProjects); // Set the unique projects for the selector
        } catch (error) {
            console.error("Error fetching cards:", error);
        }
    };

    // Fetch tasks based on selected project
    const fetchProjectTasks = async (projectId) => {
        try {
            const response = await axios.get(`${server}/api/projects/${projectId}/tasks`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setTasks(response.data.tasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    // Handle user selection
    const handleUserSelect = (userId) => {
        const selectedUser = users.find(user => user._id === userId);
        setSelectedUser(userId);
        setSelectedUserName(selectedUser.name); // Update user name
        setAssignedEmail(selectedUser.email); // Store selected user's email
        fetchUserCards(userId); // Fetch cards for the selected user

        // Set the email in the form
        form.setFieldsValue({ assignedEmail: selectedUser.email });
    };

    // Handle project selection
    const handleProjectSelect = (projectId) => {
        setSelectedProject(projectId);
        fetchProjectTasks(projectId); // Fetch tasks for the selected project
    };

    // Handle task selection in the form
    const handleTaskSelect = (taskId) => {
        setSelectedTask(taskId);
    };

    // Handle modal submit (adding a new task card)
    const handleOk = async (values) => {
        try {
            const cardData = {
                name: values.title,
                description: values.description,
                assignedTo: values.assignedEmail,
                assignDate: values.dateRange[0].format('YYYY-MM-DD'),
                dueDate: values.dateRange[1].format('YYYY-MM-DD'),
                createdBy,
                estimatedHours: values.estimatedHours,
            };

            // Use selectedTask from state
            await axios.post(`${server}/api/tasks/${selectedTask}/cards`, cardData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setIsModalVisible(false);
            fetchUserCards(selectedUser);
        } catch (error) {
            console.error("Error adding card:", error);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };




    //added
    const fetchUserEmail = async () => {
        try {
            const response = await axios.get(`${server}/api/user`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setUserEmail(response.data.user.email);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Use fetchUserEmail inside useEffect
    useEffect(() => {
        fetchUserEmail();
    }, []);




    // Handle status change
    const handleChangeStatus = async (cardId, newStatus) => {
        try {
            const updatedBy = userEmail; // Use the state value
            const updatedDate = new Date().toISOString();

            setDataSource((prevTasks) =>
                prevTasks.map((task) =>
                    task.key === cardId ? { ...task, status: newStatus } : task
                )
            );

            // Make the PUT request to update the status in the backend
            const response = await axios.put(`${server}/api/cards/${cardId}/status`, {
                status: newStatus,
                updatedBy,
                updatedDate,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });

            if (!response.status === 200) {
                throw new Error('Failed to update status');
            }

            const data = await response.json();
            // console.log('Status updated successfully:', data);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };
    // // Table columns definition
    // const columns = [
    //     {
    //         title: 'Project Name',
    //         dataIndex: 'projectName',
    //         key: 'projectName',
    //         render: (text) => (
    //             <div style={{ maxWidth: '100px', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
    //                 {text}
    //             </div>
    //         ),
    //     },
    //     {
    //         title: 'Column Name',
    //         dataIndex: 'columnName',
    //         key: 'columnName',
    //         render: (text) => (
    //             <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
    //                 {text}
    //             </div>
    //         )
    //     },
    //     {
    //         title: 'Assigned Date',
    //         dataIndex: 'assignedDate',
    //         key: 'assignedDate',
    //         render: (text) => (
    //             <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
    //                 {text}
    //             </div>
    //         )
    //     },
    //     {
    //         title: 'Task Name',
    //         dataIndex: 'taskName',
    //         key: 'taskName',
    //         render: (text) => (
    //             <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
    //                 {text}
    //             </div>
    //         )
    //     },
    //     {
    //         title: 'Estimated Hours',
    //         dataIndex: 'estimatedHours',
    //         key: 'estimatedHours',
    //         render: (text) => (
    //             <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
    //                 {text}
    //             </div>
    //         )
    //     },
    //     {
    //         title: 'Utilized Hours',
    //         dataIndex: 'utilizedHours',
    //         key: 'utilizedHours',
    //         render: (text) =>
    //         (
    //             <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
    //                 {text}
    //             </div>
    //         )
    //     },
    //     {
    //         title: 'Status',
    //         dataIndex: 'status',
    //         key: 'status',
    //         render: (status, record) => (
    //             <Select
    //                 defaultValue={status}
    //                 style={{ width: 120 }}
    //                 onChange={(value) => handleChangeStatus(record.key, value)}
    //                 disabled={userRole !== 'ADMIN'} // Disable for non-admin users
    //             >
    //                 <Option value="inprogress">In Progress</Option>
    //                 <Option value="completed">Completed</Option>
    //                 <Option value="pending">Pending</Option>
    //             </Select>
    //         ),
    //     }
    // ];
    const columns = [
        {
            title: 'Project Name',
            dataIndex: 'projectName',
            key: 'projectName',
            sorter: (a, b) => a.projectName.localeCompare(b.projectName), // Sort alphabetically
            sortDirections: ['ascend', 'descend'], // Add ascending and descending options
            render: (text) => (
                <div style={{ maxWidth: '100px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Column Name',
            dataIndex: 'columnName',
            key: 'columnName',
            sorter: (a, b) => a.columnName.localeCompare(b.columnName),
            sortDirections: ['ascend', 'descend'],
            render: (text) => (
                <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap' }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Assigned Date',
            dataIndex: 'assignedDate',
            key: 'assignedDate',
            sorter: (a, b) => new Date(a.assignedDate) - new Date(b.assignedDate), // Sort by date
            sortDirections: ['ascend', 'descend'],
            render: (text) => (
                <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap' }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Task Name',
            dataIndex: 'taskName',
            key: 'taskName',
            sorter: (a, b) => a.taskName.localeCompare(b.taskName),
            sortDirections: ['ascend', 'descend'],
            render: (text) => (
                <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap' ,scrollbarWidth:'none'}}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Estimated Hours',
            dataIndex: 'estimatedHours',
            key: 'estimatedHours',
            sorter: (a, b) => a.estimatedHours - b.estimatedHours, // Sort numerically
            sortDirections: ['ascend', 'descend'],
            render: (text) => (
                <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap' }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Utilized Hours',
            dataIndex: 'utilizedHours',
            key: 'utilizedHours',
            sorter: (a, b) => a.utilizedHours - b.utilizedHours,
            sortDirections: ['ascend', 'descend'],
            render: (text) => (
                <div style={{ maxWidth: '100px', overflow: 'auto', whiteSpace: 'nowrap',scrollbarWidth:'none' }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            sortDirections: ['ascend', 'descend'],
            render: (status, record) => (
                <Select
                    defaultValue={status}
                    style={{ width: 120 }}
                    onChange={(value) => handleChangeStatus(record.key, value)}
                    disabled={userRole !== 'ADMIN'}
                >
                    <Option value="inprogress">In Progress</Option>
                    <Option value="completed">Completed</Option>
                    <Option value="pending">Pending</Option>
                </Select>
            ),
        },
    ];

    const disabledDate = (current) => {
        // Disable dates before today
        return current && current < moment().startOf('day');
      };
      // Custom validation to ensure end date is after the start date
  const validateDateRange = (rule, value) => {
    if (!value || value.length !== 2) {
      return Promise.reject('Please select the date range');
    }
    const [start, end] = value;
    if (end.isBefore(start)) {
      return Promise.reject('End date cannot be before start date');
    }
    return Promise.resolve();
  };


    // User selection dropdown menu
    const userMenu = (
        <Menu onClick={(e) => handleUserSelect(e.key)}>
            {users.map((user) => (
                <Menu.Item key={user._id}>
                    {user.username}
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                {selectedUser && (
                    <Button style={{ marginRight: '10px' }} type="primary" onClick={() => setIsModalVisible(true)}>
                        <PlusOutlined /> Add Task
                    </Button>
                )}

                   <Dropdown overlay={userMenu}>
                    <Button style={{ width: '160px' }}>
                        {selectedUserName || 'Select User'} <DownOutlined />
                    </Button>
                </Dropdown>

            </div>

            {/* Table */}
            <div
                style={{ margin: '0 auto', maxWidth: '95%' }} className='dark'>
                {selectedUser ? (
                    <Table dataSource={dataSource} columns={columns} />
                ) : (
                    <p>Please select a user to view tasks.</p>
                )}
            </div>

            {/* Modal for adding new tasks */}
            <Modal
                title="Add New Task"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleOk}>
                    {/* Row 1: Select Project and Select Task */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item label="Select Project" name="project" style={{ flex: 1 }} rules={[{ required: true, message: 'Please select a project' }]}>
                            <Select placeholder="Select a project" onChange={handleProjectSelect}>
                                {projects.map((project) => (
                                    <Option key={project._id} value={project._id}>
                                        {project.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Select Column"
                            name="task"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Please select a task' }]}
                        >
                            <Select placeholder="Select a task" onChange={handleTaskSelect}>
                                {tasks.map((task) => (
                                    <Option key={task.id} value={task.id}>
                                        {task.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                    </div>

                    {/* Row 2: Card Title and Assigned Email */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item label="Task title" name="title" style={{ flex: 1 }} rules={[{ required: true, message: 'Please enter the task title' }]}>
                            <Input placeholder="Enter task title" />
                        </Form.Item>

                        <Form.Item label="Assigned (Email)" name="assignedEmail" style={{ flex: 1 }} rules={[{ required: true, message: 'Please enter the assigned email' }]}>
                            <Input placeholder="Enter email"  disabled/>
                        </Form.Item>
                    </div>

                    {/* Row 3: Start Date - End Date and Estimated Hours */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                    <Form.Item
        label="Start Date - End Date"
        name="dateRange"
        style={{ flex: 1 }}
        rules={[
          { required: true, message: 'Please select the date range' },
          { validator: validateDateRange }
        ]}
      >
        <RangePicker 
          disabledDate={disabledDate} // Disable past dates
        />
      </Form.Item>

                        <Form.Item label="Estimated Hours" name="estimatedHours" style={{ flex: 1 }} rules={[{ required: true, message: 'Please enter the estimated hours' }]}>
                            <Input placeholder="Enter estimated hours" />
                        </Form.Item>
                    </div>

                    {/* Row 4: Description */}
                    <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please enter the task description' }]}>
                        <TextArea rows={3} placeholder="Enter task description" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Add Task
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StatusSheet;
