import React, { useState, useEffect } from "react";
import { FaSave, FaMapMarkerAlt, FaClock, FaBook, FaLanguage, FaMoneyBillWave, FaUser, FaStar, FaBolt } from "react-icons/fa";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import volunteerService from "../../services/volunteerService";
import lastMinuteService from "../../services/lastMinuteService";
import API_BASE_URL from "../../config/api";

const VolunteerProfile = () => {
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [lastMinuteAvailable, setLastMinuteAvailable] = useState(false);
    const [lastMinuteStats, setLastMinuteStats] = useState({
        lastMinuteCount: 0,
        isHero: false
    });

    // Personal information state
    const [personalInfo, setPersonalInfo] = useState({
        fullName: '',
        phone: '',
        dateOfBirth: '',
        volunteerType: 'free',
        hourlyRate: 0
    });

    // Availability state
    const [availability, setAvailability] = useState({
        monday: { morning: false, afternoon: false, evening: false },
        tuesday: { morning: false, afternoon: false, evening: false },
        wednesday: { morning: false, afternoon: false, evening: false },
        thursday: { morning: false, afternoon: false, evening: false },
        friday: { morning: false, afternoon: false, evening: false },
        saturday: { morning: false, afternoon: false, evening: false },
        sunday: { morning: false, afternoon: false, evening: false },
    });

    const [skills, setSkills] = useState({
        subjects: [],
        languages: [],
    });

    const [location, setLocation] = useState({
        city: "",
        state: "",
        remoteAvailable: false,
    });

    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        completedAssignments: 0
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await volunteerService.getProfile();
                const statsData = await volunteerService.getStats();
                const lastMinuteStatsData = await lastMinuteService.getVolunteerLastMinuteStats();

                setProfile(data);
                setStats(statsData);
                setLastMinuteAvailable(data.lastMinuteAvailable || false);
                setLastMinuteStats(lastMinuteStatsData.stats || {});

                // Populate form fields with fetched data
                if (data) {
                    setPersonalInfo({
                        fullName: data.fullName || '',
                        phone: data.phone || '',
                        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
                        volunteerType: data.volunteerType || 'free',
                        hourlyRate: data.hourlyRate || 0
                    });

                    setLocation({
                        city: data.city || '',
                        state: data.state || '',
                        remoteAvailable: data.remoteAvailable || false
                    });

                    setSkills({
                        subjects: data.subjects || [],
                        languages: data.languages || []
                    });

                    setAvailability(data.availability || {
                        monday: { morning: false, afternoon: false, evening: false },
                        tuesday: { morning: false, afternoon: false, evening: false },
                        wednesday: { morning: false, afternoon: false, evening: false },
                        thursday: { morning: false, afternoon: false, evening: false },
                        friday: { morning: false, afternoon: false, evening: false },
                        saturday: { morning: false, afternoon: false, evening: false },
                        sunday: { morning: false, afternoon: false, evening: false }
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            const updates = {
                ...personalInfo,
                ...location,
                subjects: skills.subjects,
                languages: skills.languages,
                availability
            };

            await volunteerService.updateProfile(updates);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message);
        }
    };

    const handleLastMinuteToggle = async (value) => {
        try {
            await lastMinuteService.updateLastMinuteAvailability(value);
            setLastMinuteAvailable(value);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            console.error('Error updating last minute availability:', err);
            setError(err.message);
        }
    };

    const toggleAvailability = (day, period) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [period]: !prev[day][period]
            }
        }));
    };

    const addSkill = (type, skill) => {
        if (skill && !skills[type].includes(skill)) {
            setSkills(prev => ({
                ...prev,
                [type]: [...prev[type], skill]
            }));
        }
    };

    const removeSkill = (type, skill) => {
        setSkills(prev => ({
            ...prev,
            [type]: prev[type].filter(s => s !== skill)
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setPhotoFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = async () => {
        if (!photoFile) {
            alert('Please select a photo first');
            return;
        }

        try {
            setUploadingPhoto(true);
            const result = await volunteerService.uploadProfilePhoto(photoFile);

            // Update profile with new photo
            setProfile(prev => ({
                ...prev,
                profilePicture: result.profilePicture
            }));

            // Clear photo states
            setPhotoFile(null);
            setPhotoPreview(null);

            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 3000);
        } catch (err) {
            console.error("Error uploading photo:", err);
            alert("Failed to upload photo: " + err.message);
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <VolunteerSidebar />

            <div className="flex-1 md:ml-64">
                {/* Top Bar */}
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Volunteer Profile</span>
                </div>

                <div className="p-4 md:p-10 max-w-6xl mx-auto">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F63049]"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <p className="font-medium">Error loading profile</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {!loading && (
                        <>
                            <h1 className="text-2xl font-bold text-[#111F35] mb-6">My Profile</h1>

                            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 space-y-8">
                                <section>
                                    <h2 className="text-lg font-semibold text-[#111F35] mb-4 flex items-center gap-2">
                                        <FaUser className="text-[#F63049]" />
                                        Profile Picture
                                    </h2>
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                        <div className="flex flex-col items-center gap-3">
                                            {/* Avatar Display */}
                                            {photoPreview || profile?.profilePicture ? (
                                                <img
                                                    src={photoPreview || `${API_BASE_URL.replace('/api/v1', '')}${profile.profilePicture}`}
                                                    alt="Profile"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F63049] to-[#d9283f] text-white flex items-center justify-center text-3xl font-semibold">
                                                    {profile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V'}
                                                </div>
                                            )}

                                            {/* Upload Controls */}
                                            <div className="flex flex-col items-center gap-2">
                                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoChange}
                                                        className="hidden"
                                                    />
                                                    Choose Photo
                                                </label>

                                                {photoFile && (
                                                    <button
                                                        onClick={handlePhotoUpload}
                                                        disabled={uploadingPhoto}
                                                        className="bg-[#F63049] hover:bg-[#e12a40] text-white px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                                                    >
                                                        {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Upload your profile picture</p>
                                            <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Rating & Performance Stats */}
                                <section>
                                    <h2 className="text-lg font-semibold text-[#111F35] mb-4 flex items-center gap-2">
                                        <FaStar className="text-[#F63049]" />
                                        Rating & Performance
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                                            <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-bold text-[#F63049]">
                                                    {stats.averageRating.toFixed(1)}
                                                </span>
                                                <div className="flex text-yellow-500 text-xl">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star}>
                                                            {star <= Math.round(stats.averageRating) ? '⭐' : '☆'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                                            <p className="text-3xl font-bold text-blue-600">{stats.totalReviews}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                            <p className="text-sm text-gray-600 mb-1">Completed Assignments</p>
                                            <p className="text-3xl font-bold text-green-600">{stats.completedAssignments}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Personal Information */}
                                <section>
                                    <h2 className="text-lg font-semibold text-[#111F35] mb-4 flex items-center gap-2">
                                        <FaBook className="text-[#F63049]" />
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField
                                            label="Full Name"
                                            type="text"
                                            value={personalInfo.fullName}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                                        />
                                        <InputField
                                            label="Email Address"
                                            type="email"
                                            value={JSON.parse(localStorage.getItem('user') || '{}').email || ''}
                                            disabled={true}
                                        />
                                        <InputField
                                            label="Phone Number"
                                            type="tel"
                                            value={personalInfo.phone}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                        />
                                        <InputField
                                            label="Date of Birth"
                                            type="date"
                                            value={personalInfo.dateOfBirth}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                                        />
                                    </div>
                                </section>

                                {/* Payment Preferences */}
                                <section>
                                    <h2 className="text-lg font-semibold text-[#111F35] mb-4 flex items-center gap-2">
                                        <FaMoneyBillWave className="text-[#F63049]" />
                                        Volunteering Preferences
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Volunteering Type</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="volunteerType"
                                                        value="free"
                                                        checked={personalInfo.volunteerType === 'free'}
                                                        onChange={(e) => setPersonalInfo({ ...personalInfo, volunteerType: e.target.value })}
                                                        className="w-4 h-4 text-[#F63049] focus:ring-[#F63049]"
                                                    />
                                                    <span className="text-sm text-gray-700">Free (Volunteer)</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="volunteerType"
                                                        value="paid"
                                                        checked={personalInfo.volunteerType === 'paid'}
                                                        onChange={(e) => setPersonalInfo({ ...personalInfo, volunteerType: e.target.value })}
                                                        className="w-4 h-4 text-[#F63049] focus:ring-[#F63049]"
                                                    />
                                                    <span className="text-sm text-gray-700">Paid Service</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hourly Rate (₹)
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Enter hourly rate (e.g., 200)"
                                                value={personalInfo.hourlyRate}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, hourlyRate: Number(e.target.value) })}
                                                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F63049] focus:border-transparent"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Leave blank if volunteering for free</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Location Settings */}
                                <section>
                                    <h2 className="text-lg font-semibold text-[#111F35] mb-4 flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-[#F63049]" />
                                        Location
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField
                                            label="City"
                                            type="text"
                                            value={location.city}
                                            onChange={(e) => setLocation({ ...location, city: e.target.value })}
                                        />
                                        <InputField
                                            label="State"
                                            type="text"
                                            value={location.state}
                                            onChange={(e) => setLocation({ ...location, state: e.target.value })}
                                        />
                                        <div className="md:col-span-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={location.remoteAvailable}
                                                    onChange={(e) => setLocation({ ...location, remoteAvailable: e.target.checked })}
                                                    className="w-4 h-4 text-[#F63049] rounded focus:ring-[#F63049]"
                                                />
                                                <span className="text-sm text-gray-700">Available for remote volunteering</span>
                                            </label>
                                        </div>
                                    </div>
                                </section>

                                {/* Skills */}
                                <section>
                                    <h2 className="text-lg font-semibold text-[#111F35] mb-4 flex items-center gap-2">
                                        <FaBook className="text-[#F63049]" />
                                        Skills & Expertise
                                    </h2>

                                    {/* Subjects */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {skills.subjects.map(subject => (
                                                <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                                                    {subject}
                                                    <button onClick={() => removeSkill('subjects', subject)} className="hover:text-blue-900">×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <select
                                            onChange={(e) => {
                                                addSkill('subjects', e.target.value);
                                                e.target.value = '';
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F63049] focus:border-transparent"
                                        >
                                            <option value="">Add a subject...</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="Physics">Physics</option>
                                            <option value="Chemistry">Chemistry</option>
                                            <option value="Biology">Biology</option>
                                            <option value="English">English</option>
                                            <option value="History">History</option>
                                            <option value="Computer Science">Computer Science</option>
                                        </select>
                                    </div>

                                    {/* Languages */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FaLanguage /> Languages
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {skills.languages.map(language => (
                                                <span key={language} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                                                    {language}
                                                    <button onClick={() => removeSkill('languages', language)} className="hover:text-green-900">×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <select
                                            onChange={(e) => {
                                                addSkill('languages', e.target.value);
                                                e.target.value = '';
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F63049] focus:border-transparent"
                                        >
                                            <option value="">Add a language...</option>
                                            <option value="English">English</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Marathi">Marathi</option>
                                            <option value="Tamil">Tamil</option>
                                            <option value="Telugu">Telugu</option>
                                            <option value="Bengali">Bengali</option>
                                        </select>
                                    </div>
                                </section>

                                {/* Availability Settings */}
                                <section>
                                    <h2 className="text-lg font-semibold text-[#111F35] mb-4 flex items-center gap-2">
                                        <FaClock className="text-[#F63049]" />
                                        Availability Schedule
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Day</th>
                                                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Morning<br />(8AM-12PM)</th>
                                                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Afternoon<br />(12PM-5PM)</th>
                                                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Evening<br />(5PM-9PM)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(availability).map(day => (
                                                    <tr key={day} className="border-t">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-700 capitalize">{day}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={availability[day].morning}
                                                                onChange={() => toggleAvailability(day, 'morning')}
                                                                className="w-5 h-5 text-[#F63049] rounded focus:ring-[#F63049] cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={availability[day].afternoon}
                                                                onChange={() => toggleAvailability(day, 'afternoon')}
                                                                className="w-5 h-5 text-[#F63049] rounded focus:ring-[#F63049] cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={availability[day].evening}
                                                                onChange={() => toggleAvailability(day, 'evening')}
                                                                className="w-5 h-5 text-[#F63049] rounded focus:ring-[#F63049] cursor-pointer"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                {/* Last Minute Support */}
                                <section>
                                    <h2 className="text-lg font-semibold text-[#111F35] mb-4 flex items-center gap-2">
                                        <FaBolt className="text-[#F63049]" />
                                        Last Minute Support
                                    </h2>
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">
                                                    Be available for urgent student requests
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Enable this to receive last-minute allocation requests from students who need emergency scribe support. You'll be notified immediately when a student sends you an urgent request in your city.
                                                </p>
                                                {lastMinuteStats.isHero && (
                                                    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-3">
                                                        <p className="text-sm text-yellow-800">
                                                            <strong>⭐ Last Minute Hero!</strong> You've helped {lastMinuteStats.lastMinuteCount} students with emergency requests.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-center gap-3">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={lastMinuteAvailable}
                                                            onChange={(e) => handleLastMinuteToggle(e.target.checked)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-14 h-8 rounded-full transition ${
                                                            lastMinuteAvailable 
                                                                ? 'bg-green-500' 
                                                                : 'bg-gray-300'
                                                        }`}></div>
                                                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition transform ${
                                                            lastMinuteAvailable 
                                                                ? 'translate-x-6' 
                                                                : 'translate-x-0'
                                                        }`}></div>
                                                    </div>
                                                </label>
                                                <span className={`text-sm font-semibold ${
                                                    lastMinuteAvailable 
                                                        ? 'text-green-600' 
                                                        : 'text-gray-600'
                                                }`}>
                                                    {lastMinuteAvailable ? 'ON' : 'OFF'}
                                                </span>
                                                {lastMinuteStats.lastMinuteCount > 0 && (
                                                    <p className="text-xs text-gray-600 mt-2">
                                                        {lastMinuteStats.lastMinuteCount} completed
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        className="bg-[#F63049] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#d9283f] transition flex items-center gap-2"
                                    >
                                        <FaSave />
                                        Save Changes
                                    </button>
                                </div>
                            </div>

                            {/* Success Toast */}
                            {showToast && (
                                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn">
                                    <FaSave />
                                    Profile updated successfully!
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, type, value, defaultValue, onChange, disabled }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F63049] focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
        </div>
    );
};

export default VolunteerProfile;
