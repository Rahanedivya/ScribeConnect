import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaCalendarAlt, FaClock, FaBook, FaUser, FaInfoCircle } from "react-icons/fa";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import volunteerService from "../../services/volunteerService";
import API_BASE_URL from "../../config/api";



const IncomingRequests = () => {
    const [requests, setRequests] = useState([]);
    const [urgentRequests, setUrgentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [urgentLoading, setUrgentLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchIncomingRequests();
        fetchUrgentRequests();

        // refresh periodically so urgency/daysRemaining stays accurate
        const timer = setInterval(() => {
            fetchIncomingRequests();
            fetchUrgentRequests();
        }, 60 * 60 * 1000); // every hour
        return () => clearInterval(timer);
    }, []);

    const fetchIncomingRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await volunteerService.getIncomingRequests();
            setRequests(data);
        } catch (err) {
            console.error("Error fetching incoming requests:", err);
            setError(err.message || "Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const fetchUrgentRequests = async () => {
        try {
            setUrgentLoading(true);
            const data = await volunteerService.getUrgentRequests();
            setUrgentRequests(data);
        } catch (err) {
            console.error("Error fetching urgent requests:", err);
            // Don't set error state for urgent requests - it's optional
        } finally {
            setUrgentLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await volunteerService.acceptRequest(requestId);
            // Remove from both lists after accepting
            setRequests(requests.filter(r => r._id !== requestId));
            setUrgentRequests(urgentRequests.filter(r => r._id !== requestId));
        } catch (err) {
            console.error("Error accepting request:", err);
            alert("Failed to accept request. Please try again.");
        }
    };

    const handleDecline = (requestId) => {
        // For now, just remove from list
        // TODO: Add backend endpoint for declining requests
        setRequests(requests.filter(r => r._id !== requestId));
        setUrgentRequests(urgentRequests.filter(r => r._id !== requestId));
    };

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <VolunteerSidebar />

            <div className="flex-1 md:ml-64">
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Incoming Requests</span>
                </div>

                <div className="p-4 md:p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[#111F35] mb-1">Incoming Requests</h1>
                        <p className="text-gray-500">Review and respond to student requests</p>
                    </div>

                    {/* Urgent Requests Section */}
                    {!urgentLoading && urgentRequests.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-1 w-3 bg-red-500 rounded"></div>
                                <h2 className="text-xl font-bold text-red-600">⚡ Urgent Requests</h2>
                            </div>
                            <div className="space-y-4">
                                {urgentRequests.map(request => (
                                    <RequestCard
                                        key={request._id}
                                        request={request}
                                        onAccept={() => handleAccept(request._id)}
                                        onDecline={() => handleDecline(request._id)}
                                        isUrgent={true}
                                    />
                                ))}
                            </div>
                            <hr className="my-6" />
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F63049]"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <p className="font-medium">Error loading requests</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Regular Requests Section */}
                    {!loading && (
                        <div>
                            {requests.length === 0 && urgentRequests.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center">
                                    <FaBook className="text-5xl text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pending Requests</h3>
                                    <p className="text-gray-500">You're all caught up!</p>
                                </div>
                            ) : (
                                <div>
                                    {requests.length > 0 && (
                                        <div>
                                            <h2 className="text-lg font-bold text-[#111F35] mb-4">Regular Requests</h2>
                                            <div className="space-y-4">
                                                {requests.map(request => (
                                                    <RequestCard
                                                        key={request._id}
                                                        request={request}
                                                        onAccept={() => handleAccept(request._id)}
                                                        onDecline={() => handleDecline(request._id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RequestCard = ({ request, onAccept, onDecline, isUrgent = false }) => {
    // Format the exam date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const studentName = request.studentId?.fullName || 'Unknown Student';
    const studentInitials = studentName.split(' ').map(n => n[0]).join('');

    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);

    // force component re-render every hour so daysRemaining updates
    const [, forceUpdate] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => forceUpdate(n => n + 1), 60 * 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    const handleAcceptClick = () => {
        setShowTermsModal(true);
        setTermsAgreed(false);
    };

    // compute urgency/time data every render so it stays up to date
    const now = new Date();
    const examDateObj = new Date(request.examDate);
    const diffMs = examDateObj - now;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isUrgentByDate = daysRemaining >= 0 && daysRemaining <= 3;
    const urgentFlag = (isUrgent && daysRemaining >= 0) || isUrgentByDate;

    const remainingTextClass = daysRemaining <= 3 ? 'text-red-600 font-semibold' : 'text-gray-700';

    // used later in render

    const handleConfirmAccept = () => {
        if (termsAgreed) {
            setShowTermsModal(false);
            setTermsAgreed(false);
            onAccept();
        }
    };

    const handleCancelTerms = () => {
        setShowTermsModal(false);
        setTermsAgreed(false);
    };

    return (
        <> 
        <div className={`${urgentFlag ? 'bg-red-50 border-2 border-red-300' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm p-6`}>
            {/* urgent banner */}
            {urgentFlag && (
                <div className="mb-2">
                    <span className="text-red-700 font-bold text-sm">⚠️ URGENT REQUEST</span>
                </div>
            )}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                    {request.studentId?.profilePicture ? (
                        <img
                            src={`${API_BASE_URL.replace('/api/v1', '')}${request.studentId.profilePicture}`}
                            alt={studentName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-[#F63049] text-white flex items-center justify-center font-semibold">
                            {studentInitials}
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-[#111F35]">{request.subject}</h3>
                        <p className="text-sm text-gray-500">Student: {studentName}</p>
                        {request.studentId?.university && (
                            <p className="text-xs text-gray-400">{request.studentId.university}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    {isUrgent && (
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse flex items-center gap-1 whitespace-nowrap">
                            ⚡ URGENT
                        </span>
                    )}
                    {request.materials && request.materials.length > 0 && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <FaBook className="text-xs" /> Material Available
                        </span>
                    )}
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {request.examType}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <InfoItem icon={<FaCalendarAlt />} label="Date" value={formatDate(request.examDate)} />
                <InfoItem icon={<FaClock />} label="Time" value={request.examTime} />
                <InfoItem icon={<FaClock />} label="Duration" value={request.duration} />
            </div>

            {/* time remaining info */}
            {request.examDate && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className={`text-sm ${remainingTextClass}`}>Days Remaining: {daysRemaining >= 0 ? `${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'}` : 'Past Exam Date'}</p>
                    <p className={`text-sm mt-1 ${remainingTextClass}`}>Please Accept or Reject before the deadline.</p>
                </div>
            )}

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600"><strong>Requirements:</strong> {request.requirements}</p>
                {request.studentId?.specificNeeds && (
                    <p className="text-sm text-gray-600 mt-2"><strong>Special Needs:</strong> {request.studentId.specificNeeds}</p>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleAcceptClick}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                    <FaCheck /> Accept
                </button>
                <button
                    onClick={onDecline}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                    <FaTimes /> Decline
                </button>
            </div>

            {/* Volunteer Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-[#111F35]">Volunteer Terms & Conditions</h2>
                            <button
                                onClick={handleCancelTerms}
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-8 py-6">
                            <div className="text-sm text-gray-700 space-y-4">
                                <h3 className="font-semibold text-[#111F35] text-base">1. Eligibility & Commitment</h3>
                                <p>I confirm that I am willing and available to assist the student on the specified exam date and time.</p>
                                <p>I understand that accepting a request means I am committing to be present at the exam center as required.</p>
                                <p>I will not accept a request unless I am certain of my availability.</p>

                                <h3 className="font-semibold text-[#111F35] text-base">2. Role & Responsibilities</h3>
                                <p>I understand that my role is strictly limited to writing only what the student dictates during the examination.</p>
                                <p>I will not interpret, explain, suggest, or influence answers in any manner.</p>
                                <p>I will write clearly and accurately as dictated by the student.</p>
                                <p>I will maintain professionalism and focus throughout the examination.</p>

                                <h3 className="font-semibold text-[#111F35] text-base">3. Academic Integrity (Very Important)</h3>
                                <p>I clearly understand that I am not permitted to write any answer on the exam paper by myself under any circumstances.</p>
                                <p>I will not add, modify, improve, or complete any answer without direct dictation from the student.</p>
                                <p>I acknowledge that writing answers independently or assisting beyond dictation is strictly prohibited.</p>
                                <p>I understand that violation of this rule may result in exam cancellation, disciplinary action, or permanent suspension from the platform.</p>

                                <h3 className="font-semibold text-[#111F35] text-base">4. Confidentiality & Privacy</h3>
                                <p>I agree to keep all exam-related information confidential.</p>
                                <p>I will not share the student’s personal, medical, or disability-related information with anyone.</p>
                                <p>I will not record, photograph, or distribute exam materials.</p>

                                <h3 className="font-semibold text-[#111F35] text-base">5. Conduct & Professional Behavior</h3>
                                <p>I agree to treat the student with dignity, patience, and respect.</p>
                                <p>I will behave appropriately at the examination center and follow all institutional rules.</p>
                                <p>I understand that misconduct may lead to removal from the platform.</p>

                                <h3 className="font-semibold text-[#111F35] text-base">6. Cancellation & Reliability</h3>
                                <p>If an emergency prevents me from attending, I will inform the platform immediately.</p>
                                <p>I understand that repeated cancellations may lead to suspension.</p>
                                <p>I acknowledge that last-minute withdrawal may cause serious hardship for the student.</p>

                                <h3 className="font-semibold text-[#111F35] text-base">7. Platform Disclaimer</h3>
                                <p>I understand that the platform only connects students and volunteers and does not conduct examinations.</p>
                                <p>I agree that the platform is not responsible for decisions made by examination authorities.</p>

                                <h3 className="font-semibold text-[#111F35] text-base">8. Final Declaration</h3>
                                <p>I confirm that I have read, understood, and agreed to these terms before accepting the request.</p>

                                <p className="text-xs text-gray-500 pt-4">By checking the box below, you acknowledge that you have read, understood, and agree to all terms and conditions outlined above.</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 px-8 py-5 bg-[#FAFBFD]">
                            <div className="mb-5">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={termsAgreed}
                                        onChange={(e) => setTermsAgreed(e.target.checked)}
                                        className="w-5 h-5 accent-[#F63049] cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700">
                                        I agree to the Terms & Conditions
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancelTerms}
                                    className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleConfirmAccept}
                                    disabled={!termsAgreed}
                                    className={`bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition ${
                                        termsAgreed
                                            ? 'hover:bg-green-700'
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    Agree & Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
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

export default IncomingRequests;
