import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaPlus
} from "react-icons/fa";
import StudentSidebar from "../../components/student/StudentSidebar";
import RecentActivity from "../../components/student/dashboard/RecentActivity";
import TipsCard from "../../components/student/dashboard/TipsCard";
import UpcomingSchedule from "../../components/student/dashboard/UpcomingSchedule";
import StatsCards from "../../components/student/dashboard/StatsCards";
import ActiveRequest from "../../components/student/dashboard/ActiveRequest";
import studentService from "../../services/studentService";

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await studentService.getProfile();
            setProfile(data);
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewRequest = () => {
        navigate('/student/request');
    };

    const firstName = profile?.fullName?.split(' ')[0] || 'Student';

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">

            {/* Sidebar */}
            <StudentSidebar />

            {/* Main */}
            <div className="flex-1 flex flex-col md:ml-64">

                {/* Topbar */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
                    <h2 className="text-lg font-semibold pl-12 md:pl-0">Dashboard</h2>

                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={handleNewRequest}
                            className="bg-[#F63049] text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm flex items-center gap-2 hover:bg-[#e12a40] transition"
                        >
                            <FaPlus /> <span className="hidden sm:inline">New Request</span>
                        </button>
                        <FaBell className="text-gray-500 cursor-pointer" />
                    </div>
                </header>

                {/* Content */}
                <main className="p-4 md:p-6 space-y-4 md:space-y-6">

                    {/* Welcome */}
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-[#111F35]">Dashboard</h1>
                        {loading ? (
                            <p className="text-sm md:text-base text-gray-500">Loading...</p>
                        ) : (
                            <p className="text-sm md:text-base text-gray-500">
                                Welcome back, {firstName}! Here's what's happening today.
                            </p>
                        )}
                    </div>

                    {/* Stats */}
                    <StatsCards />

                    {/* Main grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                        {/* Active Request (Animated) */}
                        <ActiveRequest />

                        {/* Tips */}
                        <TipsCard />
                    </div>

                    {/* Bottom grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Recent Activity – wider */}
                        <div className="lg:col-span-2">
                            <RecentActivity />
                        </div>

                        {/* Upcoming Schedule – narrower */}
                        <div className="lg:col-span-1">
                            <UpcomingSchedule />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;
