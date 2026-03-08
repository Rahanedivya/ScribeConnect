import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaBook, FaStar } from "react-icons/fa";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import volunteerService from "../../services/volunteerService";

const VolunteerHistory = () => {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        completedAssignments: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            const [historyData, statsData] = await Promise.all([
                volunteerService.getHistory(),
                volunteerService.getStats()
            ]);

            setHistory(historyData);
            setStats(statsData);
        } catch (err) {
            console.error("Error fetching history:", err);
            setError(err.message || "Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Calculate this month's completed assignments
    const thisMonthCount = history.filter(assignment => {
        const assignmentDate = new Date(assignment.examDate);
        const now = new Date();
        return assignmentDate.getMonth() === now.getMonth() &&
            assignmentDate.getFullYear() === now.getFullYear();
    }).length;

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <VolunteerSidebar />

            <div className="flex-1 md:ml-64">
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Volunteer History</span>
                </div>

                <div className="p-4 md:p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[#111F35] mb-1">Assignment History</h1>
                        <p className="text-gray-500">Your completed volunteering assignments</p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F63049]"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <p className="font-medium">Error loading history</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <StatCard
                                    title="Total Completed"
                                    value={stats.completedAssignments}
                                    color="blue"
                                />
                                <StatCard
                                    title="This Month"
                                    value={thisMonthCount}
                                    color="green"
                                />
                                <StatCard
                                    title="Average Rating"
                                    value={stats.averageRating.toFixed(1)}
                                    color="yellow"
                                />
                            </div>

                            {/* History List */}
                            {history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map(assignment => (
                                        <HistoryCard
                                            key={assignment._id}
                                            assignment={assignment}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-12 text-center">
                                    <FaBook className="text-5xl text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No History Yet</h3>
                                    <p className="text-gray-500">Your completed assignments will appear here</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        yellow: "bg-yellow-50 text-yellow-600",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className={`text-3xl font-bold ${colorMap[color]}`}>{value}</h3>
        </div>
    );
};

const HistoryCard = ({ assignment, formatDate }) => {
    const studentName = assignment.studentId?.fullName || 'Unknown Student';
    const studentInitials = studentName.split(' ').map(n => n[0]).join('');

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F63049] text-white flex items-center justify-center font-semibold">
                        {studentInitials}
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#111F35]">{assignment.subject}</h3>
                        <p className="text-sm text-gray-500">Student: {studentName}</p>
                        {assignment.studentId?.university && (
                            <p className="text-xs text-gray-400">{assignment.studentId.university}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Completed
                    </span>
                    {assignment.rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                            <FaStar className="text-yellow-500" size={14} />
                            <span className="text-sm font-semibold text-yellow-700">{assignment.rating}/5</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <InfoItem icon={<FaBook />} label="Exam Type" value={assignment.examType} />
                <InfoItem icon={<FaCalendarAlt />} label="Date" value={formatDate(assignment.examDate)} />
                <InfoItem icon={<FaClock />} label="Time" value={assignment.examTime} />
                <InfoItem icon={<FaClock />} label="Duration" value={assignment.duration} />
            </div>

            {/* Feedback Section */}
            {assignment.feedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Student Feedback:</p>
                    <p className="text-sm text-gray-700 italic">"{assignment.feedback}"</p>
                </div>
            )}
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        <span className="text-gray-400 mt-0.5">{icon}</span>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-[#111F35]">{value}</p>
        </div>
    </div>
);

export default VolunteerHistory;
