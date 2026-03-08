import React, { useState, useEffect } from "react";
import StudentSidebar from "../../components/student/StudentSidebar";
import { FaStar, FaCalendar, FaClock, FaBook } from "react-icons/fa";
import requestService from "../../services/requestService";

const History = () => {
    const [completedRequests, setCompletedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await requestService.getHistory();
            setCompletedRequests(data);
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

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <StudentSidebar />

            <div className="flex-1 md:ml-64">
                {/* Top Bar */}
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Request History</span>
                </div>

                <div className="p-4 md:p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[#111F35] mb-2">Your Request History</h1>
                        <p className="text-gray-600">View your past completed and cancelled requests</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <StatCard
                                    title="Total Requests"
                                    value={completedRequests.length}
                                    color="bg-blue-500"
                                />
                                <StatCard
                                    title="Completed"
                                    value={completedRequests.filter(r => r.status === 'completed').length}
                                    color="bg-green-500"
                                />
                                <StatCard
                                    title="Cancelled"
                                    value={completedRequests.filter(r => r.status === 'cancelled_by_student' || r.status === 'declined_by_volunteer').length}
                                    color="bg-orange-500"
                                />
                                <StatCard
                                    title="No-Show"
                                    value={completedRequests.filter(r => r.status === 'volunteer_no_show').length}
                                    color="bg-red-500"
                                />
                            </div>

                            {/* Request Cards */}
                            {completedRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {completedRequests.map(request => (
                                        <RequestCard
                                            key={request._id}
                                            request={request}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                    <div className="text-gray-400 text-5xl mb-4">📚</div>
                                    <h3 className="text-lg font-semibold text-[#111F35] mb-2">No history yet</h3>
                                    <p className="text-gray-600">Your completed requests will appear here</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ---------------- Stat Card Component ---------------- */

const StatCard = ({ title, value, color }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl font-bold`}>
                {value}
            </div>
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-[#111F35]">{value}</p>
            </div>
        </div>
    </div>
);

/* ---------------- Request Card Component ---------------- */

const RequestCard = ({ request, formatDate }) => {
    const statusColors = {
        'completed': 'bg-green-100 text-green-700',
        'cancelled_by_student': 'bg-red-100 text-red-700',
        'declined_by_volunteer': 'bg-red-100 text-red-700',
        'volunteer_no_show': 'bg-red-100 text-red-700'
    };

    const statusText = {
        'completed': 'Completed',
        'cancelled_by_student': 'Cancelled',
        'declined_by_volunteer': 'Volunteer Cancelled',
        'volunteer_no_show': 'Volunteer No-Show'
    };

    const volunteerName = request.volunteerId?.fullName || 'No volunteer assigned';
    const volunteerInitials = volunteerName.split(' ').map(n => n[0]).join('');

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                        {/* Volunteer Avatar */}
                        {request.volunteerId && (
                            <div className="w-12 h-12 rounded-full bg-[#F63049] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {volunteerInitials}
                            </div>
                        )}

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#111F35] mb-1">{request.subject}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                                {request.volunteerId ? (
                                    <>Volunteer: <span className="font-semibold text-[#111F35]">{volunteerName}</span></>
                                ) : (
                                    <span className="text-gray-400">No volunteer assigned</span>
                                )}
                            </p>

                            {/* Details */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <FaBook className="text-[#F63049]" />
                                    <span>{request.examType}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaCalendar className="text-[#F63049]" />
                                    <span>{formatDate(request.examDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaClock className="text-[#F63049]" />
                                    <span>{request.examTime} ({request.duration})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rating & Feedback Section */}
                    {request.status === 'completed' && request.rating && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-green-700">Your Rating</span>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={i < request.rating ? "text-yellow-400" : "text-gray-300"}
                                            size={14}
                                        />
                                    ))}
                                </div>
                            </div>
                            {request.feedback && (
                                <p className="text-sm text-gray-700">"{request.feedback}"</p>
                            )}
                        </div>
                    )}

                {/* Show decline reason if volunteer cancelled */}
                {request.status === 'declined_by_volunteer' && request.declineReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                        <p className="text-sm font-semibold text-red-700 mb-2">Cancellation Reason</p>
                        <p className="text-sm text-gray-700">{request.declineReason}</p>
                    </div>
                )}
                </div>

                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[request.status]}`}>
                    {statusText[request.status]}
                </span>
            </div>
        </div>
    );
};

export default History;
