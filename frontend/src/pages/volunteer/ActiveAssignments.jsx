import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaBook, FaUser, FaDownload, FaTimes } from "react-icons/fa";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import volunteerService from "../../services/volunteerService";
import API_BASE_URL from "../../config/api";

const ActiveAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchActiveAssignments();
    }, []);

    const fetchActiveAssignments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await volunteerService.getActiveAssignments();
            setAssignments(data);
        } catch (err) {
            console.error("Error fetching active assignments:", err);
            setError(err.message || "Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const thisWeekCount = assignments.filter(a => {
        const examDate = new Date(a.examDate);
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return examDate >= today && examDate <= weekFromNow;
    }).length;

    const thisMonthCount = assignments.filter(a => {
        const examDate = new Date(a.examDate);
        const today = new Date();
        return examDate.getMonth() === today.getMonth() && examDate.getFullYear() === today.getFullYear();
    }).length;

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <VolunteerSidebar />

            <div className="flex-1 md:ml-64">
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Active Assignments</span>
                </div>

                <div className="p-4 md:p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[#111F35] mb-1">Active Assignments</h1>
                        <p className="text-gray-500">Your current volunteering commitments</p>
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
                            <p className="font-medium">Error loading assignments</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <StatCard title="Total Active" value={assignments.length} color="blue" />
                                <StatCard title="This Week" value={thisWeekCount} color="green" />
                                <StatCard title="This Month" value={thisMonthCount} color="orange" />
                            </div>

                            <div className="space-y-4">
                                {assignments.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-12 text-center">
                                        <FaBook className="text-5xl text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Assignments</h3>
                                        <p className="text-gray-500">You don't have any active assignments yet.</p>
                                    </div>
                                ) : (
                                    assignments.map(assignment => (
                                        <AssignmentCard 
                                            key={assignment._id} 
                                            assignment={assignment} 
                                            onAssignmentUpdate={fetchActiveAssignments}
                                        />
                                    ))
                                )}
                            </div>
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
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className={`text-3xl font-bold ${colorMap[color]}`}>{value}</h3>
        </div>
    );
};

const AssignmentCard = ({ assignment, onAssignmentUpdate }) => {
    // Format the exam date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const studentName = assignment.studentId?.fullName || 'Unknown Student';
    const studentInitials = studentName.split(' ').map(n => n[0]).join('');

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Determine status badge
    const getStatusBadge = () => {
        const now = new Date();
        const examDate = new Date(assignment.examDate);

        if (assignment.status === 'in-progress') {
            return { text: 'In Progress', color: 'bg-blue-100 text-blue-700' };
        } else if (assignment.status === 'declined_by_volunteer') {
            return { text: 'Cancelled', color: 'bg-red-100 text-red-700' };
        } else if (examDate < now) {
            return { text: 'Completed', color: 'bg-gray-100 text-gray-700' };
        } else {
            return { text: 'Upcoming', color: 'bg-green-100 text-green-700' };
        }
    };

    const handleCancelClick = () => {
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        try {
            setIsCancelling(true);
            await volunteerService.declineRequest(assignment._id, cancelReason);
            setShowCancelModal(false);
            setCancelReason('');
            onAssignmentUpdate();
        } catch (err) {
            console.error('Error cancelling request:', err);
            alert(err.message || 'Failed to cancel request');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCloseModal = () => {
        setShowCancelModal(false);
        setCancelReason('');
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            await volunteerService.deleteRequest(assignment._id);
            setShowDeleteModal(false);
            onAssignmentUpdate();
        } catch (err) {
            console.error('Error deleting request:', err);
            alert(err.message || 'Failed to delete assignment');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const statusBadge = getStatusBadge();

    return (
        <>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {assignment.studentId?.profilePicture ? (
                        <img
                            src={`${API_BASE_URL.replace('/api/v1', '')}${assignment.studentId.profilePicture}`}
                            alt={studentName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-[#F63049] text-white flex items-center justify-center font-semibold">
                            {studentInitials}
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-[#111F35]">{assignment.subject}</h3>
                        <p className="text-sm text-gray-500">Student: {studentName}</p>
                        {assignment.studentId?.university && (
                            <p className="text-xs text-gray-400">{assignment.studentId.university}</p>
                        )}
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    {statusBadge.text}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem icon={<FaBook />} label="Exam Type" value={assignment.examType} />
                <InfoItem icon={<FaCalendarAlt />} label="Date" value={formatDate(assignment.examDate)} />
                <InfoItem icon={<FaClock />} label="Time" value={assignment.examTime} />
                <InfoItem icon={<FaClock />} label="Duration" value={assignment.duration} />
            </div>

            {/* Reference Materials */}
            {assignment.materials && assignment.materials.length > 0 && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                        <FaBook /> Reference Materials
                    </h4>
                    <div className="space-y-2">
                        {assignment.materials.map((material, index) => {
                            const fileName = material.split('/').pop();
                            // Ensure proper URL formatting
                            const baseUrl = API_BASE_URL.replace('/api/v1', '');
                            const fileUrl = `${baseUrl}${material.startsWith('/') ? '' : '/'}${material}`;

                            return (
                                <a
                                    key={index}
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2 bg-white rounded border border-indigo-100 hover:border-indigo-300 transition text-sm text-gray-700 group"
                                >
                                    <span className="truncate pr-2 group-hover:text-indigo-600">{fileName}</span>
                                    <FaDownload className="text-indigo-400 group-hover:text-indigo-600" />
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Student Contact Info */}
            {assignment.studentId?.phone && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>Contact:</strong> {assignment.studentId.phone}
                    </p>
                </div>
            )}

            {/* Show cancellation reason for declined assignments */}
            {assignment.status === 'declined_by_volunteer' && assignment.declineReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-700 mb-1">Cancellation Reason</p>
                    <p className="text-sm text-gray-700">{assignment.declineReason}</p>
                </div>
            )}

            {/* Cancel Request Button */}
            {assignment.status === 'accepted' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleCancelClick}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition border border-red-200"
                    >
                        Cancel Request
                    </button>
                </div>
            )}

            {/* Delete Button for Declined/Completed Assignments */}
            {(assignment.status === 'declined_by_volunteer' || assignment.status === 'in-progress') && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleDeleteClick}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition border border-gray-300 flex items-center justify-center gap-2"
                    >
                        <FaTimes size={16} /> Delete Assignment
                    </button>
                </div>
            )}
        </div>

        {/* Cancel Request Modal */}
        {showCancelModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-[#111F35]">Cancel Request</h2>
                        <button
                            onClick={handleCloseModal}
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 px-8 py-6">
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to cancel this request? Please provide a reason for cancellation.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#111F35] mb-2">
                                Reason for Cancellation <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please explain why you need to cancel this request..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F63049] focus:border-transparent resize-none"
                                rows="4"
                            />
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs text-yellow-800">
                                <strong>Note:</strong> The student will be notified about the cancellation and the reason provided.
                            </p>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="border-t border-gray-200 px-8 py-5 bg-[#FAFBFD] flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            disabled={isCancelling}
                            className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50"
                        >
                            Keep Request
                        </button>

                        <button
                            type="button"
                            onClick={handleConfirmCancel}
                            disabled={isCancelling || !cancelReason.trim()}
                            className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                                isCancelling || !cancelReason.trim()
                                    ? 'bg-red-300 text-red-700 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            {isCancelling ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Cancelling...
                                </>
                            ) : (
                                'Confirm Cancellation'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Delete Request Modal */}
        {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-[#111F35]">Delete Assignment</h2>
                        <button
                            onClick={handleCloseDeleteModal}
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="px-8 py-6">
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete this assignment? This action cannot be undone.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs text-yellow-800">
                                <strong>Assignment:</strong> {assignment.subject} - {assignment.studentId?.fullName}
                            </p>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="border-t border-gray-200 px-8 py-5 bg-[#FAFBFD] flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCloseDeleteModal}
                            disabled={isDeleting}
                            className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50"
                        >
                            Keep it
                        </button>

                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                </>
                            ) : (
                                'Delete Permanently'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
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

export default ActiveAssignments;
