import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaInfoCircle, FaPlus, FaUserCheck } from "react-icons/fa";
import requestService from "../../../services/requestService";

const iconMap = {
    completed: {
        icon: <FaCheckCircle />,
        color: "text-green-500",
        bg: "bg-green-50",
    },
    matched: {
        icon: <FaUserCheck />,
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    pending: {
        icon: <FaPlus />,
        color: "text-yellow-500",
        bg: "bg-yellow-50",
    },
    created: {
        icon: <FaPlus />,
        color: "text-red-500",
        bg: "bg-red-50",
    },
};

const RecentActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchActivities = async () => {
        try {
            setLoading(true);

            // Fetch both active and history requests
            const [activeData, historyData] = await Promise.all([
                requestService.getRequests(),
                requestService.getHistory()
            ]);

            // Combine and sort by creation date
            const allRequests = [...activeData, ...historyData]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5); // Get latest 5

            // Transform to activity format
            const activityList = allRequests.map(req => {
                const createdDate = new Date(req.createdAt);
                const timeAgo = getTimeAgo(createdDate);

                let title, desc, type;

                if (req.status === 'completed') {
                    title = "Request Completed";
                    desc = `${req.subject} - Rated ${req.rating || 'N/A'} stars`;
                    type = "completed";
                } else if (req.status === 'matched') {
                    title = "Scribe Assigned";
                    desc = `${req.subject} - ${req.volunteerId?.fullName || 'Volunteer assigned'}`;
                    type = "matched";
                } else if (req.status === 'pending') {
                    title = "Request Created";
                    desc = `${req.subject} - Waiting for match`;
                    type = "pending";
                } else {
                    title = "Request Created";
                    desc = req.subject;
                    type = "created";
                }

                return {
                    id: req._id,
                    type,
                    title,
                    desc,
                    time: timeAgo
                };
            });

            setActivities(activityList);
        } catch (err) {
            console.error("Error fetching activities:", err);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">

            <h3 className="text-lg font-semibold text-[#111F35] mb-4">
                Recent Activity
            </h3>

            {loading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
            ) : activities.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
                <div className="divide-y divide-gray-200">
                    {activities.map((item) => (
                        <ActivityRow key={item.id} {...item} />
                    ))}
                </div>
            )}

        </div>
    );
};

const ActivityRow = ({ type, title, desc, time }) => {
    const { icon, color, bg } = iconMap[type] || iconMap.created;

    return (
        <div className="flex items-center justify-between py-4">

            <div className="flex items-center gap-4">

                {/* Icon */}
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 ${bg}`}
                >
                    <span className={`${color} text-lg`}>{icon}</span>
                </div>

                {/* Text */}
                <div>
                    <p className="font-semibold text-[#111F35]">{title}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                </div>

            </div>

            {/* Time */}
            <span className="text-sm text-gray-400">{time}</span>

        </div>
    );
};

export default RecentActivity;
