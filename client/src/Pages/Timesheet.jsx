//timesheet.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, Button, Dropdown, Menu } from 'antd';
import { FilterOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { server } from '../constant';

const Timesheet = () => {
    const navigate = useNavigate();
    const [timesheetIds, setTimesheetIds] = useState([]);
    const [sortedData, setSortedData] = useState([]);

    useEffect(() => {
        const fetchTimesheetIds = async () => {
            try {
                const response = await axios.get(`${server}/api/timesheets`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (response.data.success && response.data.timesheets.length > 0) {
                    setTimesheetIds(response.data.timesheets);
                    setSortedData(response.data.timesheets);
                }
            } catch (error) {
                console.error('Error fetching timesheet IDs:', error);
            }
        };

        fetchTimesheetIds();
    }, []);

    const handleAddTimesheet = () => {
        navigate('/timesheetdetails/new');
    };

    const handleSort = (order) => {
        const sorted = [...sortedData].sort((a, b) => {
            if (order === 'ascend') {
                return a._id.localeCompare(b._id);
            } else {
                return b._id.localeCompare(a._id);
            }
        });
        setSortedData(sorted);
    };

    const menu = (
        <Menu>
            <Menu.Item key="1" icon={<SortAscendingOutlined />} onClick={() => handleSort('ascend')}>
                Sort Ascending
            </Menu.Item>
            <Menu.Item key="2" icon={<SortDescendingOutlined />} onClick={() => handleSort('descend')}>
                Sort Descending
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: (
                <span>
                    Timesheet ID
                    <Dropdown overlay={menu} trigger={['click']}>
                        <FilterOutlined style={{ marginLeft: 8, cursor: 'pointer' }} />
                    </Dropdown>
                </span>
            ),
            dataIndex: '_id',
            key: '_id',
            render: (text) => (
                <a href={`/timesheetdetails/${text}`} className="text-blue-500 hover:underline">
                    {text}
                </a>
            ),
        },
        {
            title: 'Week Start Date',
            dataIndex: 'weekStartDate',
            key: 'weekStartDate',
            render: (date) => new Date(date).toLocaleDateString('en-IN')
        },
        {
            title: 'Week End Date',
            dataIndex: 'weekEndDate',
            key: 'weekEndDate',
            render: (date) => new Date(date).toLocaleDateString('en-IN')
        },
    ];

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Timesheet</h1>
            <div className="flex justify-end mb-4">
                <Button type="primary" onClick={handleAddTimesheet}>
                    Add Timesheet
                </Button>
            </div>
            <Table dataSource={sortedData} columns={columns} rowKey="_id" />
        </div>
    );
};

export default Timesheet;