import React, { useState, useEffect } from "react";
import { FaArrowUp, FaEllipsisH } from "react-icons/fa";
import requestService from "../../../services/requestService";

const StatsCards = () => {
    const [stats, setStats] = useState({
        totalRequests: 0,
        activeRequests: 0,
        completedRequests: 0,
        upcomingExams: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // Fetch active requests
            const activeData = await requestService.getRequests();
            const activeRequests = activeData.filter(r => r.status === 'pending' || r.status === 'matched');
            const upcomingExams = activeData.filter(r => r.status === 'matched').length;

            // Fetch history for completed requests
            const historyData = await requestService.getHistory();
            const completedRequests = historyData.filter(r => r.status === 'completed').length;

            const totalRequests = activeRequests.length + completedRequests;

            setStats({
                totalRequests,
                activeRequests: activeRequests.length,
                completedRequests,
                upcomingExams
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const statsData = [
        {
            id: 1,
            title: "Total Requests",
            value: loading ? "..." : stats.totalRequests.toString(),
            subtitle: `${stats.completedRequests} completed`,
            type: "up",
        },
        {
            id: 2,
            title: "Active Requests",
            value: loading ? "..." : stats.activeRequests.toString(),
            subtitle: stats.activeRequests > 0 ? "In progress" : "No active requests",
            type: "menu",
        },
        {
            id: 3,
            title: "Upcoming Exams",
            value: loading ? "..." : stats.upcomingExams.toString(),
            subtitle: stats.upcomingExams > 0 ? "Scribes assigned" : "No upcoming exams",
            type: "up",
        },
        {
            id: 4,
            title: "Completed",
            value: loading ? "..." : stats.completedRequests.toString(),
            subtitle: "Total completed",
            type: "up",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => (
                <StatCard key={stat.id} {...stat} />
            ))}
        </div>
    );
};

const StatCard = ({ title, value, subtitle, type }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 font-medium">{title}</p>

                {type === "up" && (
                    <span className="bg-green-100 text-green-600 p-1.5 rounded-full">
                        <FaArrowUp size={12} />
                    </span>
                )}

                {type === "menu" && (
                    <span className="text-gray-400">
                        <FaEllipsisH />
                    </span>
                )}
            </div>

            {/* Value */}
            <h2 className="text-3xl font-bold text-[#111F35] mb-1">{value}</h2>

            {/* Subtitle */}
            <p className="text-sm text-gray-500">{subtitle}</p>

        </div>
    );
};

export default StatsCards;
