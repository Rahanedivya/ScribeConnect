import React, { useState, useEffect } from "react";
import { FaClock } from "react-icons/fa";
import requestService from "../../../services/requestService";

const UpcomingSchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const data = await requestService.getRequests();

            // Filter for matched requests (upcoming exams with assigned scribes)
            const upcomingExams = data
                .filter(r => r.status === 'matched')
                .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
                .slice(0, 3); // Show next 3 upcoming exams

            // Transform to schedule format
            const scheduleData = upcomingExams.map(req => {
                const examDate = new Date(req.examDate);
                const month = examDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                const day = examDate.getDate().toString().padStart(2, '0');
                const startTime = examDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                });

                // Calculate end time based on duration
                const endDate = new Date(examDate.getTime() + (req.duration * 60 * 60 * 1000));
                const endTime = endDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                });

                return {
                    id: req._id,
                    month,
                    day,
                    title: req.examName,
                    time: `${startTime} - ${endTime}`,
                    volunteer: req.volunteerId?.fullName || 'Volunteer assigned'
                };
            });

            setSchedule(scheduleData);
        } catch (err) {
            console.error("Error fetching schedule:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">

            <h3 className="text-lg font-semibold text-[#111F35] mb-4">
                Upcoming Schedule
            </h3>

            {loading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
            ) : schedule.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming exams scheduled</p>
            ) : (
                <div className="space-y-4">
                    {schedule.map((item) => (
                        <ScheduleCard key={item.id} {...item} />
                    ))}
                </div>
            )}

        </div>
    );
};

const ScheduleCard = ({ month, day, title, time, volunteer }) => {
    return (
        <div className="flex items-center gap-4 
      border border-gray-200 
      rounded-xl p-4 
      bg-white
      shadow-sm 
      hover:shadow-md 
      transition-all duration-200">

            {/* Date box */}
            <div className="w-14 h-16 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs font-semibold text-[#F63049]">{month}</span>
                <span className="text-lg font-bold text-[#111F35]">{day}</span>
            </div>

            {/* Info */}
            <div className="flex-1">
                <p className="font-semibold text-[#111F35]">{title}</p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <FaClock className="text-gray-400" />
                    {time}
                </div>

                <p className="text-xs text-green-600 mt-1">
                    ✓ {volunteer}
                </p>
            </div>

        </div>
    );
};

export default UpcomingSchedule;
