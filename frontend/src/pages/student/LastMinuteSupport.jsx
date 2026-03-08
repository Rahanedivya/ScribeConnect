import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaStar, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import StudentSidebar from '../../components/student/StudentSidebar';
import studentService from '../../services/studentService';
import lastMinuteService from '../../services/lastMinuteService';
import API_BASE_URL from '../../config/api';

const StudentLastMinute = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [studentCity, setStudentCity] = useState('');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestData, setRequestData] = useState({
        subject: '',
        examType: '',
        examDate: '',
        examTime: '',
        duration: '1 hour',
        requirements: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [recentRequests, setRecentRequests] = useState([]);

    useEffect(() => {
        fetchStudentData();
        fetchRecentRequests();
    }, []);

    useEffect(() => {
        if (studentCity) {
            fetchAvailableVolunteers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentCity]);

    const fetchStudentData = async () => {
        try {
            const profile = await studentService.getProfile();
            if (profile && profile.city) {
                setStudentCity(profile.city);
            }
        } catch (err) {
            console.error('Error fetching student data:', err);
            setError('Failed to load student information');
        }
    };

    const fetchAvailableVolunteers = async () => {
        try {
            setLoading(true);
            const data = await lastMinuteService.getAvailableVolunteers(studentCity);
            setVolunteers(data.volunteers || data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching volunteers:', err);
            setError('Failed to load available volunteers');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentRequests = async () => {
        try {
            const data = await lastMinuteService.getStudentLastMinuteRequests();
            setRecentRequests(data.requests || data || []);
        } catch (err) {
            console.error('Error fetching recent requests:', err);
        }
    };

    const handleSelectVolunteer = (volunteer) => {
        setSelectedVolunteer(volunteer);
        setShowRequestForm(true);
    };

    const handleRequestChange = (field, value) => {
        setRequestData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        
        if (!requestData.subject || !requestData.examType || !requestData.examDate || !requestData.examTime) {
            setError('Please fill all required fields');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            setSuccess('');

            await lastMinuteService.sendLastMinuteRequest(selectedVolunteer._id, {
                subject: requestData.subject,
                examType: requestData.examType,
                examDate: requestData.examDate,
                examTime: requestData.examTime,
                duration: requestData.duration,
                requirements: requestData.requirements
            });

            setSuccess(`Request sent to ${selectedVolunteer.fullName}! They will respond shortly.`);
            setShowRequestForm(false);
            setRequestData({
                subject: '',
                examType: '',
                examDate: '',
                examTime: '',
                duration: '1 hour',
                requirements: ''
            });
            setSelectedVolunteer(null);

            // Refresh recent requests
            setTimeout(() => {
                fetchRecentRequests();
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to send request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
            declined_by_volunteer: { bg: 'bg-red-100', text: 'text-red-800', label: 'Declined' },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#F7F9FC]">
            <StudentSidebar />

            <div className="flex-1 md:ml-64">
                {/* Top bar */}
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Last Minute Allocation</span>
                </div>

                <div className="p-4 md:p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Last Minute Allocation</h1>
                        <p className="text-gray-600">Find available volunteers for urgent exam support</p>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                            <p className="text-green-700 flex items-center gap-2">
                                <FaCheckCircle /> {success}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className="text-red-700 flex items-center gap-2">
                                <FaExclamationCircle /> {error}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Volunteers List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Available Volunteers in {studentCity}</h2>
                                
                                {loading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <div className="text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F63049] mb-2"></div>
                                            <p className="text-gray-600">Loading volunteers...</p>
                                        </div>
                                    </div>
                                ) : volunteers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FaExclamationCircle className="text-3xl text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">No volunteers available for last minute allocation in your city right now</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {volunteers.map(volunteer => (
                                            <div 
                                                key={volunteer._id} 
                                                className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                                                    selectedVolunteer?._id === volunteer._id 
                                                        ? 'border-[#F63049] bg-red-50' 
                                                        : 'border-gray-200 hover:border-[#F63049]'
                                                }`}
                                                onClick={() => handleSelectVolunteer(volunteer)}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {volunteer.profilePicture ? (
                                                        <img 
                                                            src={`${API_BASE_URL.replace('/api/v1', '')}${volunteer.profilePicture}`}
                                                            alt={volunteer.fullName}
                                                            className="w-16 h-16 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-[#F63049] rounded-full flex items-center justify-center text-white text-lg font-bold">
                                                            {volunteer.fullName?.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="text-lg font-bold text-gray-900">{volunteer.fullName}</h3>
                                                            {volunteer.lastMinuteHero && (
                                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                                    ⭐ Last Minute Hero
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                            <span className="flex items-center gap-1">
                                                                <FaStar className="text-yellow-400" />
                                                                {volunteer.rating?.toFixed(1) || 'N/A'} rating
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaMapMarkerAlt /> {volunteer.city}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaClock /> {volunteer.totalAssignments || 0} assignments
                                                            </span>
                                                        </div>

                                                        {volunteer.subjects && volunteer.subjects.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {volunteer.subjects.slice(0, 3).map((subject, idx) => (
                                                                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                                        {subject}
                                                                    </span>
                                                                ))}
                                                                {volunteer.subjects.length > 3 && (
                                                                    <span className="text-gray-500 text-xs">+{volunteer.subjects.length - 3} more</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        <button 
                                                            onClick={() => handleSelectVolunteer(volunteer)}
                                                            className={`mt-2 px-4 py-2 rounded-lg font-medium transition ${
                                                                selectedVolunteer?._id === volunteer._id
                                                                    ? 'bg-[#F63049] text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {selectedVolunteer?._id === volunteer._id ? 'Selected' : 'Select'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Request Form */}
                        <div className="lg:col-span-1">
                            {showRequestForm && selectedVolunteer ? (
                                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Request Details</h3>
                                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Subject *
                                            </label>
                                            <input 
                                                type="text"
                                                value={requestData.subject}
                                                onChange={(e) => handleRequestChange('subject', e.target.value)}
                                                placeholder="e.g., Mathematics"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F63049]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Exam Type *
                                            </label>
                                            <select 
                                                value={requestData.examType}
                                                onChange={(e) => handleRequestChange('examType', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F63049]"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                <option value="Midterm">Midterm</option>
                                                <option value="Final">Final</option>
                                                <option value="Quiz">Quiz</option>
                                                <option value="Assignment">Assignment</option>
                                                <option value="Presentation">Presentation</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Exam Date *
                                            </label>
                                            <input 
                                                type="date"
                                                value={requestData.examDate}
                                                onChange={(e) => handleRequestChange('examDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F63049]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Exam Time *
                                            </label>
                                            <input 
                                                type="time"
                                                value={requestData.examTime}
                                                onChange={(e) => handleRequestChange('examTime', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F63049]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Duration *
                                            </label>
                                            <select 
                                                value={requestData.duration}
                                                onChange={(e) => handleRequestChange('duration', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F63049]"
                                                required
                                            >
                                                <option value="30 minutes">30 minutes</option>
                                                <option value="1 hour">1 hour</option>
                                                <option value="1.5 hours">1.5 hours</option>
                                                <option value="2 hours">2 hours</option>
                                                <option value="2.5 hours">2.5 hours</option>
                                                <option value="3 hours">3 hours</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Special Requirements
                                            </label>
                                            <textarea 
                                                value={requestData.requirements}
                                                onChange={(e) => handleRequestChange('requirements', e.target.value)}
                                                placeholder="Any specific needs or notes..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F63049] resize-none"
                                                rows="3"
                                            />
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-[#F63049] text-white py-2 rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-400 transition"
                                        >
                                            {submitting ? 'Sending...' : 'Send Request'}
                                        </button>

                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setShowRequestForm(false);
                                                setSelectedVolunteer(null);
                                                setRequestData({
                                                    subject: '',
                                                    examType: '',
                                                    examDate: '',
                                                    examTime: '',
                                                    duration: '1 hour',
                                                    requirements: ''
                                                });
                                            }}
                                            className="w-full border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <p className="text-gray-500 text-center">
                                        Select a volunteer to send a last minute request
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Requests */}
                    {recentRequests.length > 0 && (
                        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Recent Last Minute Requests</h2>
                            <div className="space-y-3">
                                {recentRequests.map(request => (
                                    <div key={request._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{request.subject} - {request.examType}</p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">For:</span> {new Date(request.examDate).toLocaleDateString()} at {request.examTime}
                                            </p>
                                        </div>
                                        {getStatusBadge(request.status)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentLastMinute;
