import React, { useState } from 'react';
import { Table, Dropdown, Menu, Select, Button, Modal, Input, DatePicker, Form } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const StatusSheet = () => {
    const [selectedUser, setSelectedUser] = useState(null); // State to track the selected user
    const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
    const [selectedProject, setSelectedProject] = useState(null); // Track selected project in modal
    const [selectedColumn, setSelectedColumn] = useState(null); // Track selected column in modal

    // Sample data for the table
    const [dataSource, setDataSource] = useState([
        {
            key: '1',
            projectName: 'Project Alpha',
            columnName: 'To Do',
            taskName: 'Design mockups',
            estimatedTime: '5h',
            utilizedTime: '3h',
            status: 'In Progress',
        },
        {
            key: '2',
            projectName: 'Project Beta',
            columnName: 'In Progress',
            taskName: 'Develop landing page',
            estimatedTime: '8h',
            utilizedTime: '4h',
            status: 'Pending',
        },
    ]);

    const handleStatusChange = (value, record) => {
        const newData = dataSource.map((item) => {
            if (item.key === record.key) {
                return { ...item, status: value };
            }
            return item;
        });
        setDataSource(newData);
    };

    // Table columns definition
    const columns = [
        {
            title: 'Project Name',
            dataIndex: 'projectName',
            key: 'projectName',

        },
        {
            title: 'Column Name',
            dataIndex: 'columnName',
            key: 'columnName',

        },
        {
            title:'Assigned Date',
            dataIndex:'assignedDate',
            key:'assignedDate',
        },
        {
            title: 'Task Name',
            dataIndex: 'taskName',
            key: 'taskName',
        },
        {
            title: 'Estimated Time',
            dataIndex: 'estimatedTime',
            key: 'estimatedTime',
        },
        {
            title: 'Utilized Time',
            dataIndex: 'utilizedTime',
            key: 'utilizedTime',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <Select
                    value={record.status}
                    onChange={(value) => handleStatusChange(value, record)}
                    style={{ width: 120 }}
                >
                    <Option value="Pending">Pending</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Completed">Completed</Option>
                </Select>
            ),
        },
    ];

    // User selection dropdown menu
    const userMenu = (
        <Menu onClick={(e) => setSelectedUser(e.key)}>
            <Menu.Item key="User 1">User 1</Menu.Item>
            <Menu.Item key="User 2">User 2</Menu.Item>
            <Menu.Item key="User 3">User 3</Menu.Item>
        </Menu>
    );

    // Modal handlers
    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleOk = () => {
        // Handle submit logic here
        setIsModalVisible(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Dropdown for selecting users */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                {selectedUser && (
                    <Button style={{ marginRight: '10px' }} type="primary" onClick={showModal}>
                        <PlusOutlined /> Add Task
                    </Button>
                )}
                <Dropdown overlay={userMenu}>
                    <Button>
                        Select User <DownOutlined />
                    </Button>
                </Dropdown>
            </div>

            {/* Table */}
            <div style={{ margin: '0 auto', maxWidth: '95%' }}>
                <Table dataSource={dataSource} columns={columns} />
            </div>

            {/* Ant Design Modal */}
            <Modal
                title="Add New Task"
                visible={isModalVisible}
                onCancel={handleCancel}
                onOk={handleOk}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>
                        Submit
                    </Button>,
                ]}
            >
                <Form layout="vertical">
                    {/* Row 1: Select Project and Select Column */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item label="Select Project" name="project" style={{ flex: 1 }} rules={[{ required: true, message: 'Please select a project' }]}>
                            <Select placeholder="Select a project" onChange={(value) => setSelectedProject(value)}>
                                <Option value="Project Alpha">Project Alpha</Option>
                                <Option value="Project Beta">Project Beta</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Select Column" name="column" style={{ flex: 1 }} rules={[{ required: true, message: 'Please select a column' }]}>
                            <Select placeholder="Select a column" onChange={(value) => setSelectedColumn(value)}>
                                <Option value="Pending">Pending</Option>
                                <Option value="In Progress">In Progress</Option>
                                <Option value="Completed">Completed</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Row 2: Card Title and Assigned Email */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item label="Card Title" name="title" style={{ flex: 1 }} rules={[{ required: true, message: 'Please enter the task title' }]}>
                            <Input placeholder="Enter task title" />
                        </Form.Item>

                        <Form.Item label="Assigned (Email)" name="assignedEmail" style={{ flex: 1 }} rules={[{ required: true, message: 'Please enter the assigned email' }]}>
                            <Input placeholder="Enter email" />
                        </Form.Item>
                    </div>

                    {/* Row 3: Start Date - End Date and Estimated Hours */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item label="Start Date - End Date" name="dateRange" style={{ flex: 1 }} rules={[{ required: true, message: 'Please select the date range' }]}>
                            <RangePicker />
                        </Form.Item>

                        <Form.Item label="Estimated Hours" name="estimatedHours" style={{ flex: 1 }} rules={[{ required: true, message: 'Please enter the estimated hours' }]}>
                            <Input placeholder="Enter estimated hours" />
                        </Form.Item>
                    </div>

                    {/* Row 4: Card Description */}
                    <Form.Item label="Card Description" name="description" rules={[{ required: true, message: 'Please enter the card description' }]}>
                        <TextArea placeholder="Enter card description" rows={4} />
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
};

export default StatusSheet;
