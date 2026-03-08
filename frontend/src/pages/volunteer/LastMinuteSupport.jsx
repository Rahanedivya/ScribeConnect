import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaStar, FaCheckCircle, FaClock, FaExclamationCircle, FaTimesCircle, FaBell } from 'react-icons/fa';
import VolunteerSidebar from '../../components/volunteer/VolunteerSidebar';
import lastMinuteService from '../../services/lastMinuteService';
import API_BASE_URL from '../../config/api';

const VolunteerLastMinute = () => {
    const [lastMinuteRequests, setLastMinuteRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        lastMinuteCount: 0,
        isHero: false,
        totalEarnings: 0
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchLastMinuteRequests();
        fetchStats();
    }, []);

    const fetchLastMinuteRequests = async () => {
        try {
            setLoading(true);
            const data = await lastMinuteService.getVolunteerLastMinuteRequests();
            setLastMinuteRequests(data.requests || data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching last minute requests:', err);
            setError('Failed to load last minute requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await lastMinuteService.getVolunteerLastMinuteStats();
            setStats(data || {});
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            setProcessingId(requestId);
            setError('');
            setSuccess('');

            await lastMinuteService.acceptLastMinuteRequest(requestId);

            setSuccess('Request accepted! You are now assigned to this student.');
            
            // Update requests list
            setLastMinuteRequests(prev => 
                prev.map(req => 
                    req._id === requestId 
                        ? { ...req, status: 'accepted', volunteerId: localStorage.getItem('userId') }
                        : req
                )
            );

            setTimeout(() => setSuccess(''), 3000);
            setExpandedRequest(null);
            
            // Refresh stats
            fetchStats();
        } catch (err) {
            setError(err.message || 'Failed to accept request');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectRequest = async (requestId) => {
        if (!rejectReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        try {
            setProcessingId(requestId);
            setError('');
            setSuccess('');

            await lastMinuteService.rejectLastMinuteRequest(requestId, rejectReason);

            setSuccess('Request declined. The student will be notified.');
            
            // Update requests list
            setLastMinuteRequests(prev => 
                prev.filter(req => req._id !== requestId)
            );

            setTimeout(() => setSuccess(''), 3000);
            setShowRejectForm(null);
            setRejectReason('');
        } catch (err) {
            setError(err.message || 'Failed to reject request');
        } finally {
            setProcessingId(null);
        }
    };

    const getUrgencyColor = (examDate) => {
        const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilExam === 0) return { bg: 'bg-red-100', text: 'text-red-800', label: 'Today - Critical!' };
        if (daysUntilExam === 1) return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Tomorrow' };
        if (daysUntilExam <= 3) return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In ' + daysUntilExam + ' days' };
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In ' + daysUntilExam + ' days' };
    };

    const getPendingCount = () => {
        return lastMinuteRequests.filter(r => r.status === 'pending').length;
    };

    return (
        <div className="flex min-h-screen bg-[#F7F9FC]">
            <VolunteerSidebar />

            <div className="flex-1 md:ml-64">
                {/* Top bar */}
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Last Minute Requests</span>
                </div>

                <div className="p-4 md:p-6">
                    {/* Header with Hero Badge */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Last Minute Requests</h1>
                                <p className="text-gray-600">Help students with emergency exam support</p>
                            </div>
                            {stats.isHero && (
                                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
                                    <p className="text-sm font-semibold text-yellow-800 mb-1">⭐ Last Minute Hero</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.lastMinuteCount}</p>
                                    <p className="text-xs text-gray-600">Emergency supports</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                            <p className="text-green-700 flex items-center gap-2">
                                <FaCheckCircle /> {success}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className="text-red-700 flex items-center gap-2">
                                <FaExclamationCircle /> {error}
                            </p>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                            <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{getPendingCount()}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                            <p className="text-gray-600 text-sm font-medium">Total Accepted</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.lastMinuteCount || 0}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                            <p className="text-gray-600 text-sm font-medium">Last Minute Available</p>
                            <label className="flex items-center mt-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    defaultChecked={true}
                                    onChange={(e) => lastMinuteService.updateLastMinuteAvailability(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#F63049] focus:ring-[#F63049]"
                                />
                                <span className="ml-2 text-sm text-gray-700">Toggle Availability</span>
                            </label>
                        </div>
                    </div>

                    {/* Main Content */}
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F63049] mb-2"></div>
                                <p className="text-gray-600">Loading requests...</p>
                            </div>
                        </div>
                    ) : lastMinuteRequests.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <FaBell className="text-4xl text-gray-400 mx-auto mb-4" />
                            <p className="text-lg text-gray-600 mb-2">No last minute requests at the moment</p>
                            <p className="text-gray-500">Keep your Last Minute availability ON to receive urgent student requests</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lastMinuteRequests.map(request => {
                                const urgency = getUrgencyColor(request.examDate);
                                const isPending = request.status === 'pending';

                                return (
                                    <div 
                                        key={request._id} 
                                        className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                                            isPending ? 'border-red-500' : 'border-green-500'
                                        }`}
                                    >
                                        {/* Request Header */}
                                        <div 
                                            className="p-6 cursor-pointer hover:bg-gray-50 transition"
                                            onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {request.subject} - {request.examType}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${urgency.bg} ${urgency.text}`}>
                                                            {urgency.label}
                                                        </span>
                                                        {isPending && (
                                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1">
                                                                <FaBell className="text-xs" /> Pending
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Student Info Preview */}
                                                    {request.studentId && (
                                                        <div className="flex items-center gap-3 mb-3">
                                                            {request.studentId.profilePicture && (
                                                                <img 
                                                                    src={`${API_BASE_URL.replace('/api/v1', '')}${request.studentId.profilePicture}`}
                                                                    alt={request.studentId.fullName}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-gray-900">{request.studentId.fullName}</p>
                                                                <p className="text-xs text-gray-600">{request.studentId.city}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Quick Info */}
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <FaClock /> {new Date(request.examDate).toLocaleDateString()} at {request.examTime}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            Duration: {request.duration}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div className="ml-4">
                                                    {request.status === 'pending' ? (
                                                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                            Awaiting Response
                                                        </span>
                                                    ) : (
                                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                            Accepted
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedRequest === request._id && (
                                            <div className="border-t border-gray-200 bg-gray-50 p-6">
                                                {/* Requirements */}
                                                {request.requirements && (
                                                    <div className="mb-6">
                                                        <p className="font-medium text-gray-900 mb-2">Special Requirements:</p>
                                                        <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
                                                            {request.requirements}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Student Details */}
                                                {request.studentId && (
                                                    <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                                                        <p className="font-medium text-gray-900 mb-3">Student Information:</p>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-600">Name</p>
                                                                <p className="font-medium text-gray-900">{request.studentId.fullName}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600">Contact</p>
                                                                <p className="font-medium text-gray-900">{request.studentId.phone}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600">Location</p>
                                                                <p className="font-medium text-gray-900">{request.studentId.city}, {request.studentId.state}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600">University</p>
                                                                <p className="font-medium text-gray-900">{request.studentId.university}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                {isPending && (
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => handleAcceptRequest(request._id)}
                                                            disabled={processingId === request._id}
                                                            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                                        >
                                                            <FaCheckCircle /> {processingId === request._id ? 'Accepting...' : 'Accept Request'}
                                                        </button>

                                                        <button 
                                                            onClick={() => setShowRejectForm(showRejectForm === request._id ? null : request._id)}
                                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                                        >
                                                            <FaTimesCircle /> Decline
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Reject Form */}
                                                {showRejectForm === request._id && (
                                                    <div className="mt-4 bg-white p-4 rounded-lg border border-red-200">
                                                        <p className="font-medium text-gray-900 mb-2">Reason for declining (optional):</p>
                                                        <textarea 
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                            placeholder="Help the student understand why you're declining..."
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 resize-none mb-3"
                                                            rows="2"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleRejectRequest(request._id)}
                                                                disabled={processingId === request._id}
                                                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition"
                                                            >
                                                                {processingId === request._id ? 'Declining...' : 'Confirm Decline'}
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setShowRejectForm(null);
                                                                    setRejectReason('');
                                                                }}
                                                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg font-medium transition"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerLastMinute;
