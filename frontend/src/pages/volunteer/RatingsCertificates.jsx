import React, { useState, useEffect } from "react";
import { FaStar, FaAward, FaCertificate, FaTrophy } from "react-icons/fa";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import volunteerService from "../../services/volunteerService";

const RatingsCertificates = () => {
    const [ratings, setRatings] = useState([]);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        completedAssignments: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRatingsAndStats();
    }, []);

    const fetchRatingsAndStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch stats
            const statsData = await volunteerService.getStats();
            setStats(statsData);

            // Fetch history (completed assignments with ratings)
            const historyData = await volunteerService.getHistory();

            // Filter only assignments with ratings and feedback
            const ratingsWithFeedback = historyData
                .filter(assignment => assignment.rating && assignment.rating > 0)
                .map(assignment => ({
                    student: assignment.studentId?.fullName || 'Anonymous',
                    rating: assignment.rating,
                    comment: assignment.feedback || 'No feedback provided',
                    date: new Date(assignment.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    subject: assignment.subject
                }));

            setRatings(ratingsWithFeedback);
        } catch (err) {
            console.error("Error fetching ratings:", err);
            setError(err.message || "Failed to load ratings");
        } finally {
            setLoading(false);
        }
    };

    const achievements = [
        {
            title: "Completed Assignments",
            description: `${stats.completedAssignments} assignments completed`,
            icon: <FaAward className="text-orange-600" />
        },
        {
            title: stats.averageRating >= 4.5 ? "5-Star Rated" : "Rated Volunteer",
            description: `Maintained ${stats.averageRating.toFixed(1)} average rating`,
            icon: <FaStar className="text-yellow-500" />
        },
        {
            title: "Active Volunteer",
            description: `${stats.totalReviews} reviews received`,
            icon: <FaCertificate className="text-blue-600" />
        },
    ];

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <VolunteerSidebar />

            <div className="flex-1 md:ml-64">
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Ratings & Certificates</span>
                </div>

                <div className="p-4 md:p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[#111F35] mb-1">Ratings & Achievements</h1>
                        <p className="text-gray-500">Your performance and certifications</p>
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
                            <p className="font-medium">Error loading ratings</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <StatCard
                                    title="Average Rating"
                                    value={stats.averageRating.toFixed(1)}
                                    icon={<FaStar />}
                                    color="yellow"
                                />
                                <StatCard
                                    title="Total Reviews"
                                    value={stats.totalReviews}
                                    icon={<FaStar />}
                                    color="blue"
                                />
                                <StatCard
                                    title="Completed"
                                    value={stats.completedAssignments}
                                    icon={<FaTrophy />}
                                    color="green"
                                />
                                <StatCard
                                    title="Achievements"
                                    value="3"
                                    icon={<FaCertificate />}
                                    color="orange"
                                />
                            </div>

                            {/* Achievements */}
                            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                                <h3 className="text-lg font-semibold text-[#111F35] mb-4">Achievements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {achievements.map((achievement, idx) => (
                                        <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="text-3xl mb-2">{achievement.icon}</div>
                                            <h4 className="font-semibold text-[#111F35] mb-1">{achievement.title}</h4>
                                            <p className="text-sm text-gray-500">{achievement.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Ratings */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-[#111F35] mb-4">
                                    Student Ratings & Feedback
                                </h3>
                                {ratings.length > 0 ? (
                                    <div className="space-y-4">
                                        {ratings.map((rating, idx) => (
                                            <RatingCard key={idx} rating={rating} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <FaStar className="text-4xl mx-auto mb-2 text-gray-300" />
                                        <p>No ratings yet. Complete assignments to receive feedback!</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => {
    const colorMap = {
        yellow: "bg-yellow-50 text-yellow-600",
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600",
        green: "bg-green-50 text-green-600",
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

const RatingCard = ({ rating }) => {
    return (
        <div className="p-4 border border-gray-200 rounded-lg hover:border-[#F63049] transition">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#111F35]">{rating.student}</h4>
                        <span className="text-xs text-gray-500">{rating.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rating.subject}</p>
                    <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                className={i < rating.rating ? "text-yellow-500" : "text-gray-300"}
                            />
                        ))}
                        <span className="ml-2 text-sm font-semibold text-[#F63049]">
                            {rating.rating}/5
                        </span>
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-600 italic">"{rating.comment}"</p>
        </div>
    );
};

export default RatingsCertificates;
