// // //timesheet.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { server } from '../constant';

// const Timesheet = () => {
//     const navigate = useNavigate();
//     const [timesheetIds, setTimesheetIds] = useState([]);

//     useEffect(() => {
//         const fetchTimesheetIds = async () => {
//             try {
//                 const response = await axios.get(`${server}/api/timesheets`, {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem('token')}`,
//                     },
//                 });
//                 if (response.data.success && response.data.timesheets.length > 0) {
//                     setTimesheetIds(response.data.timesheets.map((timesheet) => timesheet._id));
//                 }
//             } catch (error) {
//                 console.error('Error fetching timesheet IDs:', error);
//             }
//         };

//         fetchTimesheetIds();
//     }, []);

//     const handleAddTimesheet = () => {
//         navigate('/timesheetdetails/new');
//     };

//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold mb-4">Timesheet</h1>
//             <div className="flex justify-end mb-4">
//                 <button
//                     onClick={handleAddTimesheet}
//                     className="bg-blue-500 text-white py-2 px-4 rounded"
//                 >
//                     Add Timesheet
//                 </button>
//             </div>
//             <table className="w-full table-auto">
//                 <thead>
//                     <tr>
//                         <th className="px-4 py-2">Timesheet ID</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                 {timesheetIds.map((id, index) => (
//                         <tr key={index}>
//                             <td className="border px-4 py-2">
//                                 <a
//                                     href={`/timesheetdetails/${id}`}
//                                     className="text-blue-500 hover:underline"
//                                 >
//                                     {id}
//                                 </a>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default Timesheet;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, Button } from 'antd';
import { server } from '../constant';

const Timesheet = () => {
    const navigate = useNavigate();
    const [timesheetIds, setTimesheetIds] = useState([]);

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

    const columns = [
        {
            title: 'Timesheet ID',
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
            render: (date) => new Date(date).toLocaleDateString('en-In')
        },
        {
            title: 'Week End Date',
            dataIndex: 'weekEndDate',
            key: 'weekEndDate',
            render: (date) => new Date(date).toLocaleDateString('en-In')
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
            <Table dataSource={timesheetIds} columns={columns} rowKey="_id" />
        </div>
    );
};

export default Timesheet;