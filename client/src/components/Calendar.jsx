import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { server } from '../constant';
import useTokenValidation from './UseTockenValidation';

const Calendar = () => {
  useTokenValidation();
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRoleAndOrganization = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserRole(response.data.role);
        setOrganizationId(response.data.organizationId);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRoleAndOrganization();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!organizationId) return;

      try {
        const response = await axios.get(`${server}/api/calendar/${organizationId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [organizationId]);

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').day();

  const datesArray = [...Array(daysInMonth)].map((_, index) =>
    currentMonth.date(index + 1).format('YYYY-MM-DD')
  );

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const handleDateClick = (date) => {
    const eventsForSelectedDate = events.filter(event =>
      dayjs(event.date).format('YYYY-MM-DD') === date
    );
    if (eventsForSelectedDate.length > 0) {
      setSelectedDate(date);
      setShowModal(true);
      setSelectedEvents(eventsForSelectedDate);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const handleChangeMonth = (e) => {
    const selectedMonth = parseInt(e.target.value);
    setCurrentMonth(currentMonth.month(selectedMonth));
  };

  const handleChangeYear = (e) => {
    const selectedYear = parseInt(e.target.value);
    setCurrentMonth(currentMonth.year(selectedYear));
  };

  const generateDots = (eventsForDay) => {
    const statusCounts = {
      completed: 0,
      pending: 0,
      inprogress: 0
    };

    eventsForDay.forEach(event => {
      if (statusCounts.hasOwnProperty(event.status)) {
        statusCounts[event.status]++;
      }
    });

    return (
      <>
        {statusCounts.completed > 0 && (
          <span
            className="inline-block w-2 h-2 rounded-full mr-1 bg-green-500"
            title={`${statusCounts.completed} completed card(s)`}
          ></span>
        )}
        {statusCounts.inprogress > 0 && (
          <span
            className="inline-block w-2 h-2 rounded-full mr-1 bg-yellow-500"
            title={`${statusCounts.inprogress} in-progress card(s)`}
          ></span>
        )}
        {statusCounts.pending > 0 && (
          <span
            className="inline-block w-2 h-2 rounded-full mr-1 bg-orange-500"
            title={`${statusCounts.pending} pending card(s)`}
          ></span>
        )}
      </>
    );
  };

  const handleViewProjectTasks = (projectId) => {
    navigate(`/projects/${projectId}/view`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Calendar</h2>
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <button onClick={handlePrevMonth} className="px-4 py-2 bg-blue-500 text-white rounded">Previous</button>
          <select className="mx-4 border px-2 py-1" value={currentMonth.month()} onChange={handleChangeMonth}>
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index} value={index}>{dayjs().month(index).format('MMMM')}</option>
            ))}
          </select>
          <input
            type="number"
            className="border px-2 py-1"
            value={currentMonth.year()}
            onChange={(e) => handleChangeYear(e)}
          />
        </div>
        <button onClick={handleNextMonth} className="px-4 py-2 bg-blue-500 text-white rounded">Next</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-blue-600">{day}</div>
        ))}
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <div key={index}></div>
        ))}
        {datesArray.map(date => {
          const formattedDate = dayjs(date).format('YYYY-MM-DD');
          const isToday = formattedDate === dayjs().format('YYYY-MM-DD');
          const eventsForDay = events.filter(event => dayjs(event.date).format('YYYY-MM-DD') === formattedDate);

          return (
            <div key={formattedDate} className={`border p-2 rounded-lg ${isToday ? 'bg-blue-100' : 'bg-white'} shadow-md`} onClick={() => handleDateClick(formattedDate)}>
              <div className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                {dayjs(date).format('D')}
              </div>
              <div className="flex mt-1">
                {generateDots(eventsForDay)}
              </div>
            </div>
          );
        })}
      </div>
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center z-50 justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white w-3/4 h-3/4 p-8 rounded-lg shadow-lg overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Project, Column, and Card Details</h3>
            <p className="mb-4"><strong>Date:</strong> {selectedDate}</p>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Project Name</th>
                  <th className="px-4 py-2">Column Name</th>
                  <th className="px-4 py-2">Task Name</th>
                  <th className="px-4 py-2">Assigned To</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedEvents.map(event => (
                  <tr key={event.id}>
                    <td className="border px-4 py-2">{event.projectName}</td>
                    <td className="border px-4 py-2">{event.taskName}</td>
                    <td className="border px-4 py-2">{event.cardName}</td>
                    <td className="border px-4 py-2">{event.assignedTo}</td>
                    <td className="border px-4 py-2">{event.status}</td>
                    <td className="border px-4 py-2">
                      <button
                        style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '8px' }}
                        onClick={() => handleViewProjectTasks(event.projectId)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button onClick={handleModalClose} className="px-4 py-2 mr-2 bg-gray-400 text-white rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;








