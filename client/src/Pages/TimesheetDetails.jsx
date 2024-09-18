//TimesheetDetails
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../constant';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Row, Col, Button, DatePicker, Table, message, TimePicker, Select, Modal } from 'antd';
import useTokenValidation from '../components/UseTockenValidation';

const TimesheetDetails = () => {
    useTokenValidation();
    const { timesheetId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { Option } = Select;
    const [startDate, setStartDate] = useState(null);
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
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [visible, setVisible] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

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

                    setTableData(fetchedTimesheet.days.flatMap((day, dayIndex) =>
                        day.tasks.map((task, taskIndex) => ({
                            key: `${dayIndex}-${taskIndex}`,
                            taskId: task._id,
                            day: day.dayOfWeek,
                            taskName: task.taskName,
                            taskDescription: task.taskDescription,
                            startTime: task.startTime,
                            endTime: task.endTime,
                            breakHours: task.breakHours,
                            totalhoursworked: task.totalhoursworked,
                            notes: task.notes,
                            isEditable: false,
                        }))
                    ));
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
        const lastRow = tableData[tableData.length - 1];
        
        if (lastRow) {
            const { day, taskName, startTime, endTime, totalhoursworked } = lastRow;
            
            // Validate required fields (you can modify based on your requirements)
            if (!day || !taskName || !startTime || !endTime || !totalhoursworked) {
                message.warning('Please fill in all details of the previous row before adding a new row.');
                return; // Exit if validation fails
            }
        }

        const newRow = {
            key: `new-${tableData.length}`,
            taskId: null,
            day: '',
            taskName: '',
            taskDescription: '',
            startTime: '',
            endTime: '',
            breakHours: '',
            totalhoursworked: '',
            notes: '',
            isEditable: true,
        };

        setTableData([...tableData, newRow]);
    };

    const showModal = (taskId) => {
        console.log("Setting taskToDelete:", taskId);
        setTaskToDelete(taskId);
        setVisible(true);
    };

    const handleOk = async () => {
        console.log("Deleting task with ID:", taskToDelete);
        try {
            await axios.delete(`${server}/api/timesheet/${timesheetId}/task/${taskToDelete}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            message.success('Task deleted successfully');
            setTableData(tableData.filter(row => row.taskId !== taskToDelete));
        } catch (error) {
            console.error('Error deleting task:', error);
            message.error('Failed to delete task');
        } finally {
            setVisible(false);
            setTaskToDelete(null);
        }
    };

    const handleCancel = () => {
        setVisible(false);
        setTaskToDelete(null);
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
                status:"pending",
                days: updatedData.reduce((acc, row) => {
                    const dayIndex = acc.findIndex(day => day.dayOfWeek === row.day);
                    const task = {
                        taskName: row.taskName,
                        taskDescription: row.taskDescription,
                        startTime: row.startTime,
                        endTime: row.endTime,
                        breakHours: row.breakHours,
                        totalhoursworked: row.totalhoursworked,
                        notes: row.notes,
                    };
                    if (dayIndex === -1) {
                        acc.push({ dayOfWeek: row.day, tasks: [task] });
                    } else {
                        acc[dayIndex].tasks.push(task);
                    }
                    return acc;
                }, []),
            };
    
            let response;
            if (timesheetId === 'new') {
                response = await axios.post(
                    `${server}/api/timesheet`,
                    timesheetPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                const timesheetId = response.data.timesheet._id;
                navigate(`/timesheetdetails/${timesheetId}`);
            } else {
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
            } else {
                message.error('Failed to save timesheet');
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

    const handleEditSave = async (record) => {
        const index = tableData.findIndex(item => item.key === record.key);
        const updatedData = [...tableData];
    
        if (record.isEditable) {
            // Save changes
            try {
                const taskData = {
                    dayOfWeek: record.day,
                    taskName: record.taskName,
                    taskDescription: record.taskDescription,
                    startTime: record.startTime,
                    endTime: record.endTime,
                    breakHours: record.breakHours,
                    totalhoursworked: record.totalhoursworked,
                    notes: record.notes,
                };
    
                let response;
                if (record.taskId) {
                    // If taskId exists, update the task
                    response = await axios.put(
                        `${server}/api/timesheet/${timesheetId}/task/${record.taskId}`,
                        taskData,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                        }
                    );
                } else {
                    // Else, create the task if taskId is null (new row)
                    response = await axios.post(
                        `${server}/api/timesheet/${timesheetId}/task`,
                        taskData,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                        }
                    );
                }
    
                if (response.data.message === "Task updated successfully" || response.data.message === "Task created successfully") {
                    message.success(response.data.message);
                    updatedData[index] = {
                        ...updatedData[index],
                        isEditable: false,
                        taskId: response.data.taskId || updatedData[index].taskId,
                    };
                    setTableData(updatedData);
                } else {
                    message.error('Failed to update/create task');
                }
            } catch (error) {
                console.error('Error updating/creating task:', error);
                message.error('Failed to update/create task');
            }
        } else {
            // Enter edit mode
            updatedData[index].isEditable = true;
            setTableData(updatedData);
        }
    };



    useEffect(() => {
        const requiredDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const addedDays = tableData.map(row => row.day);
        const allDaysAdded = requiredDays.every(day => addedDays.includes(day));
        setSubmitDisabled(!allDaysAdded);
    }, [tableData]);

    const columns = [
        {
            title: 'Day of Week',
            dataIndex: 'day',
            key: 'day',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Select
                        value={text}
                        onChange={(value) => handleRowChange(index, 'day', value)}
                        placeholder="Select day"
                        style={{ width: '120px' }}
                    >
                        <Option value="Monday">Monday</Option>
                        <Option value="Tuesday">Tuesday</Option>
                        <Option value="Wednesday">Wednesday</Option>
                        <Option value="Thursday">Thursday</Option>
                        <Option value="Friday">Friday</Option>
                    </Select>
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
                    <TimePicker
                        value={text ? moment(text, 'HH:mm') : null}
                        onChange={(time, timeString) => handleRowChange(index, 'startTime', timeString)}
                        format="HH:mm"
                        placeholder="Select start time"
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
                    <TimePicker
                        value={text ? moment(text, 'HH:mm') : null}
                        onChange={(time, timeString) => handleRowChange(index, 'endTime', timeString)}
                        format="HH:mm"
                        placeholder="Select end time"
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
            dataIndex: 'totalhoursworked',
            key: 'totalhoursworked',
            render: (text, record, index) =>
                record.isEditable ? (
                    <Input
                        value={text}
                        onChange={(e) => handleRowChange(index, 'totalhoursworked', e.target.value)}
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
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Button
                        type="primary"
                        onClick={() => handleEditSave(record)}
                        style={{ marginRight: '8px' }}
                    >
                        {record.isEditable ? 'Save' : 'Edit'}
                    </Button>
                    <Button
                        type="danger"
                        onClick={() => showModal(record.taskId)}
                        style={{ color: 'red' }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];
    //     try {
    //         const formValues = await form.validateFields();
    //         const updatedData = tableData.map((row) => ({
    //             ...row,
    //             isEditable: false,
    //         }));
    //         setTableData(updatedData);
    
    //         const timesheetPayload = {
    //             employeeName: formValues.employeeName,
    //             employeeID: formValues.employeeId,
    //             department: formValues.department,
    //             teamLeadName: formValues.teamLead,
    //             weekStartDate: formValues.weekStartDate.format('YYYY-MM-DD'),
    //             weekEndDate: formValues.weekEndDate.format('YYYY-MM-DD'),
    //             status: "inprogress",  // Status set to "inprogress"
    //             days: updatedData.reduce((acc, row) => {
    //                 const dayIndex = acc.findIndex(day => day.dayOfWeek === row.day);
    //                 const task = {
    //                     taskName: row.taskName,
    //                     taskDescription: row.taskDescription,
    //                     startTime: row.startTime,
    //                     endTime: row.endTime,
    //                     breakHours: row.breakHours,
    //                     totalhoursworked: row.totalhoursworked,
    //                     notes: row.notes,
    //                 };
    //                 if (dayIndex === -1) {
    //                     acc.push({ dayOfWeek: row.day, tasks: [task] });
    //                 } else {
    //                     acc[dayIndex].tasks.push(task);
    //                 }
    //                 return acc;
    //             }, []),
    //         };
    
    //         let response;
    //         if (timesheetId === 'new') {
    //             response = await axios.post(
    //                 `${server}/api/timesheet`,  // Use the new endpoint for submission
    //                 timesheetPayload,
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${localStorage.getItem('token')}`,
    //                     },
    //                 }
    //             );
    //             const timesheetId = response.data.timesheet._id;
    //             navigate(`/timesheetdetails/${timesheetId}`);
    //         } else {
    //             response = await axios.put(
    //                 `${server}/api/timesheet/${timesheetId}`,  // Update existing timesheet
    //                 timesheetPayload,
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${localStorage.getItem('token')}`,
    //                     },
    //                 }
    //             );
    //         }
    
    //         if (response.data.message === "Timesheet submitted successfully with 'inprogress' status" || response.data.message === "Timesheet updated successfully") {
    //             message.success('Timesheet submitted successfully');
    //             setIsFormDisabled(true);
    //         } else {
    //             message.error('Failed to submit timesheet');
    //         }
    //     } catch (error) {
    //         console.error('Error submitting timesheet:', error);
    //         message.error('Failed to submit timesheet');
    //     }
    // };
    const handleSubmit = async () => {
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
                days: updatedData.reduce((acc, row) => {
                    const dayIndex = acc.findIndex(day => day.dayOfWeek === row.day);
                    const task = {
                        taskName: row.taskName,
                        taskDescription: row.taskDescription,
                        startTime: row.startTime,
                        endTime: row.endTime,
                        breakHours: row.breakHours,
                        totalhoursworked: row.totalhoursworked,
                        notes: row.notes,
                    };
                    if (dayIndex === -1) {
                        acc.push({ dayOfWeek: row.day, tasks: [task] });
                    } else {
                        acc[dayIndex].tasks.push(task);
                    }
                    return acc;
                }, []),
            };
    
            let response;
            if (timesheetId === 'new') {
                // Create a new timesheet
                response = await axios.post(
                    `${server}/api/timesheet`,
                    timesheetPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                const newTimesheetId = response.data.timesheet._id;
                
                // Submit the newly created timesheet
                await axios.post(
                    `${server}/api/timesheet/${newTimesheetId}/submit`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                
                navigate(`/timesheetdetails/${newTimesheetId}`);
            } else {
                // Update existing timesheet
                await axios.put(
                    `${server}/api/timesheet/${timesheetId}`,
                    timesheetPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                
                // Submit the updated timesheet
                response = await axios.post(
                    `${server}/api/timesheet/${timesheetId}/submit`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
            }
    
            if (response.data.message === "Timesheet submitted successfully") {
                message.success('Timesheet submitted successfully with "Inprogress" status');
                setIsFormDisabled(true);
                setTimesheetData(prevData => ({...prevData, status: 'inprogress'}));
            } else {
                message.error('Failed to submit timesheet');
            }
        } catch (error) {
            console.error('Error submitting timesheet:', error);
            message.error('Failed to submit timesheet');
        }
    };


    const handleStartDateChange = (date) => {
        setStartDate(date);
    };

    // Disable end date that is before the selected start date
    const disabledEndDate = (current) => {
        return startDate ? current && current < moment(startDate).endOf('day') : false;
    };

    return (
        <div className="p-4">
            <Modal
                title="Confirm Deletion"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Yes"
                cancelText="No"
            >
                <p>Are you sure you want to delete this task?</p>
            </Modal>
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
                        <DatePicker
                            disabled={isFormDisabled}
                            placeholder="Select Week Start Date"
                            style={{ width: '100%' }}
                            onChange={handleStartDateChange}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Week End Date"
                        name="weekEndDate"
                        rules={[{ required: true, message: 'Please select week end date!' }]}
                        style={{ width: '100%' }}
                    >
                        <DatePicker
                            disabled={isFormDisabled}
                            placeholder="Select Week End Date"
                            style={{ width: '100%' }}
                            disabledDate={disabledEndDate}
                        />
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
                        {/* <Button
                            type="primary"
                            onClick={handleSubmit}
                            disabled={submitDisabled || isFormDisabled}
                            style={{ marginRight: '8px' }} // Add margin here
                        >
                            Submit
                        </Button> */}
                         <Button
                            type="primary"
                            onClick={handleSubmit}
                            disabled={submitDisabled || isFormDisabled || timesheetData.status === 'inprogress'}
                            style={{ marginRight: '8px' }}
                        >
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