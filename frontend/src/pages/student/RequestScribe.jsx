import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/student/StudentSidebar";
import ExamDetails from "../../components/student/requestScribe/ExamDetails";
import ScribeRequirements from "../../components/student/requestScribe/ScribeRequirements";
import ReviewStep from "../../components/student/requestScribe/ReviewStep";
import requestService from "../../services/requestService";

const RequestScribe = () => {
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Form data state
    const [formData, setFormData] = useState({
        subject: "",
        examType: "",
        examDate: "",
        examTime: "",
        duration: "",
        requirements: ""
    });

    // Update form data
    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate required fields
            if (!formData.subject || !formData.examType || !formData.examDate ||
                !formData.examTime || !formData.duration || !formData.requirements) {
                setError("Please fill in all required fields");
                setLoading(false);
                return;
            }

            // Submit to backend
            await requestService.createRequest(formData);

            // Show success modal
            setShowSuccess(true);

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate("/student/dashboard");
            }, 2000);

        } catch (err) {
            console.error("Error submitting request:", err);
            setError(err.message || "Failed to submit request. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            <StudentSidebar />

            <div className="flex-1 md:ml-64">
                {/* Top bar */}
                <div className="h-14 border-b bg-white flex items-center px-4 md:px-6 text-[#111F35] font-semibold">
                    <span className="pl-12 md:pl-0">Request Scribe</span>
                </div>

                <div className="p-4 md:p-10">
                    {/* Center header */}
                    <div className="text-center mb-6 md:mb-10">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#111F35] mb-2">Request a Scribe</h1>
                        <p className="text-sm md:text-base text-gray-500">
                            Fill in the details below to get matched with a verified volunteer.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Stepper */}
                    <Stepper currentStep={step} />

                    {/* Conditional Step Rendering */}
                    {step === 1 && (
                        <ExamDetails
                            setStep={setStep}
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}
                    {step === 2 && (
                        <ScribeRequirements
                            setStep={setStep}
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}
                    {step === 3 && (
                        <ReviewStep
                            setStep={setStep}
                            onSubmit={handleSubmit}
                            formData={formData}
                            loading={loading}
                        />
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && <SuccessModal />}
        </div>
    );
};

/* ---------------- Components ---------------- */

const Stepper = ({ currentStep }) => {
    const steps = ["Exam Details", "Scribe Requirements", "Review"];

    return (
        <div className="flex items-center justify-center max-w-3xl mx-auto mb-6 md:mb-8 overflow-x-auto pb-2">
            {steps.map((label, index) => {
                const stepNum = index + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;

                return (
                    <React.Fragment key={label}>
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div
                                className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full text-xs md:text-sm font-semibold
                  ${isCompleted
                                        ? "bg-[#F63049] text-white"
                                        : isActive
                                            ? "bg-[#F63049] text-white"
                                            : "bg-gray-100 text-gray-400"
                                    }`}
                            >
                                {isCompleted ? (
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    stepNum
                                )}
                            </div>

                            <span
                                className={`mt-2 text-xs md:text-sm whitespace-nowrap ${isActive || isCompleted ? "text-[#F63049] font-medium" : "text-gray-400"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>

                        {index !== steps.length - 1 && (
                            <div className={`w-12 md:w-28 h-[2px] mx-2 md:mx-4 mb-6 flex-shrink-0 ${isCompleted ? "bg-[#F63049]" : "bg-gray-200"
                                }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const SuccessModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-scaleIn">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            {/* Message */}
            <h3 className="text-2xl font-bold text-[#111F35] mb-2">Request Submitted!</h3>
            <p className="text-gray-600 mb-4">
                Your scribe request has been successfully submitted. We're notifying qualified volunteers now.
            </p>

            {/* Loading indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-[#F63049] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#F63049] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#F63049] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    </div>
);

export default RequestScribe;
