import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/student/StudentSidebar";
import studentService from "../../services/studentService";
import authService from "../../services/authService";
import API_BASE_URL from "../../config/api";

const Profile = () => {
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const navigate = useNavigate();

    // Fetch profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const currentUser = authService.getUser();
                const profileData = await studentService.getProfile();

                setUser(currentUser);
                setProfile(profileData);
                // Initialize form data with profile data, ensuring all fields have values
                setFormData({
                    fullName: profileData?.fullName || '',
                    phone: profileData?.phone || '',
                    dateOfBirth: profileData?.dateOfBirth || '',
                    university: profileData?.university || '',
                    course: profileData?.course || '',
                    disabilityType: profileData?.disabilityType || '',
                    certificateNumber: profileData?.certificateNumber || '',
                    specificNeeds: profileData?.specificNeeds || '',
                    currentYear: profileData?.currentYear || '',
                    examFrequency: profileData?.examFrequency || '',
                    preferredSubjects: profileData?.preferredSubjects || [],
                    academicNotes: profileData?.academicNotes || '',
                    preferredLanguage: profileData?.preferredLanguage || '',
                    notificationMethod: profileData?.notificationMethod || '',
                    preferredTime: profileData?.preferredTime || '',
                    city: profileData?.city || '',
                    state: profileData?.state || ''
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError(err.message);
                setLoading(false);

                // If unauthorized, redirect to login
                if (err.message.includes("token") || err.message.includes("authorized")) {
                    navigate("/login");
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            console.log('Saving profile with data:', formData);
            await studentService.updateProfile(formData);

            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 3000);

            // Refresh profile data after successful update
            const updatedProfile = await studentService.getProfile();
            setProfile(updatedProfile);
            // Reinitialize formData with all fields
            setFormData({
                fullName: updatedProfile?.fullName || '',
                phone: updatedProfile?.phone || '',
                dateOfBirth: updatedProfile?.dateOfBirth || '',
                university: updatedProfile?.university || '',
                course: updatedProfile?.course || '',
                disabilityType: updatedProfile?.disabilityType || '',
                certificateNumber: updatedProfile?.certificateNumber || '',
                specificNeeds: updatedProfile?.specificNeeds || '',
                currentYear: updatedProfile?.currentYear || '',
                examFrequency: updatedProfile?.examFrequency || '',
                preferredSubjects: updatedProfile?.preferredSubjects || [],
                academicNotes: updatedProfile?.academicNotes || '',
                preferredLanguage: updatedProfile?.preferredLanguage || '',
                notificationMethod: updatedProfile?.notificationMethod || '',
                preferredTime: updatedProfile?.preferredTime || '',
                city: updatedProfile?.city || '',
                state: updatedProfile?.state || ''
            });
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile: " + err.message);
        }
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
            const result = await studentService.uploadProfilePhoto(photoFile);

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

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return "??";
        const parts = name.split(" ");
        return parts.length >= 2
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F9FC] flex">
                <StudentSidebar />
                <div className="flex-1 md:ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F63049] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F7F9FC] flex">
                <StudentSidebar />
                <div className="flex-1 md:ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">Error loading profile: {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#F63049] text-white px-6 py-2 rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <StudentSidebar />

            <div className="flex-1 md:ml-64">
                {/* Top Bar */}
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Profile</span>
                </div>

                <div className="p-4 md:p-10 max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-[#111F35] mb-6">My Profile</h1>

                    {/* Profile Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                            <div className="flex flex-col items-center gap-3">
                                {/* Avatar Display */}
                                {photoPreview || profile?.profilePicture ? (
                                    <img
                                        src={photoPreview || `${API_BASE_URL.replace('/api/v1', '')}${profile.profilePicture}`}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-[#F63049] text-white flex items-center justify-center text-2xl font-semibold">
                                        {getInitials(profile?.fullName)}
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
                                <h2 className="text-lg font-semibold text-[#111F35]">{profile?.fullName || "N/A"}</h2>
                                <p className="text-gray-500 text-sm">Student Account</p>
                                <p className="text-gray-500 text-xs mt-1">{user?.email || "N/A"}</p>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="mb-8">
                            <h3 className="font-semibold text-[#111F35] mb-4 pb-2 border-b">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Full Name" value={formData?.fullName || ""} onChange={(v) => handleInputChange('fullName', v)} />
                                <Input label="Email Address" value={user?.email || ""} disabled />
                                <Input label="Phone Number" value={formData?.phone || ""} onChange={(v) => handleInputChange('phone', v)} />
                                <Input
                                    label="Date of Birth"
                                    type="date"
                                    value={formData?.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ""}
                                    onChange={(v) => handleInputChange('dateOfBirth', v)}
                                />
                                <Input label="University / College" value={formData?.university || ""} onChange={(v) => handleInputChange('university', v)} />
                                <Input label="Course / Program" value={formData?.course || ""} onChange={(v) => handleInputChange('course', v)} />
                                <Input label="City" value={formData?.city || ""} onChange={(v) => handleInputChange('city', v)} />
                                <Input label="State" value={formData?.state || ""} onChange={(v) => handleInputChange('state', v)} />
                            </div>
                        </div>

                        {/* Disability Information */}
                        <div className="mb-8">
                            <h3 className="font-semibold text-[#111F35] mb-4 pb-2 border-b">Disability Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Type of Disability"
                                    value={formData?.disabilityType || ""}
                                    options={[
                                        "Visual Impairment",
                                        "Hearing Impairment",
                                        "Motor Disability",
                                        "Learning Disability",
                                        "Multiple Disabilities",
                                        "Other"
                                    ]}
                                    onChange={(v) => handleInputChange('disabilityType', v)}
                                />
                                <Input label="Disability Certificate Number" value={formData?.certificateNumber || ""} onChange={(v) => handleInputChange('certificateNumber', v)} />

                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Specific Needs / Accommodations Required</label>
                                    <textarea
                                        value={formData?.specificNeeds || ""}
                                        onChange={(e) => handleInputChange('specificNeeds', e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Academic Requirements */}
                        <div className="mb-8">
                            <h3 className="font-semibold text-[#111F35] mb-4 pb-2 border-b">Academic Requirements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Current Year / Semester" value={formData?.currentYear || ""} onChange={(v) => handleInputChange('currentYear', v)} />
                                <Select
                                    label="Exam Type Frequency"
                                    value={formData?.examFrequency || ""}
                                    options={["Weekly", "Monthly", "Quarterly", "Semester-wise"]}
                                    onChange={(v) => handleInputChange('examFrequency', v)}
                                />

                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Preferred Subjects</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(profile?.preferredSubjects || []).map((subject, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-red-50 text-[#F63049] rounded-lg text-sm border border-red-200"
                                            >
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Additional Academic Notes</label>
                                    <textarea
                                        value={formData?.academicNotes || ""}
                                        onChange={(e) => handleInputChange('academicNotes', e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="mb-8">
                            <h3 className="font-semibold text-[#111F35] mb-4 pb-2 border-b">Communication Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Preferred Language"
                                    value={formData?.preferredLanguage || ""}
                                    options={["English", "Hindi", "Marathi", "Tamil", "Telugu"]}
                                    onChange={(v) => handleInputChange('preferredLanguage', v)}
                                />
                                <Select
                                    label="Notification Method"
                                    value={formData?.notificationMethod || ""}
                                    options={["Email", "SMS", "WhatsApp", "All"]}
                                    onChange={(v) => handleInputChange('notificationMethod', v)}
                                />
                                <Select
                                    label="Preferred Time for Sessions"
                                    value={formData?.preferredTime || ""}
                                    options={["Morning", "Afternoon", "Evening", "Flexible"]}
                                    onChange={(v) => handleInputChange('preferredTime', v)}
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end gap-3">
                            <button className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-100 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-[#F63049] text-white px-6 py-2.5 rounded-lg hover:bg-[#e12a40] transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slideIn">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Profile updated successfully!</span>
                </div>
            )}
        </div>
    );
};

/* ---------------- Reusable Components ---------------- */

const Input = ({ label, value, type = "text", disabled = false, onChange }) => (
    <div>
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disabled}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049] ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
        />
    </div>
);

const Select = ({ label, options, value, onChange }) => (
    <div>
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F63049]"
        >
            {options.map((o) => (
                <option key={o} value={o}>{o}</option>
            ))}
        </select>
    </div>
);

export default Profile;
