import React, { useState, useEffect } from "react";
import { FaTrash, FaClock, FaCalendarAlt, FaBook } from "react-icons/fa";
import StudentSidebar from "../../components/student/StudentSidebar";
import requestService from "../../services/requestService";

const ActiveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completionModal, setCompletionModal] = useState(null); // { requestId, volunteerName }
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [urgentRequestId, setUrgentRequestId] = useState(null);
    const [requestingUrgent, setRequestingUrgent] = useState(false);

    // Fetch requests on component mount
    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await requestService.getRequests();

            // Filter out completed requests but keep declined_by_volunteer for display
            const activeRequests = data.filter(
                req => req.status !== 'completed' && req.status !== 'cancelled_by_student' && req.status !== 'volunteer_no_show'
            );

            // Map backend data to component format
            const mappedRequests = activeRequests.map(req => ({
                id: req._id,
                subject: req.subject,
                type: req.examType,
                // raw examDate preserved for calculations
                examDate: req.examDate,
                date: new Date(req.examDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                time: req.examTime,
                duration: req.duration,
                requirements: req.requirements,
                status: mapStatus(req.status),
                rawStatus: req.status,
                volunteer: req.volunteerId?.fullName || null,
                declineReason: req.declineReason || null,
                urgent: req.urgent || false,
                matchProbability: req.status === 'pending' ? 60 : req.status === 'accepted' ? 100 : 80,
                notifiedVolunteers: req.status === 'pending' ? 3 : 5
            }));

            setRequests(mappedRequests);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError(err.message || "Failed to load requests");
            setLoading(false);
        }
    };

    // Map backend status to display status
    const mapStatus = (backendStatus) => {
        const statusMap = {
            'pending': 'Matching in Progress',
            'accepted': 'Matched',
            'in-progress': 'Matched',
            'declined_by_volunteer': 'Volunteer Cancelled'
        };
        return statusMap[backendStatus] || 'Pending';
    };

    const handleDelete = async (id) => {
        try {
            await requestService.cancelRequest(id);
            setRequests(requests.filter(req => req.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Error deleting request:", err);
            alert("Failed to cancel request: " + err.message);
        }
    };

    const handleRequestUrgent = async (requestId) => {
        try {
            setRequestingUrgent(true);
            await requestService.requestUrgentSupport(requestId);
            
            // Update the request to mark it as urgent
            setRequests(requests.map(req =>
                req.id === requestId ? { ...req, urgent: true } : req
            ));
            
            setUrgentRequestId(null);
            alert('Last Minute Support activated! Available volunteers will be notified.');
        } catch (err) {
            console.error("Error requesting urgent support:", err);
            alert("Failed to activate Last Minute Support: " + err.message);
        } finally {
            setRequestingUrgent(false);
        }
    };

    const handleCompleteRequest = async () => {
        if (rating === 0) {
            alert("Please provide a rating before completing");
            return;
        }

        try {
            await requestService.completeRequest(completionModal.requestId, rating, feedback);
            // Remove from active requests list
            setRequests(requests.filter(req => req.id !== completionModal.requestId));
            // Close modal and reset
            setCompletionModal(null);
            setRating(0);
            setFeedback('');
        } catch (err) {
            console.error("Error completing request:", err);
            alert("Failed to complete request: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <StudentSidebar />

            <div className="flex-1 md:ml-64">
                {/* Top bar */}
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Active Requests</span>
                </div>

                <div className="p-4 md:p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[#111F35] mb-1">Active Requests</h1>
                        <p className="text-gray-500">
                            Manage your pending and matched scribe requests
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            <p className="font-medium">Error loading requests</p>
                            <p className="text-sm">{error}</p>
                            <button
                                onClick={fetchRequests}
                                className="mt-2 text-sm underline hover:no-underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-[#F63049]">
                                <div className="w-3 h-3 bg-[#F63049] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-3 h-3 bg-[#F63049] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-3 h-3 bg-[#F63049] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <p className="text-gray-500 mt-4">Loading your requests...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <StatCard title="Total Active" value={requests.length} color="blue" />
                                <StatCard
                                    title="Matching"
                                    value={requests.filter(r => r.status === "Matching in Progress").length}
                                    color="orange"
                                />
                                <StatCard
                                    title="Matched"
                                    value={requests.filter(r => r.status === "Matched").length}
                                    color="green"
                                />
                            </div>

                            {/* Requests List */}
                            <div className="space-y-4">
                                {requests.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                                        <div className="text-gray-400 mb-4">
                                            <FaBook className="text-5xl mx-auto" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Requests</h3>
                                        <p className="text-gray-500">You don't have any active scribe requests at the moment.</p>
                                    </div>
                                ) : (
                                    requests.map((request) => (
                                        <RequestCard
                                            key={request.id}
                                            request={request}
                                            onDelete={() => setDeleteConfirm(request.id)}
                                            deleteConfirm={deleteConfirm === request.id}
                                            onConfirmDelete={() => handleDelete(request.id)}
                                            onCancelDelete={() => setDeleteConfirm(null)}
                                            onComplete={() => setCompletionModal({ requestId: request.id, volunteerName: request.volunteer })}
                                            urgentRequestId={urgentRequestId}
                                            setUrgentRequestId={setUrgentRequestId}
                                            requestingUrgent={requestingUrgent}
                                            onRequestUrgent={handleRequestUrgent}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Completion Modal */}
            {completionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-[#111F35] mb-4">Complete Request</h3>
                        <p className="text-gray-600 mb-6">
                            Rate your experience with <span className="font-semibold">{completionModal.volunteerName}</span>
                        </p>

                        {/* Star Rating */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="text-3xl transition-colors"
                                    >
                                        {star <= rating ? '⭐' : '☆'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback (Optional)</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Share your experience with this volunteer..."
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F63049] focus:border-transparent"
                                rows="4"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setCompletionModal(null);
                                    setRating(0);
                                    setFeedback('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteRequest}
                                className="flex-1 px-4 py-2 bg-[#F63049] text-white rounded-lg hover:bg-[#e12a40] transition"
                            >
                                Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* -------------------- Components -------------------- */

const StatCard = ({ title, value, color }) => {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600",
        green: "bg-green-50 text-green-600",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className={`text-3xl font-bold ${colorMap[color]}`}>{value}</h3>
        </div>
    );
};

const RequestCard = ({ request, onDelete, deleteConfirm, onConfirmDelete, onCancelDelete, onComplete, urgentRequestId, setUrgentRequestId, requestingUrgent, onRequestUrgent }) => {
    const statusColors = {
        "Matching in Progress": "bg-orange-100 text-orange-700",
        "Pending": "bg-yellow-100 text-yellow-700",
        "Matched": "bg-green-100 text-green-700",
        "Volunteer Cancelled": "bg-red-100 text-red-700",
    };

    // force update every hour so countdown remains accurate
    const [, forceUpdate] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => forceUpdate(n => n + 1), 60 * 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    // compute urgency based on examDate and existing flag
    const now = new Date();
    let daysRemaining = null;
    if (request.examDate) {
        daysRemaining = Math.ceil((new Date(request.examDate) - now) / (1000 * 60 * 60 * 24));
    }
    const urgentFlag = (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3) || (request.urgent && daysRemaining !== null && daysRemaining >= 0);
    const remainingTextClass = daysRemaining !== null && daysRemaining <= 3 ? 'text-red-600 font-semibold' : 'text-gray-700';

    return (
        <div className={`${urgentFlag ? 'border-2 border-red-300 bg-red-50' : 'border border-gray-200'} bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition`}> 
            {urgentFlag && (
                <div className="px-5 pt-4">
                    <span className="text-red-700 font-bold text-sm">⚠️ URGENT REQUEST</span>
                </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F63049] text-white flex items-center justify-center font-semibold">
                        {request.subject.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#111F35]">{request.subject}</h3>
                        <p className="text-sm text-gray-500">{request.type}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {request.status}
                    </span>

                    {!deleteConfirm ? (
                        <button
                            onClick={onDelete}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                            <FaTrash />
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onCancelDelete}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirmDelete}
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            {request.examDate && (
                <div className="p-5 bg-gray-50 mb-4">
                    <p className={`${remainingTextClass} text-sm`}>Days Remaining: {daysRemaining >= 0 ? `${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'}` : 'Past Exam Date'}</p>
                    <p className={`${remainingTextClass} text-sm mt-1`}>Please Accept or Reject before the deadline.</p>
                </div>
            )}
            <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <InfoItem icon={<FaCalendarAlt />} label="Date" value={request.date} />
                    <InfoItem icon={<FaClock />} label="Time" value={request.time} />
                    <InfoItem icon={<FaClock />} label="Duration" value={request.duration} />
                    {request.volunteer && (
                        <InfoItem icon={<FaBook />} label="Volunteer" value={request.volunteer} />
                    )}
                </div>

                {/* Volunteer Cancellation Notice */}
                {request.rawStatus === "declined_by_volunteer" && (
                    <div className="mt-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-800 mb-2">Volunteer Cancellation</h4>
                            <p className="text-sm text-red-700 mb-3">
                                The assigned volunteer has cancelled this request.
                            </p>
                            {request.declineReason && (
                                <div className="bg-white rounded p-2 mb-3">
                                    <p className="text-xs text-gray-600 font-medium mb-1">Reason:</p>
                                    <p className="text-sm text-gray-700">{request.declineReason}</p>
                                </div>
                            )}
                            
                            {/* Last Minute Support Status */}
                            {request.urgent ? (
                                <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-3">
                                    <p className="text-sm text-orange-700 font-medium">
                                        ✓ Last Minute Support Activated
                                    </p>
                                    <p className="text-xs text-orange-600 mt-1">
                                        Available volunteers are being notified about this urgent request.
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setUrgentRequestId(request.id)}
                                    disabled={requestingUrgent}
                                    className="w-full bg-[#F63049] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e12a40] transition disabled:opacity-50"
                                >
                                    {requestingUrgent ? 'Activating...' : 'Request Last Minute Support'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Confirm Urgent Request Modal */}
                {urgentRequestId === request.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold text-[#111F35] mb-2">
                                Request Last Minute Support?
                            </h3>
                            <p className="text-gray-600 text-sm mb-6">
                                This will mark your request as urgent and notify available volunteers who have opted in to receive last-minute requests. Response time may vary.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setUrgentRequestId(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => onRequestUrgent(request.id)}
                                    disabled={requestingUrgent}
                                    className="flex-1 px-4 py-2 bg-[#F63049] text-white rounded-lg font-medium hover:bg-[#e12a40] transition disabled:opacity-50"
                                >
                                    {requestingUrgent ? 'Activating...' : 'Yes, Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Progress Bar (for matching requests) */}
                {request.status === "Matching in Progress" && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-gray-600">Match Probability</p>
                            <p className="text-sm font-semibold text-[#F63049]">{request.matchProbability}%</p>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#F63049] rounded-full transition-all"
                                style={{ width: `${request.matchProbability}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {request.notifiedVolunteers} qualified volunteers notified
                        </p>
                    </div>
                )}

                {/* Matched Info */}
                {request.status === "Matched" && (
                    <div className="mt-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-green-700">
                                ✓ Matched with <span className="font-semibold">{request.volunteer}</span>
                            </p>
                        </div>
                        <button
                            onClick={onComplete}
                            className="w-full bg-[#F63049] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e12a40] transition"
                        >
                            Mark as Complete
                        </button>
                    </div>
                )}
            </div>
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

export default ActiveRequests;
