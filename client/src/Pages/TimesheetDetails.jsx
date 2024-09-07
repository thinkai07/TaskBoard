import React, { useState } from 'react';
import { Form, Input, Row, Col, Button, DatePicker, Table } from 'antd';

const TimesheetDetails = () => {
    const [timesheetData, setTimesheetData] = useState({
        employeeName: '',
        employeeId: '',
        department: '',
        teamLead: '',
        weekStartDate: '',
        weekEndDate: '',
    });
    //added
    const [tableData, setTableData] = useState([]); // Store table rows data
    const [isEditing, setIsEditing] = useState(true);

    //added
    const handleAddRow = () => {
        // Add an empty row to the table for editing
        const newRow = {
            key: tableData.length, // Unique key for each row
            day: '',
            taskName: '',
            taskDescription: '',
            startTime: '',
            endTime: '',
            breakHours: '',
            totalHoursWorked: '',
            notes: '',
            isEditable: true,
        };
        setTableData([...tableData, newRow]);
    };

    //added
    const handleSaveDraft = () => {
        // Set all rows to non-editable when "Save Draft" is clicked
        const updatedData = tableData.map((row) => ({
            ...row,
            isEditable: false, // Disable edit mode for all rows
        }));
        setTableData(updatedData);
        setIsEditing(false); // Disable the edit mode globally
        console.log('Saved Draft:', updatedData);
    };

    //added
    const handleRowChange = (index, key, value) => {
        const newData = [...tableData];
        newData[index][key] = value; // Update the specific row and column
        setTableData(newData);
    };

    //added
    const columns = [
        {
            title: 'Days',
            dataIndex: 'day',
            key: 'day',
            render: (text, record, index) => (
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'day', e.target.value)}
                        placeholder="Enter day"
                    />
                ) : (
                    <span>{text}</span> // Non-editable text after saving
                )
            ),
        },
        {
            title: 'Task Name',
            dataIndex: 'taskName',
            key: 'taskName',
            render: (text, record, index) => (
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'taskName', e.target.value)}
                        placeholder="Enter task name"
                    />
                ) : (
                    <span>{text}</span>
                )
            ),
        },
        {
            title: 'Task Description',
            dataIndex: 'taskDescription',
            key: 'taskDescription',
            render: (text, record, index) => (
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'taskDescription', e.target.value)}
                        placeholder="Enter task description"
                    />
                ) : (
                    <span>{text}</span>
                )
            ),
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (text, record, index) => (
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'startTime', e.target.value)}
                        placeholder="Enter start time"
                    />
                ) : (
                    <span>{text}</span>
                )
            ),
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (text, record, index) => (
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'endTime', e.target.value)}
                        placeholder="Enter end time"
                    />
                ) : (
                    <span>{text}</span>
                )
            ),
        },
        {
            title: 'Break Hours',
            dataIndex: 'breakHours',
            key: 'breakHours',
            render: (text, record, index) => (
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'breakHours', e.target.value)}
                        placeholder="Enter break hours"
                    />
                ) : (
                    <span>{text}</span>
                )
            ),
        },
        {
            title: 'Total Hours Worked',
            dataIndex: 'totalHoursWorked',
            key: 'totalHoursWorked',
            render: (text, record, index) => (
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'totalHoursWorked', e.target.value)}
                        placeholder="Enter total hours worked"
                    />
                ) : (
                    <span>{text}</span>
                )
            ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            render: (text, record, index) => (
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'notes', e.target.value)}
                        placeholder="Enter notes"
                    />
                ) : (
                    <span>{text}</span>
                )
            ),
        },
    ];


    const handleInputChange = (name, value) => {
        setTimesheetData({
            ...timesheetData,
            [name]: value,
        });
    };



    const handleSubmit = () => {
        console.log(timesheetData);
        // Save the form data or perform any action you need
    };



    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Enter Timesheet</h1>
            <Form onFinish={handleSubmit} layout="vertical">
                <Row gutter={16}>
                    {/* Employee Name */}
                    <Col span={12}>
                        <Form.Item
                            label="Employee Name"
                            name="employeeName"
                            rules={[{ required: true, message: 'Please enter employee name!' }]}
                            style={{ width: '60%' }}
                        >
                            <Input
                                value={timesheetData.employeeName}
                                onChange={(e) => handleInputChange('employeeName', e.target.value)}
                                placeholder="Enter Employee Name"
                            />
                        </Form.Item>
                    </Col>
                    {/* Employee ID */}
                    <Col span={12}>
                        <Form.Item
                            label="Employee ID"
                            name="employeeId"
                            rules={[{ required: true, message: 'Please enter employee ID!' }]}
                            style={{ width: '60%' }}
                        >
                            <Input
                                value={timesheetData.employeeId}
                                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                placeholder="Enter Employee ID"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* Department */}
                    <Col span={12}>
                        <Form.Item
                            label="Department"
                            name="department"
                            rules={[{ required: true, message: 'Please enter department!' }]}
                            style={{ width: '60%' }}
                        >
                            <Input
                                value={timesheetData.department}
                                onChange={(e) => handleInputChange('department', e.target.value)}
                                placeholder="Enter Department"
                            />
                        </Form.Item>
                    </Col>
                    {/* Team Lead */}
                    <Col span={12}>
                        <Form.Item
                            label="Team Lead"
                            name="teamLead"
                            rules={[{ required: true, message: 'Please enter team lead!' }]}
                            style={{ width: '60%' }}
                        >
                            <Input
                                value={timesheetData.teamLead}
                                onChange={(e) => handleInputChange('teamLead', e.target.value)}
                                placeholder="Enter Team Lead"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* Week Start Date */}
                    <Col span={12}>
                        <Form.Item
                            label="Week Start Date"
                            name="weekStartDate"
                            rules={[{ required: true, message: 'Please select week start date!' }]}
                            style={{ width: '60%' }}
                        >
                            <DatePicker
                                onChange={(date, dateString) => handleInputChange('weekStartDate', dateString)}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    {/* Week End Date */}
                    <Col span={12}>
                        <Form.Item
                            label="Week End Date"
                            name="weekEndDate"
                            rules={[{ required: true, message: 'Please select week end date!' }]}
                            style={{ width: '60%' }}
                        >
                            <DatePicker
                                onChange={(date, dateString) => handleInputChange('weekEndDate', dateString)}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>



                <Row gutter={16}>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button type="primary" htmlType="button" onClick={handleAddRow} style={{ marginRight: '8px', backgroundColor: 'green' }}>
                            Add Row
                        </Button>
                        <Button type="primary" htmlType="button" onClick={handleSaveDraft} style={{ marginRight: '8px' }}>
                            Save Draft
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Col>
                </Row>
            </Form>



            {/* Ant Design Table */}
            <Table
                dataSource={tableData}
                columns={columns}
                pagination={false}
                style={{ marginTop: '20px' }}
                rowKey="key"
            />
        </div>
    );
};

export default TimesheetDetails;
