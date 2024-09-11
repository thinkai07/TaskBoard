//timesheetdetails.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, Button, DatePicker, Table, message } from 'antd';
import axios from 'axios';
import { server } from '../constant';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';

const TimesheetDetails = () => {
    const { timesheetId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [timesheetData, setTimesheetData] = useState({
        id: null,
        employeeName: '',
        employeeId: '',
        department: '',
        teamLead: '',
        weekStartDate: null,
        weekEndDate: null,
    });
    const [tableData, setTableData] = useState([]);
    const [isFormDisabled, setIsFormDisabled] = useState(false);

    useEffect(() => {
        const fetchTimesheetData = async () => {
            try {
                const response = await axios.get(`${server}/api/timesheets/${timesheetId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (response.data.success) {
                    const fetchedTimesheet = response.data.timesheet;
                    const newTimesheetData = {
                        id: fetchedTimesheet._id,
                        employeeName: fetchedTimesheet.employeeName,
                        employeeId: fetchedTimesheet.employeeID,
                        department: fetchedTimesheet.department,
                        teamLead: fetchedTimesheet.teamLeadName,
                        weekStartDate: moment(fetchedTimesheet.weekStartDate),
                        weekEndDate: moment(fetchedTimesheet.weekEndDate),
                    };
                    setTimesheetData(newTimesheetData);
                    form.setFieldsValue(newTimesheetData);

                    setTableData(fetchedTimesheet.days.map((day, index) => ({
                        key: index,
                        day: day.dayOfWeek,
                        taskName: day.tasks[0].taskName,
                        taskDescription: day.tasks[0].taskDescription,
                        startTime: day.tasks[0].startTime,
                        endTime: day.tasks[0].endTime,
                        breakHours: day.tasks[0].breakHours,
                        totalHoursWorked: day.tasks[0].totalhoursworked,
                        notes: day.tasks[0].notes,
                        isEditable: false,
                    })));
                }
            } catch (error) {
                console.error('Error fetching timesheet:', error);
            }
        };

        if (timesheetId !== 'new') {
            fetchTimesheetData();
        }
    }, [form, timesheetId]);

    const handleAddRow = () => {
        const newRow = {
            key: tableData.length,
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

 
    const handleSaveDraft = async () => {
        try {
            const formValues = await form.validateFields();
            const updatedData = tableData.map((row) => ({
                ...row,
                isEditable: false,
            }));
            setTableData(updatedData);

            const timesheetPayload = {
                employeeName: formValues.employeeName,
                employeeID: formValues.employeeId,
                department: formValues.department,
                teamLeadName: formValues.teamLead,
                weekStartDate: formValues.weekStartDate.format('YYYY-MM-DD'),
                weekEndDate: formValues.weekEndDate.format('YYYY-MM-DD'),
                days: updatedData.map((row) => ({
                    dayOfWeek: row.day,
                    tasks: [
                        {
                            taskName: row.taskName,
                            taskDescription: row.taskDescription,
                            startTime: row.startTime,
                            endTime: row.endTime,
                            breakHours: row.breakHours,
                            totalhoursworked: row.totalHoursWorked,
                            notes: row.notes,
                        },
                    ],
                })),
            };

            let response;
            if (timesheetId === 'new') {
                // Create new timesheet
                response = await axios.post(
                    `${server}/api/timesheet`,
                    timesheetPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                navigate(`/timesheetdetails/${response.data.timesheetId}`);
            } else {
                // Update existing timesheet
                response = await axios.put(
                    `${server}/api/timesheet/${timesheetId}`,
                    timesheetPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
            }

            if (response.data.message === "Timesheet submitted successfully" || response.data.message === "Timesheet updated successfully") {
                message.success('Timesheet saved successfully');
                setIsFormDisabled(true);
            }
        } catch (error) {
            console.error('Error saving timesheet:', error);
            message.error('Failed to save timesheet');
        }
    };
    const handleRowChange = (index, key, value) => {
        const newData = [...tableData];
        newData[index][key] = value;
        setTableData(newData);
    };

    const columns = [
        {
            title: 'Day of Week',
            dataIndex: 'day',
            key: 'day',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'day', e.target.value)}
                        placeholder="Enter day of the week"
                    />
                ) : (
                    <span>{text}</span>
                ),
        },
        {
            title: 'Task Name',
            dataIndex: 'taskName',
            key: 'taskName',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'taskName', e.target.value)}
                        placeholder="Enter task name"
                    />
                ) : (
                    <span>{text}</span>
                ),
        },
        {
            title: 'Task Description',
            dataIndex: 'taskDescription',
            key: 'taskDescription',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'taskDescription', e.target.value)}
                        placeholder="Enter task description"
                    />
                ) : (
                    <span>{text}</span>
                ),
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'startTime', e.target.value)}
                        placeholder="Enter start time"
                    />
                ) : (
                    <span>{text}</span>
                ),
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'endTime', e.target.value)}
                        placeholder="Enter end time"
                    />
                ) : (
                    <span>{text}</span>
                ),
        },
        {
            title: 'Break Hours',
            dataIndex: 'breakHours',
            key: 'breakHours',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'breakHours', e.target.value)}
                        placeholder="Enter break hours"
                    />
                ) : (
                    <span>{text}</span>
                ),
        },
        {
            title: 'Total Hours Worked',
            dataIndex: 'totalHoursWorked',
            key: 'totalHoursWorked',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'totalHoursWorked', e.target.value)}
                        placeholder="Enter total hours worked"
                    />
                ) : (
                    <span>{text}</span>
                ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'notes', e.target.value)}
                        placeholder="Enter notes"
                    />
                ) : (
                    <span>{text}</span>
                ),
        },
    ];

    const handleSubmit = (values) => {
        console.log('Submitted values:', values);
        // Final submission logic if needed
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Enter Timesheet</h1>
            <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={timesheetData}>
            <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Employee Name"
                            name="employeeName"
                            rules={[{ required: true, message: 'Please enter employee name!' }]}
                            style={{ width: '100%' }}
                        >
                            <Input disabled={isFormDisabled} placeholder="Enter Employee Name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Employee ID"
                            name="employeeId"
                            rules={[{ required: true, message: 'Please enter employee ID!' }]}
                            style={{ width: '100%' }}
                        >
                            <Input disabled={isFormDisabled} placeholder="Enter Employee ID" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Department"
                            name="department"
                            rules={[{ required: true, message: 'Please enter department!' }]}
                            style={{ width: '100%' }}
                        >
                            <Input disabled={isFormDisabled} placeholder="Enter Department" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Team Lead"
                            name="teamLead"
                            rules={[{ required: true, message: 'Please enter team lead name!' }]}
                            style={{ width: '100%' }}
                        >
                            <Input disabled={isFormDisabled} placeholder="Enter Team Lead Name" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Week Start Date"
                            name="weekStartDate"
                            rules={[{ required: true, message: 'Please select week start date!' }]}
                            style={{ width: '100%' }}
                        >
                            <DatePicker disabled={isFormDisabled} placeholder="Select Week Start Date" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Week End Date"
                            name="weekEndDate"
                            rules={[{ required: true, message: 'Please select week end date!' }]}
                            style={{ width: '100%' }}
                        >
                            <DatePicker disabled={isFormDisabled} placeholder="Select Week End Date" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button
                            type="primary"
                            htmlType="button"
                            onClick={handleAddRow}
                            style={{ marginRight: '8px', backgroundColor: 'green' }}
                        >
                            Add Row
                        </Button>
                        <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
                            Submit
                        </Button>
                        <Button type="default" htmlType="button" onClick={handleSaveDraft}>
                            Save Draft
                        </Button>
                    </Col>
                </Row>
            </Form>

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