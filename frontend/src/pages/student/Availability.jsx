import React, { useState, useEffect } from "react";
import StudentSidebar from "../../components/student/StudentSidebar";
import { FaStar, FaEnvelope, FaPhone, FaWhatsapp, FaFilter, FaSearch, FaMapMarkerAlt, FaTrophy, FaMedal, FaAward, FaClock, FaBook, FaHandHoldingHeart, FaRupeeSign } from "react-icons/fa";
import studentService from "../../services/studentService";
import API_BASE_URL from "../../config/api";

const Availability = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSubject, setFilterSubject] = useState("All");
    const [filterLanguage, setFilterLanguage] = useState("All");

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const fetchVolunteers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await studentService.getAvailableVolunteers();
            setVolunteers(data);
        } catch (err) {
            console.error("Error fetching volunteers:", err);
            setError(err.message || "Failed to load volunteers");
        } finally {
            setLoading(false);
        }
    };

    // Extract unique subjects and languages from volunteers
    const allSubjects = ["All", ...new Set(volunteers.flatMap(v => v.subjects || []))];
    const allLanguages = ["All", ...new Set(volunteers.flatMap(v => v.languages || []))];

    // Filter volunteers based on search and filters
    const filteredVolunteers = volunteers.filter(volunteer => {
        const matchesSearch = volunteer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            volunteer.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSubject = filterSubject === "All" || volunteer.subjects?.includes(filterSubject);
        const matchesLanguage = filterLanguage === "All" || volunteer.languages?.includes(filterLanguage);

        return matchesSearch && matchesSubject && matchesLanguage;
    });

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <StudentSidebar />

            <div className="flex-1 md:ml-64">
                {/* Top Bar */}
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Available Volunteers</span>
                </div>

                <div className="p-4 md:p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[#111F35] mb-2">Browse Available Volunteers</h1>
                        <p className="text-gray-600">Connect with volunteers who can assist you with your exams</p>
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
                            <p className="font-medium">Error loading volunteers</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && (
                        <>
                            {/* Search and Filters */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Search */}
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or subject..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F63049]"
                                        />
                                    </div>

                                    {/* Subject Filter */}
                                    <div className="relative">
                                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            value={filterSubject}
                                            onChange={(e) => setFilterSubject(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F63049]"
                                        >
                                            {allSubjects.map(subject => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Language Filter */}
                                    <div className="relative">
                                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            value={filterLanguage}
                                            onChange={(e) => setFilterLanguage(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F63049]"
                                        >
                                            {allLanguages.map(language => (
                                                <option key={language} value={language}>{language}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="mb-4 text-gray-600">
                                Showing <span className="font-semibold text-[#111F35]">{filteredVolunteers.length}</span> volunteer{filteredVolunteers.length !== 1 ? 's' : ''}
                            </div>

                            {/* Volunteer Cards Grid */}
                            {filteredVolunteers.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {filteredVolunteers.map(volunteer => (
                                        <VolunteerCard key={volunteer._id} volunteer={volunteer} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                    <div className="text-gray-400 text-5xl mb-4">🔍</div>
                                    <h3 className="text-lg font-semibold text-[#111F35] mb-2">No volunteers found</h3>
                                    <p className="text-gray-600">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ---------------- Helper Functions ---------------- */

// Get achievement badge based on completed assignments
const getAchievementBadge = (completedAssignments) => {
    if (completedAssignments >= 50) {
        return { name: "Gold", icon: <FaTrophy />, color: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white" };
    } else if (completedAssignments >= 20) {
        return { name: "Silver", icon: <FaMedal />, color: "bg-gradient-to-r from-gray-300 to-gray-500 text-white" };
    } else if (completedAssignments >= 5) {
        return { name: "Bronze", icon: <FaAward />, color: "bg-gradient-to-r from-orange-400 to-orange-600 text-white" };
    }
    return null;
};

/* ---------------- Volunteer Card Component ---------------- */

const VolunteerCard = ({ volunteer }) => {
    const [showContact, setShowContact] = useState(false);

    const fullName = volunteer.fullName || 'Unknown';
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    const rating = volunteer.rating || 0;
    const totalReviews = volunteer.totalRatings || 0;
    const subjects = volunteer.subjects || [];  // Changed from skills to subjects
    const languages = volunteer.languages || [];
    const email = volunteer.userId?.email || null;
    const completedAssignments = volunteer.completedAssignments || 0;
    const volunteerType = volunteer.volunteerType || 'free';
    const hourlyRate = volunteer.hourlyRate || 0;
    const location = volunteer.city && volunteer.state ? `${volunteer.city}, ${volunteer.state} ` : 'Location not specified';
    const badge = getAchievementBadge(completedAssignments);

    // Format availability - handle nested object format with day and time slot keys
    let availability = 'Not specified';
    if (volunteer.availability) {
        if (Array.isArray(volunteer.availability)) {
            availability = volunteer.availability.join(', ');
        } else if (typeof volunteer.availability === 'object') {
            // Handle nested structure like {monday: {morning: true, afternoon: false}, ...}
            const availableSlots = [];
            Object.entries(volunteer.availability).forEach(([day, slots]) => {
                if (slots && typeof slots === 'object') {
                    // Check each time slot (morning, afternoon, evening)
                    Object.entries(slots).forEach(([timeSlot, isAvailable]) => {
                        if (isAvailable) {
                            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                            const slotName = timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1);
                            availableSlots.push(`${dayName} ${slotName} `);
                        }
                    });
                } else if (slots === true) {
                    // Handle simple boolean format like {monday: true, tuesday: false}
                    availableSlots.push(day.charAt(0).toUpperCase() + day.slice(1));
                }
            });
            availability = availableSlots.length > 0 ? availableSlots.join(', ') : 'Not specified';
        } else if (typeof volunteer.availability === 'string') {
            availability = volunteer.availability;
        }
    }

    const experience = volunteer.experience || 'Not specified';

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Header with Avatar and Basic Info */}
            <div className="flex items-start gap-4 mb-4">
                {volunteer.profilePicture ? (
                    <img
                        src={`${API_BASE_URL.replace('/api/v1', '')}${volunteer.profilePicture} `}
                        alt={fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-[#F63049] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                        {initials}
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-[#111F35]">{fullName}</h3>
                        {badge && (
                            <span className={`${badge.color} text - xs px - 2 py - 1 rounded - full font - semibold flex items - center gap - 1`}>
                                {badge.icon}
                                <span>{badge.name}</span>
                            </span>
                        )}
                    </div>

                    {/* Volunteering Type */}
                    <div className="mb-2">
                        {volunteerType === 'paid' ? (
                            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full inline-flex items-center gap-1">
                                <FaRupeeSign /> Paid Service - ₹{hourlyRate}/hr
                            </span>
                        ) : (
                            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-flex items-center gap-1">
                                <FaHandHoldingHeart /> Free Volunteering
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
                                    size={14}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-[#111F35]">{rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <FaMapMarkerAlt className="text-[#F63049]" size={12} />
                        <span>{location}</span>
                    </div>

                    <p className="text-sm text-gray-600">{experience} of experience • {completedAssignments} assignments completed</p>
                </div>
            </div>

            {/* Subjects/Skills */}
            {subjects.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">EXPERTISE & SKILLS</p>
                    <div className="flex flex-wrap gap-2">
                        {subjects.map(subject => (
                            <span key={subject} className="px-3 py-1 bg-red-50 text-[#F63049] rounded-lg text-xs border border-red-200 font-medium">
                                {subject}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">LANGUAGES</p>
                    <div className="flex flex-wrap gap-2">
                        {languages.map(language => (
                            <span key={language} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs border border-blue-200">
                                {language}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Availability */}
            <div className="mb-4 pb-4 border-b">
                <p className="text-xs font-semibold text-gray-600 mb-1">AVAILABILITY</p>
                <p className="text-sm text-[#111F35]">{availability}</p>
            </div>

            {/* Contact Information */}
            <div>
                <button
                    onClick={() => setShowContact(!showContact)}
                    className="w-full bg-[#F63049] text-white py-2.5 rounded-lg hover:bg-[#e12a40] transition font-medium mb-3"
                >
                    {showContact ? "Hide Contact Info" : "Show Contact Info"}
                </button>

                {showContact && (volunteer.phone || email) && (
                    <div className="space-y-2 bg-gray-50 rounded-lg p-4 animate-fadeIn">
                        {email && (
                            <ContactItem
                                icon={FaEnvelope}
                                label="Email"
                                value={email}
                                href={`mailto:${email} `}
                            />
                        )}
                        {volunteer.phone && (
                            <>
                                <ContactItem
                                    icon={FaPhone}
                                    label="Phone"
                                    value={volunteer.phone}
                                    href={`tel:${volunteer.phone} `}
                                />
                                <ContactItem
                                    icon={FaWhatsapp}
                                    label="WhatsApp"
                                    value={volunteer.phone}
                                    href={`https://wa.me/${volunteer.phone.replace(/[^0-9]/g, '')}`}
                                    color="text-green-600"
                                />
                            </>
                        )}
                    </div >
                )}
            </div >
        </div >
    );
};

/* ---------------- Contact Item Component ---------------- */

const ContactItem = ({ icon: Icon, label, value, href, color = "text-[#F63049]" }) => ( // eslint-disable-line no-unused-vars
    <div className="flex items-center gap-3">
        <Icon className={`${color} flex-shrink-0`} size={16} />
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <a href={href} className={`text-sm ${color} hover:underline truncate block`}>
                {value}
            </a>
        </div>
    </div>
);

export default Availability;
