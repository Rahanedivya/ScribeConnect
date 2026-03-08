import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMapMarkerAlt, FaBook, FaClock, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import authService from "../../services/authService";

const VolunteerSignup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        // Personal Information
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        dateOfBirth: "",

        // Location
        city: "",
        state: "",
        remoteAvailable: false,

        // Skills
        subjects: [],
        languages: [],

        // Availability
        availability: {
            monday: { morning: false, afternoon: false, evening: false },
            tuesday: { morning: false, afternoon: false, evening: false },
            wednesday: { morning: false, afternoon: false, evening: false },
            thursday: { morning: false, afternoon: false, evening: false },
            friday: { morning: false, afternoon: false, evening: false },
            saturday: { morning: false, afternoon: false, evening: false },
            sunday: { morning: false, afternoon: false, evening: false },
        }
    });

    const [subjectInput, setSubjectInput] = useState("");
    const [languageInput, setLanguageInput] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const addSubject = (subject) => {
        if (subject && !formData.subjects.includes(subject)) {
            setFormData({
                ...formData,
                subjects: [...formData.subjects, subject]
            });
        }
    };

    const removeSubject = (subject) => {
        setFormData({
            ...formData,
            subjects: formData.subjects.filter(s => s !== subject)
        });
    };

    const addLanguage = (language) => {
        if (language && !formData.languages.includes(language)) {
            setFormData({
                ...formData,
                languages: [...formData.languages, language]
            });
        }
    };

    const removeLanguage = (language) => {
        setFormData({
            ...formData,
            languages: formData.languages.filter(l => l !== language)
        });
    };

    const toggleAvailability = (day, period) => {
        setFormData({
            ...formData,
            availability: {
                ...formData.availability,
                [day]: {
                    ...formData.availability[day],
                    [period]: !formData.availability[day][period]
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.subjects.length === 0) {
            setError("Please select at least one subject");
            return;
        }

        if (formData.languages.length === 0) {
            setError("Please select at least one language");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Prepare registration data (exclude confirmPassword)
            const { confirmPassword: _, ...registrationData } = formData;

            // Call registration API
            await authService.registerVolunteer(registrationData);

            // Navigate to volunteer dashboard after successful registration
            navigate("/volunteer/dashboard");
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message || "Registration failed. Please try again.");
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-[#F7F9FC] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mb-4 text-[#F63049]">
                        <svg
                            className="w-16 h-16 mx-auto"
                            viewBox="0 0 96 96"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#F63049"
                        >
                            <path d="M77,55.2,75.77,54c-3.43-3.33-7.31-7.11-7.41-12.1a32.31,32.31,0,0,1,.63-6,41,41,0,0,0,.63-5,25.2,25.2,0,0,0-2.23-11.46c-3-6.57-8.74-10.15-17-10.64C36.08,8,19.79,14.1,15.52,29.73a36.22,36.22,0,0,0,4.05,27.68,38.37,38.37,0,0,0,3.87,5.16c.75.89,1.53,1.81,2.24,2.75a41.18,41.18,0,0,1,4.67,7.37,21.55,21.55,0,0,0,3.26,5.5,13,13,0,0,0,1.61,1.54c3.62,2.91,8.41,3.93,12.62,4.66a57.16,57.16,0,0,0,9.61,1,20.25,20.25,0,0,0,7.42-1.2A5.13,5.13,0,0,0,68,79.36a17.5,17.5,0,0,1,2.06-8.24l.39-.74-3.39-1.71a.14.14,0,0,1-.08-.16.15.15,0,0,1,.12-.14l3-.72a1.76,1.76,0,0,0,1.22-1.06A1.72,1.72,0,0,0,71.21,65a1.81,1.81,0,0,1-.33-1.62c.27-.72,1.26-1.34,2.86-1.79a5.77,5.77,0,0,0,3.47-2.7C78.21,57.07,77.62,55.88,77,55.2Zm-.62,3.2a4.74,4.74,0,0,1-2.86,2.23C71.53,61.18,70.34,62,70,63a2.77,2.77,0,0,0,.41,2.51.74.74,0,0,1,.07.69.78.78,0,0,1-.54.46l-3,.72a1.16,1.16,0,0,0-.25,2.16l2.48,1.25A18.75,18.75,0,0,0,67,79.45a4.1,4.1,0,0,1-2.52,3.81c-4.66,1.84-11,1.11-16.5.15-4.08-.71-8.73-1.7-12.16-4.46a11,11,0,0,1-1.48-1.42,20.61,20.61,0,0,1-3.12-5.26,42.28,42.28,0,0,0-4.77-7.55c-.73-1-1.51-1.89-2.27-2.79a38.2,38.2,0,0,1-3.78-5A35.23,35.23,0,0,1,16.49,30C20.6,14.91,36.43,9,50.29,9.82c7.9.47,13.35,3.85,16.19,10.06a24,24,0,0,1,2.14,11,39.76,39.76,0,0,1-.62,4.9A33.71,33.71,0,0,0,67.36,42c.11,5.4,4.15,9.33,7.71,12.80l1.17,1.14C76.48,56.14,77.19,56.86,76.33,58.4Z" fill="#F63049" stroke="#F63049" strokeWidth="1"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-[#111F35]">Volunteer Registration</h1>
                    <p className="text-gray-500 mt-2">Join ScribeConnect as a volunteer</p>
                </div>

                {/* Progress Stepper */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        {[
                            { num: 1, label: "Account", icon: <FaUser /> },
                            { num: 2, label: "Location", icon: <FaMapMarkerAlt /> },
                            { num: 3, label: "Skills", icon: <FaBook /> },
                            { num: 4, label: "Availability", icon: <FaClock /> },
                        ].map((s, idx) => (
                            <div key={s.num} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition ${step >= s.num ? "bg-[#F63049] text-white" : "bg-gray-200 text-gray-500"
                                        }`}>
                                        {s.icon}
                                    </div>
                                    <span className={`text-xs mt-2 ${step >= s.num ? "text-[#F63049] font-semibold" : "text-gray-400"}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < 3 && (
                                    <div className={`h-1 flex-1 mx-2 ${step > s.num ? "bg-[#F63049]" : "bg-gray-200"}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <form onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                <p className="font-medium">Registration Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Step 1: Personal & Account Information */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-[#111F35] mb-4">Personal & Account Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="Full Name"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputField
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputField
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputField
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputField
                                        label="Phone Number"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputField
                                        label="Date of Birth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-[#111F35] mb-4">Location Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputField
                                        label="State"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="remoteAvailable"
                                            checked={formData.remoteAvailable}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#F63049] rounded focus:ring-[#F63049]"
                                        />
                                        <span className="text-sm text-gray-700">Available for remote volunteering</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Skills */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-[#111F35] mb-4">Skills & Expertise</h2>

                                {/* Subjects */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subjects <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.subjects.map(subject => (
                                            <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                                                {subject}
                                                <button type="button" onClick={() => removeSubject(subject)} className="hover:text-blue-900">×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <select
                                        value={subjectInput}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value) {
                                                addSubject(value);
                                                setSubjectInput("");
                                            }
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Languages <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.languages.map(language => (
                                            <span key={language} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                                                {language}
                                                <button type="button" onClick={() => removeLanguage(language)} className="hover:text-green-900">×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <select
                                        value={languageInput}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value) {
                                                addLanguage(value);
                                                setLanguageInput("");
                                            }
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

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Select at least one subject and one language to continue.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Availability Schedule */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-[#111F35] mb-4">Availability Schedule</h2>
                                <p className="text-sm text-gray-600 mb-4">Select the days and times you're available to volunteer</p>

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
                                            {Object.keys(formData.availability).map(day => (
                                                <tr key={day} className="border-t">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-700 capitalize">{day}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.availability[day].morning}
                                                            onChange={() => toggleAvailability(day, 'morning')}
                                                            className="w-5 h-5 text-[#F63049] rounded focus:ring-[#F63049] cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.availability[day].afternoon}
                                                            onChange={() => toggleAvailability(day, 'afternoon')}
                                                            className="w-5 h-5 text-[#F63049] rounded focus:ring-[#F63049] cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.availability[day].evening}
                                                            onChange={() => toggleAvailability(day, 'evening')}
                                                            className="w-5 h-5 text-[#F63049] rounded focus:ring-[#F63049] cursor-pointer"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> You can update your availability anytime from your profile settings.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition ${step === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaArrowLeft /> Previous
                            </button>

                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 bg-[#F63049] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#e12a40] transition"
                                >
                                    Next <FaArrowRight />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#F63049] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#e12a40] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Registering..." : "Complete Registration"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <button
                        onClick={() => navigate("/login")}
                        className="text-[#F63049] font-medium hover:underline"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};

// Reusable Components
const InputField = ({ label, name, type = "text", value, onChange, required, placeholder }) => (
    <div>
        <label className="block text-sm text-gray-600 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049]"
        />
    </div>
);

export default VolunteerSignup;
