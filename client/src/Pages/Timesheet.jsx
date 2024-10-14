import { useNavigate } from 'react-router-dom';

const Timesheet = () => {
    const navigate = useNavigate();

    const handleAddTimesheet = () => {
        navigate('/timesheetdetails');
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Timesheet</h1>
            <div className="flex justify-end ">
                <button
                    onClick={handleAddTimesheet}
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                    Add Timesheet
                </button>
            </div>
        </div>
    );
};

export default Timesheet;