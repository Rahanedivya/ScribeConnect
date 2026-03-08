import React, { useState, useEffect } from "react";
import { FaBell, FaCheckCircle, FaClock, FaStar, FaClipboardList } from "react-icons/fa";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import volunteerService from "../../services/volunteerService";

const VolunteerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [lastMinuteAvailable, setLastMinuteAvailable] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [stats, setStats] = useState({
        totalRequests: 0,
        activeAssignments: 0,
        pendingRequests: 0,
        averageRating: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch volunteer profile
            const profileData = await volunteerService.getProfile();
            setProfile(profileData);
            setLastMinuteAvailable(profileData.lastMinuteAvailable || false);

            // Fetch incoming requests (pending)
            const incomingData = await volunteerService.getIncomingRequests();
            const pendingRequests = incomingData.length;

            // Fetch active assignments
            const activeData = await volunteerService.getActiveAssignments();
            const activeAssignments = activeData.length;

            // Fetch history for completed assignments
            const historyData = await volunteerService.getHistory();
            const completedAssignments = historyData.filter(r => r.status === 'completed').length;

            // Calculate stats
            const totalRequests = pendingRequests + activeAssignments + completedAssignments;
            const averageRating = profileData.rating || 0;

            setStats({
                totalRequests,
                activeAssignments,
                pendingRequests,
                averageRating
            });

            // Prepare recent activity
            const activities = [];

            // Add recent incoming requests
            incomingData.slice(0, 2).forEach(req => {
                const timeAgo = getTimeAgo(new Date(req.createdAt));
                activities.push({
                    id: req._id,
                    title: `New request from ${req.studentId?.fullName || 'Student'}`,
                    time: timeAgo,
                    type: 'new'
                });
            });

            // Add recent completed assignments
            historyData.slice(0, 1).forEach(req => {
                const timeAgo = getTimeAgo(new Date(req.updatedAt));
                activities.push({
                    id: req._id,
                    title: `Completed assignment for ${req.examName}`,
                    time: timeAgo,
                    type: 'completed'
                });
            });

            setRecentActivity(activities.slice(0, 3));

            // Prepare upcoming assignments
            const upcoming = activeData
                .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
                .slice(0, 3)
                .map(req => ({
                    id: req._id,
                    subject: req.examName,
                    student: req.studentId?.fullName || 'Student',
                    date: new Date(req.examDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    time: new Date(req.examDate).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    })
                }));

            setUpcomingAssignments(upcoming);

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
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
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const handleToggleLastMinute = async () => {
        try {
            setToggleLoading(true);
            const newStatus = !lastMinuteAvailable;
            await volunteerService.toggleLastMinuteAvailability(newStatus);
            setLastMinuteAvailable(newStatus);
        } catch (err) {
            console.error('Error toggling last-minute availability:', err);
            alert('Failed to update last-minute availability. Please try again.');
        } finally {
            setToggleLoading(false);
        }
    };

    const firstName = profile?.fullName?.split(' ')[0] || 'Volunteer';

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <VolunteerSidebar />

            <div className="flex-1 md:ml-64">
                {/* Topbar */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
                    <h2 className="text-lg font-semibold pl-12 md:pl-0">Volunteer Dashboard</h2>
                    <div className="flex items-center gap-3 md:gap-4">
                        <FaBell className="text-gray-500 cursor-pointer" />
                    </div>
                </header>

                {/* Content */}
                <main className="p-4 md:p-6 space-y-4 md:space-y-6">
                    {/* Welcome */}
                    <div>
                        {loading ? (
                            <>
                                <h1 className="text-xl md:text-2xl font-bold text-[#111F35]">Loading...</h1>
                                <p className="text-sm md:text-base text-gray-500">Please wait</p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-xl md:text-2xl font-bold text-[#111F35]">
                                    Welcome Back, {firstName}!
                                </h1>
                                <p className="text-sm md:text-base text-gray-500">Here's your volunteering overview</p>
                            </>
                        )}
                    </div>

                    {/* Last Minute Support Banner */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-orange-200 rounded-xl p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-[#111F35] mb-1">Last Minute Support</h3>
                                <p className="text-sm text-gray-600">
                                    {lastMinuteAvailable 
                                        ? '✓ You are currently available for urgent requests'
                                        : 'You are not available for urgent requests right now'}
                                </p>
                            </div>
                            <button
                                onClick={handleToggleLastMinute}
                                disabled={toggleLoading}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    lastMinuteAvailable
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                                } disabled:opacity-50`}
                            >
                                {toggleLoading ? 'Updating...' : (lastMinuteAvailable ? 'Turn Off' : 'Turn On')}
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={<FaClipboardList />}
                            title="Total Requests"
                            value={loading ? "..." : stats.totalRequests.toString()}
                            color="blue"
                        />
                        <StatCard
                            icon={<FaCheckCircle />}
                            title="Active Assignments"
                            value={loading ? "..." : stats.activeAssignments.toString()}
                            color="green"
                        />
                        <StatCard
                            icon={<FaClock />}
                            title="Pending Requests"
                            value={loading ? "..." : stats.pendingRequests.toString()}
                            color="orange"
                        />
                        <StatCard
                            icon={<FaStar />}
                            title="Average Rating"
                            value={loading ? "..." : stats.averageRating.toFixed(1)}
                            color="yellow"
                        />
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-[#111F35] mb-4">Recent Activity</h3>
                        {loading ? (
                            <p className="text-gray-500 text-sm">Loading...</p>
                        ) : recentActivity.length === 0 ? (
                            <p className="text-gray-500 text-sm">No recent activity</p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <ActivityItem key={activity.id} {...activity} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Assignments */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-[#111F35] mb-4">Upcoming Assignments</h3>
                        {loading ? (
                            <p className="text-gray-500 text-sm">Loading...</p>
                        ) : upcomingAssignments.length === 0 ? (
                            <p className="text-gray-500 text-sm">No upcoming assignments</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingAssignments.map((assignment) => (
                                    <AssignmentCard key={assignment.id} {...assignment} />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600",
        yellow: "bg-yellow-50 text-yellow-600",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-[#111F35]">{value}</h3>
        </div>
    );
};

const ActivityItem = ({ title, time, type }) => {
    const typeColors = {
        new: "bg-blue-100 text-blue-600",
        completed: "bg-green-100 text-green-600",
        rating: "bg-yellow-100 text-yellow-600",
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${typeColors[type]}`}></div>
            <div className="flex-1">
                <p className="text-sm font-medium text-[#111F35]">{title}</p>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
};

const AssignmentCard = ({ subject, student, date, time }) => {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div>
                <h4 className="font-semibold text-[#111F35]">{subject}</h4>
                <p className="text-sm text-gray-500">Student: {student}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium text-[#111F35]">{date}</p>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
