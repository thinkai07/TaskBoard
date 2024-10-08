import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Dropdown, Menu, Select, Button, Modal, Input, DatePicker, Form, notification, message, } from "antd";
import { DownOutlined, PlusOutlined, ExportOutlined, SearchOutlined, CalendarOutlined } from "@ant-design/icons";
import { server } from "../constant";
import moment from "moment";
import * as XLSX from 'xlsx';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const StatusSheet = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalStatus, setModalStatus] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [dataSource, setDataSource] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [tasks, setTasks] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [organizationId, setOrganizationId] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [form] = Form.useForm(); // Add this line to create the form instance
    const [assignedEmail, setAssignedEmail] = useState("");
    const [selectedUserName, setSelectedUserName] = useState("");
    const [userProjects, setUserProjects] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [tableData, setTableData] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [dateFilter, setDateFilter] = useState(null);
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [selectedUsersForExport, setSelectedUsersForExport] = useState([]);
    const showExportModal = () => {
        setIsExportModalVisible(true);
    };

    const [assignedDate, setAssignedDate] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");

    const handleDateChange = (date) => {
        setAssignedDate(date);
    };


    const handleStatusChange = (status) => {
        setModalStatus(status);
        setSelectedStatus(status);
    };

    const resetModalState = () => {
        // Store the current assignedTo value
        const currentAssignedTo = form.getFieldValue('assignedTo');

        // Reset all form fields
        form.resetFields();

        // Restore the assignedTo value
        form.setFieldsValue({
            assignedTo: currentAssignedTo
        });

        // Reset other state
        setRows([]);
        setShowSubmitButton(false);
        setIsModalVisible(false);
    };

    // Filter tasks based on the search input
    const filteredData = dataSource.filter((task) =>
        task.taskId.toString().toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleExportModalCancel = () => {
        setIsExportModalVisible(false);
        setSelectedUsersForExport([]);
        setAssignedDate(null);
        setModalStatus(""); // Clear the modal status when canceling
        setSelectedStatus(""); // Clear the selected status if needed for filtering
    };

    const handleUserSelectForExport = (selectedUserIds) => {
        setSelectedUsersForExport(selectedUserIds);
    };



    const exportToExcel = async () => {
        if (selectedUsersForExport.length === 0) {
            // If no users are selected, export data for all users
            try {
                const allUsersTasks = await Promise.all(
                    users.map(user => fetchTasksForUser(user.email))
                );

                const workbook = XLSX.utils.book_new();

                allUsersTasks.forEach((userData, index) => {
                    const worksheet = createWorksheet(userData);
                    XLSX.utils.book_append_sheet(workbook, worksheet, users[index].username);
                });

                const fileName = `all_users_tasks_${moment().format('YYYY-MM-DD')}.xlsx`;
                XLSX.writeFile(workbook, fileName);
                message.success("Exported tasks for all users successfully!");
            } catch (error) {
                console.error("Error exporting tasks:", error);
                message.error("Failed to export tasks");
            }
        } else {
            // Export data for selected users
            try {
                const selectedUsersTasks = await Promise.all(
                    selectedUsersForExport.map(userId => {
                        const user = users.find(u => u._id === userId);
                        return fetchTasksForUser(user.email);
                    })
                );

                const workbook = XLSX.utils.book_new();

                selectedUsersTasks.forEach((userData, index) => {
                    const user = users.find(u => u._id === selectedUsersForExport[index]);
                    const worksheet = createWorksheet(userData);
                    XLSX.utils.book_append_sheet(workbook, worksheet, user.username);
                });

                const fileName = `selected_users_tasks_${moment().format('YYYY-MM-DD')}.xlsx`;
                XLSX.writeFile(workbook, fileName);
                message.success("Exported tasks for selected users successfully!");
            } catch (error) {
                console.error("Error exporting tasks:", error);
                message.error("Failed to export tasks");
            }
        }

        setSelectedUsersForExport([]);
        setAssignedDate(null);
        setModalStatus(""); // Clear the modal status field
        setSelectedStatus(""); // Clear the selected status if needed for filtering

        handleExportModalCancel();
    };


    const createWorksheet = (data) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        // Define column widths (in characters)
        const colWidths = [
            { wch: 15 },  // taskId
            { wch: 30 },  // taskName
            { wch: 20 },  // projectName
            { wch: 20 },  // assignedBy
            { wch: 20 },  // assignedTo
            { wch: 15 },  // assignedDate
            { wch: 10 },  // estimatedHours
            { wch: 15 },  // status
        ];

        // Set column widths
        worksheet['!cols'] = colWidths;

        return worksheet;
    };
    const fetchTasksForUser = async (userEmail) => {
        try {
            const params = {
                assignedTo: userEmail,
                assignedDate: assignedDate,
            };

            if (selectedStatus) {
                params.status = selectedStatus; // Send selected status
            }

            const response = await axios.get(`${server}/tasks-with-details`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params,
            });

            return response.data.map((task) => ({
                taskId: task.id,
                taskName: task.name,
                projectName: task.projectName || "N/A",
                assignedBy: task.assignedBy || "N/A",
                assignedTo: task.TaskId?.assignedTo || "N/A",
                assignedDate: moment(task.TaskId?.assignedDate).format("YYYY-MM-DD"),
                estimatedHours: task.TaskId?.estimatedHours || "N/A",
                status: task.status,
            }));
        } catch (error) {
            console.error("Error fetching tasks for user:", error);
            return [];
        }
    };

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
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchUserRoleAndOrganization();
    }, []);

    // Fetch user role, organization ID, and projects
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const roleResponse = await axios.get(`${server}/api/role`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUserRole(roleResponse.data.role);
                const orgId = roleResponse.data.organizationId;
                setOrganizationId(orgId);

                // Fetch users based on organization ID
                const usersResponse = await axios.get(`${server}/api/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUsers(usersResponse.data.users);

                // Fetch projects using the new API endpoint
                await fetchProjects(orgId);

                // ... (keep other existing fetches if needed)
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
    }, []);

    // Handle user selection
    const handleUserSelect = (userId) => {
        const selectedUser = users.find((user) => user._id === userId);
        setSelectedUser(userId);
        setSelectedUserName(selectedUser.username); // Update user name
        setAssignedEmail(selectedUser.email); // Store selected user's email
        form.setFieldsValue({ assignedTo: selectedUser.email });
        fetchTasks(selectedUser.email);
        // Set the email in the form
        form.setFieldsValue({ assignedEmail: selectedUser.email });
    };

    // Handle project selection
    const handleProjectSelect = (projectId) => {
        setSelectedProject(projectId);
    };

    const handleOk = async (values) => {
        try {
            const { assignedTo, estimatedHours, assignedDate } = values;

            // Prepare tasks data
            const tasks = rows.map((_, index) => ({
                taskName: values[`taskName_${index}`],
                assignedBy: values[`assignedBy_${index}`],
                projectId: values[`projectName_${index}`],
            }));

            // Prepare the payload
            const payload = {
                taskDetailsData: {
                    assignedTo, // This is now the email address
                    assignedDate: assignedDate.toISOString(),
                    estimatedHours,
                },
                tasks,
            };

            const response = await axios.post(
                `${server}/tasks-with-details`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            message.success("Tasks created successfully!");
            resetModalState();
            form.resetFields(['estimatedHours', 'assignedDate']);
            resetFormExceptAssignedTo();
            setRows([]);
            setIsModalVisible(false);

            // Fetch updated tasks
            fetchTasks(assignedTo);
        } catch (error) {
            console.error("Error creating tasks:", error);
            message.error(
                "Failed to create tasks: " +
                (error.response?.data?.error || "Unknown error")
            );
        }
    };
    // const fetchTasks = async (assignedEmail) => {
    //     try {
    //         const response = await axios.get(${server}/tasks-with-details, {
    //             headers: {
    //                 Authorization: Bearer ${localStorage.getItem("token")},
    //             },
    //             params: {
    //                 assignedTo: assignedEmail, // Send selected user email as a query param
    //             },
    //         });

    //         const formattedData = response.data.map((task) => ({
    //             key: task._id,
    //             taskId: task.id,
    //             taskName: task.name,
    //             projectName: task.projectName || "N/A",
    //             assignedBy: task.assignedBy || "N/A",
    //             assignedTo: task.TaskId?.assignedTo || "N/A", // This should now be the email
    //             assignedDate: moment(task.TaskId?.assignedDate).format("YYYY-MM-DD"),
    //             estimatedHours: task.TaskId?.estimatedHours || "N/A",
    //             status: task.status,
    //         }));

    //         setDataSource(formattedData);
    //     } catch (error) {
    //         console.error("Error fetching tasks:", error);
    //         message.error("Failed to fetch tasks");
    //     }
    // };
    const fetchTasks = async (assignedEmail) => {
        try {
            const response = await axios.get(`${server}/tasks-with-details`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: {
                    assignedTo: assignedEmail,
                },
            });

            const formattedData = response.data.map((task) => ({
                key: task._id,
                taskId: task.id,
                taskDetailsId: task.taskDetailsId, // Add this line to include the TaskDetails ID
                taskName: task.name,
                projectName: task.projectName || "N/A",
                assignedBy: task.assignedBy || "N/A",
                assignedTo: task.TaskId?.assignedTo || "N/A",
                assignedDate: moment(task.TaskId?.assignedDate).format("YYYY-MM-DD"),
                estimatedHours: task.TaskId?.estimatedHours || "N/A",
                status: task.status,
            }));

            setDataSource(formattedData);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            message.error("Failed to fetch tasks");
        }
    };

    useEffect(() => {
        if (selectedUser) {
            fetchTasks(selectedUser.email);
        }
    }, [selectedUser]);

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
    const handleChangeStatus = async (taskId, newStatus) => {
        try {
            // Make the PUT request to update the status on the server
            const response = await fetch(`${server}/tasks-with-details/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: newStatus }), // Pass the new status
            });

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            const updatedTask = await response.json();

            // Update the local state (dataSource) directly after status change
            setDataSource((prevDataSource) =>
                prevDataSource.map((task) =>
                    task.key === taskId
                        ? { ...task, status: newStatus }  // Update the status for the matching task
                        : task // Keep other tasks unchanged
                )
            );

            message.success("Task status updated successfully");
        } catch (err) {
            console.error(err.message);
            message.error("Failed to update status");
        }
    };

    const resetFormExceptAssignedTo = () => {
        const assignedTo = form.getFieldValue('assignedTo');
        form.resetFields();
        form.setFieldsValue({ assignedTo });
    };



    const columns = [
        // {
        //     title: "Task id",
        //     dataIndex: "taskId",
        //     key: "taskId",
        //     sorter: (a, b) => a.projectName.localeCompare(b.projectName), // Sort alphabetically
        //     sortDirections: ["ascend", "descend"], // Add ascending and descending options
        //     render: (text) => (
        //         <div
        //             style={{ maxWidth: "100px", overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: 'none' }}
        //         >
        //             {text}
        //         </div>
        //     ),
        // },
        {
            title: "Task ID",
            dataIndex: "taskId",
            key: "taskId",
            sorter: (a, b) => a.taskId.localeCompare(b.taskId),
            sortDirections: ["ascend", "descend"],
            render: (text) => (
                <div style={{ maxWidth: "100px", overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: 'none' }}>
                    {text}
                </div>
            ),
        },
        {
            title: "TaskDetails ID",
            dataIndex: "taskDetailsId",
            key: "taskDetailsId",
            sorter: (a, b) => a.taskDetailsId.localeCompare(b.taskDetailsId),
            sortDirections: ["ascend", "descend"],
            render: (text) => (
                <div style={{ maxWidth: "100px", overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: 'none' }}>
                    {text}
                </div>
            ),
        },
        {
            title: "Project name",
            dataIndex: "projectName",
            key: "projectName",
            sorter: (a, b) => new Date(a.assignedDate) - new Date(b.assignedDate), // Sort by date
            sortDirections: ["ascend", "descend"],
            render: (text) => (
                <div
                    style={{ maxWidth: "100px", overflow: "auto", whiteSpace: "nowrap" }}
                >
                    {text}
                </div>
            ),
        },
        {
            title: "Task Name",
            dataIndex: "taskName",
            key: "taskName",
            sorter: (a, b) => a.taskName.localeCompare(b.taskName),
            sortDirections: ["ascend", "descend"],
            render: (text) => (
                <div
                    style={{
                        maxWidth: "100px",
                        overflow: "auto",
                        whiteSpace: "nowrap",
                        scrollbarWidth: "none",
                    }}
                >
                    {text}
                </div>
            ),
        },
        {
            title: "Assigned By",
            dataIndex: "assignedBy",
            key: "assignedBy",
            sortDirections: ["ascend", "descend"],
            render: (text) => (
                <div
                    style={{ maxWidth: "100px", overflow: "auto", whiteSpace: "nowrap" }}
                >
                    {text}
                </div>
            ),
        },
        {
            title: "Assigned To",
            dataIndex: "assignedTo",
            key: "assignedTo",
            sortDirections: ["ascend", "descend"],
            render: (text) => (
                <div
                    style={{ maxWidth: "100px", overflow: "auto", whiteSpace: "nowrap" }}
                >
                    {text}
                </div>
            ),
        },
        {
            title: "Assigned Date",
            dataIndex: "assignedDate",
            key: "assignedDate",
            sortDirections: ["ascend", "descend"],
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <DatePicker
                        value={dateFilter}
                        onChange={(date, dateString) => {
                            setDateFilter(date);
                            if (date) {
                                setSelectedKeys([dateString]);
                            } else {
                                setSelectedKeys([]);
                            }
                        }}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            type="primary"
                            onClick={() => {
                                confirm();
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filter
                        </Button>
                        <Button
                            onClick={() => {
                                clearFilters();
                                setDateFilter(null);
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            ),
            onFilter: (value, record) => {
                if (!dateFilter) return true;
                const recordDate = moment(record.assignedDate).format('YYYY-MM-DD');
                const filterDate = moment(value).format('YYYY-MM-DD');
                return recordDate === filterDate;
            },
            render: (text) => (
                <div style={{ maxWidth: "100px", overflow: "auto", whiteSpace: "nowrap" }}>
                    {text}
                </div>
            ),
            // Add a filtered icon indicator
            filterIcon: filtered => (
                <CalendarOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
            ),
        },
        {
            title: "Estimated Hours",
            dataIndex: "estimatedHours",
            key: "estimatedHours",
            sorter: (a, b) => a.estimatedHours - b.estimatedHours, // Sort numerically
            sortDirections: ["ascend", "descend"],
            render: (text) => (
                <div
                    style={{ maxWidth: "100px", overflow: "auto", whiteSpace: "nowrap" }}
                >
                    {text}
                </div>
            ),
        },

        {
            title: "Status",
            dataIndex: "status",
            key: "status",

            filters: [
                { text: "Pending", value: "Pending" },
                { text: "In Progress", value: "inprogress" },
                { text: "completed", value: "completed" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status, record) => {
                return (
                    <Select
                        value={status}
                        style={{ width: 120 }}
                        onChange={(value) => {
                            handleChangeStatus(record.key, value); // Call the function with the task ID and new status
                        }}
                        disabled={userRole !== "ADMIN"} // Only allow admins to change the status
                    >
                        <Option value="pending">Pending</Option>
                        <Option value="inprogress">In Progress</Option>
                        <Option value="completed">Completed</Option>
                    </Select>
                );
            },

        },
    ];

    const handleCreateProject = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${server}/projects`,
                {
                    name: newProjectName,
                    organizationId,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            message.success("Project created successfully!");
            setNewProjectName("");
            handleCreateProjectCancel();
            // Fetch updated projects list
            await fetchProjects(organizationId);
        } catch (error) {
            console.error("Error creating project:", error);
            message.error("Failed to create project");
        } finally {
            setLoading(false);
        }
    };
    const fetchProjects = async (orgId) => {
        try {
            const projectsResponse = await axios.get(
                `${server}/api/${orgId}/projects`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setProjects(projectsResponse.data);
        } catch (error) {
            console.error("Error fetching projects:", error);
            message.error("Failed to fetch projects");
        }
    };
    const userMenu = (
        <Menu onClick={(e) => handleUserSelect(e.key)}>
            {users.map((user) => (
                <Menu.Item key={user._id}>{user.username}</Menu.Item>
            ))}
        </Menu>
    );

    const [rows, setRows] = useState([]);
    const [isCreateProjectModalVisible, setCreateProjectModalVisible] =
        useState(false);
    const showCreateProjectModal = () => setCreateProjectModalVisible(true);
    const handleCreateProjectCancel = () => setCreateProjectModalVisible(false);

    const handleAddRow = () => {
        form
            .validateFields([
                `projectName_${rows.length - 1}`,
                `taskName_${rows.length - 1}`,
                `assignedBy_${rows.length - 1}`,
            ])
            .then(() => {
                // Add a new row if the current one is valid
                setRows([...rows, {}]);
                setShowSubmitButton(true); // Enable submit button
            })
            .catch(() => {
            });
    };

    const handleCancelRow = (index) => {
        form.resetFields([
            `projectName_${index}`,
            `taskName_${index}`,
            `assignedBy_${index}`,
        ]);
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);

        // Disable submit button if all rows are removed
        if (newRows.length === 0) {
            setShowSubmitButton(false);
        }
    };
    const handleModalClose = () => {
        resetFormExceptAssignedTo();
        setRows([]);
        setIsModalVisible(false);
        setShowSubmitButton(false); // Reset submit button visibility
        resetModalState();
    };

    return (
        <div style={{ padding: "20px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: selectedUser ? "space-between" : "flex-end", // Adjusts layout based on selectedUser
                    marginBottom: "10px",
                    alignItems: "center",
                }}
            >
                {selectedUser && (
                    <div style={{ flexGrow: 1 }}>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Search by Task ID"
                            style={{ width: "300px" }} // Search bar width
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                )}

                <div style={{ display: "flex", alignItems: "center" }}>
                    {userRole === "ADMIN" && selectedUser && (
                        <Button
                            style={{ marginRight: "10px" }}
                            type="primary"
                            onClick={() => setIsModalVisible(true)}
                        >
                            <PlusOutlined /> Add Task
                        </Button>
                    )}

                    {userRole === "ADMIN" && (
                        <Button
                            style={{ marginRight: "10px" }}
                            type="primary"
                            onClick={showExportModal}
                            icon={<ExportOutlined />}
                        >
                            Export Tasks
                        </Button>
                    )}

                    <Dropdown overlay={userMenu}>
                        <Button style={{ width: "160px" }}>
                            {selectedUserName || "Select User"} <DownOutlined />
                        </Button>
                    </Dropdown>
                </div>
            </div>

            <Modal
                title="Export Tasks"
                visible={isExportModalVisible}
                onCancel={handleExportModalCancel}
                footer={[
                    <Button key="cancel" onClick={handleExportModalCancel}>
                        Cancel
                    </Button>,
                    <Button
                        key="export"
                        type="primary"
                        onClick={exportToExcel}
                    >
                        Export
                    </Button>,
                ]}
            >
                <Form layout="vertical">
                    <Form.Item label="Select Users">
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Select users to export (leave empty to export all)"
                            onChange={handleUserSelectForExport}
                            optionFilterProp="children"
                            value={selectedUsersForExport}
                        >
                            {users.map((user) => (
                                <Option key={user._id} value={user._id}>
                                    {user.username}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Assigned Date">
                        <DatePicker
                            style={{ width: '100%' }}
                            onChange={handleDateChange}
                            format="YYYY-MM-DD"
                            value={assignedDate}
                        />
                    </Form.Item>

                    <Form.Item label="Status">
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Select status"
                            onChange={handleStatusChange}
                            value={modalStatus}
                        >
                            <Option value="">All</Option> {/* Option for all statuses */}
                            <Option value="Pending">Pending</Option>
                            <Option value="inprogress">In Progress</Option>
                            <Option value="completed">Completed</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>


            {/* Table */}
            <div style={{ margin: "0 auto" }} className="dark">
                {selectedUser ? (
                    <Table dataSource={filteredData} columns={columns} />
                ) : (
                    <p
                        style={{
                            margin: "0 auto",
                            maxWidth: "95%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "10vh",
                        }}
                    >
                        Please select a user to view tasks.
                    </p>
                )}
            </div>
            {/* Modal for adding new tasks */}
            <Modal
                title="Add New Task"
                visible={isModalVisible}
                onCancel={handleModalClose} // Use a custom close handler
                footer={null}
                width={800}
                bodyStyle={{ maxHeight: "500px", overflowY: "scroll", padding: "20px" }}
                className="rounded-lg shadow-lg"
            >
                <Form form={form} layout="vertical" onFinish={handleOk}>
                    {/* Assigned To, Estimated Hours, Assigned Date */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <Form.Item
                            label="Assigned To"
                            name="assignedTo"
                            rules={[{ required: true, message: 'Please enter the assigned email' }]}
                        >
                            <Input placeholder="Enter email" disabled />
                        </Form.Item>
                        <Form.Item
                            label="Estimated Hours"
                            name="estimatedHours"
                            rules={[
                                { required: true, message: "Please enter the estimated hours" },
                                {
                                    validator: (_, value) => {
                                        if (value && parseFloat(value) > 0) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Estimated hours must be greater than 0'));
                                    },
                                },
                            ]}
                            className="w-full"
                        >
                            <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                placeholder="Enter estimated hours"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Assigned Date"
                            name="assignedDate"
                            rules={[
                                { required: true, message: "Please select the assigned date" },
                            ]}
                            className="w-full"
                        >
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </div>

                    {/* Add Row Button */}
                    <Button
                        type="dashed"
                        onClick={() => {
                            form
                                .validateFields()
                                .then(() => {
                                    handleAddRow(); // Call handleAddRow only if validation passes
                                })
                                .catch((errorInfo) => {
                                    console.error("Validation Failed:", errorInfo);
                                });
                        }}
                        className="block w-full my-6"
                    >
                        + Add Task
                    </Button>

                    {/* Dynamically Added Rows */}
                    {rows.map((_, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-4 gap-3  items-center"
                        >
                            <Form.Item
                                label="Project Name"
                                name={`projectName_${index}`}
                                rules={[{ required: true, message: "Please select a project" }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Search or Create Project"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                    onSelect={handleProjectSelect}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Button
                                                type="link"
                                                onClick={showCreateProjectModal}
                                                className="w-full text-left"
                                            >
                                                + Create New Project
                                            </Button>
                                        </>
                                    )}
                                >
                                    {projects.map((project) => (
                                        <Option key={project._id} value={project._id}>
                                            {project.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Task Name"
                                name={`taskName_${index}`}
                                rules={[
                                    { required: true, message: "Please enter a task name" },
                                ]}
                            >
                                <Input placeholder="Enter task name" />
                            </Form.Item>

                            <Form.Item
                                label="Assigned By"
                                name={`assignedBy_${index}`}
                                rules={[{ required: true, message: "Please select assigner" }]}
                            >
                                <Select placeholder="Select an assigner">
                                    {users.map((user, userIndex) => (
                                        <Option key={`${user.id}`} value={user.email}>
                                            {user.username}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Button
                                type="primary"
                                danger
                                onClick={() => handleCancelRow(index)} // Add a handler to remove the row
                            >
                                Cancel
                            </Button>
                        </div>
                    ))}

                    {/* Submit Button */}
                    {/* <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full">
                            Submit
                        </Button>
                    </Form.Item> */}
                    {showSubmitButton && (
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full">
                                Submit
                            </Button>
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            {/* Create Project Modal */}
            <Modal
                title="Create New Project"
                visible={isCreateProjectModalVisible}
                onCancel={handleCreateProjectCancel}
                footer={[
                    <Button key="cancel" onClick={handleCreateProjectCancel}>
                        Cancel
                    </Button>,
                    <Button
                        key="create"
                        type="primary"
                        onClick={handleCreateProject}
                        loading={loading}
                    >
                        Create
                    </Button>,
                ]}
            >
                <Input
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)} // Update state on input change
                />
            </Modal>
        </div>
    );
};

export default StatusSheet;