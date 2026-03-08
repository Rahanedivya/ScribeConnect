import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import requestService from "../../../services/requestService";

const ActiveRequest = () => {
    const [activeRequest, setActiveRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActiveRequest();
    }, []);

    const fetchActiveRequest = async () => {
        try {
            setLoading(true);
            const data = await requestService.getRequests();
            // Get the most recent pending or matched request
            const active = data.find(r => r.status === 'pending' || r.status === 'matched');
            setActiveRequest(active);
        } catch (err) {
            console.error("Error fetching active request:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = () => {
        navigate('/student/active-requests');
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#F63049] lg:col-span-2">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!activeRequest) {
        return (
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-gray-300 lg:col-span-2">
                <h3 className="font-semibold mb-2">No Active Requests</h3>
                <p className="text-gray-500 text-sm mb-4">You don't have any active requests at the moment.</p>
                <button
                    onClick={() => navigate('/student/request')}
                    className="bg-[#F63049] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#e12a40]"
                >
                    Create New Request
                </button>
            </div>
        );
    }

    const examDate = new Date(activeRequest.examDate);
    const formattedDate = examDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const formattedTime = examDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#F63049] lg:col-span-2">

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse-soft"></span>
                    <h3 className="font-semibold">Active Request</h3>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs ${activeRequest.status === 'matched'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700 animate-pulse-soft'
                    }`}>
                    {activeRequest.status === 'matched' ? 'Scribe Assigned' : 'Matching in progress'}
                </span>
            </div>

            <h2 className="text-xl font-bold mb-1">{activeRequest.examName}</h2>
            <p className="text-gray-500 text-sm mb-4">{formattedDate}, {formattedTime}</p>

            {/* Progress */}
            {activeRequest.status === 'pending' && (
                <div className="mb-4">
                    <p className="text-sm mb-1">Matching Probability</p>
                    <div className="h-3 bg-red-100 rounded-full overflow-hidden animate-progress">
                        <div className="h-full bg-[#F63049] w-[70%] rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        We are finding qualified volunteers for you.
                    </p>
                </div>
            )}

            {activeRequest.status === 'matched' && activeRequest.volunteerId && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-800">
                        ✓ Scribe Assigned: {activeRequest.volunteerId.fullName || 'Volunteer'}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><span className="text-gray-500">Subject:</span> {activeRequest.subject}</div>
                <div><span className="text-gray-500">Duration:</span> {activeRequest.duration} Hours</div>
                <div><span className="text-gray-500">Language:</span> {activeRequest.language}</div>
                <div><span className="text-gray-500">Location:</span> {activeRequest.location}</div>
            </div>

            <button
                onClick={handleViewDetails}
                className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
                View Details
            </button>
        </div>
    );
};

export default ActiveRequest;