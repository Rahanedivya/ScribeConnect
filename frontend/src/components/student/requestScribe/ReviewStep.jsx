import { useState } from "react";
import { FaArrowLeft, FaInfoCircle, FaTimes } from "react-icons/fa";

const ReviewStep = ({ setStep, onSubmit, formData, loading }) => {
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return "Not set";
        return timeString;
    };

    // Handle submit request - opens Terms modal
    const handleSubmitClick = () => {
        setShowTermsModal(true);
    };

    // Handle final submission after T&C agreement
    const handleFinalSubmit = () => {
        if (termsAgreed) {
            setShowTermsModal(false);
            setTermsAgreed(false); // Reset for next submission
            onSubmit();
        }
    };

    // Handle cancel on terms modal
    const handleCancelTerms = () => {
        setShowTermsModal(false);
        setTermsAgreed(false); // Reset checkbox
    };

    return (
        <>
        <div className="max-w-4xl mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="border-t-4 border-[#F63049] p-8">
                <h3 className="font-semibold text-[#111F35] mb-6">Review Your Request</h3>

                {/* Exam Summary */}
                <div className="mb-8">
                    <h4 className="font-semibold text-[#111F35] mb-4">Exam Summary</h4>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Subject</p>
                            <p className="text-sm text-[#111F35]">{formData.subject || "Not set"}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 mb-1">Type</p>
                            <p className="text-sm text-[#111F35]">{formData.examType || "Not set"}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                            <p className="text-sm text-[#111F35]">
                                {formatDate(formData.examDate)} at {formatTime(formData.examTime)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-sm text-[#111F35]">{formData.duration || "Not set"}</p>
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="mb-8">
                    <h4 className="font-semibold text-[#111F35] mb-4">Requirements</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {formData.requirements || "No requirements specified"}
                        </p>
                    </div>
                </div>

                {/* Notice */}
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <FaInfoCircle className="text-[#F63049] mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700">
                        By submitting this request, you agree to our code of conduct. Our system will immediately start notifying eligible volunteers.
                    </p>
                </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between items-center px-8 py-5 border-t bg-[#FAFBFD]">
                <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 border border-gray-300 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-100 transition"
                    disabled={loading}
                >
                    <FaArrowLeft />
                    Back
                </button>

                <button
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={loading}
                    className={`bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        'Submit Request'
                    )}
                </button>
            </div>
        </div>

        {/* Terms and Conditions Modal */}
        {showTermsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-[#111F35]">Terms and Conditions</h2>
                        <button
                            onClick={handleCancelTerms}
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Modal Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <div className="text-sm text-gray-700 space-y-4">
                            <h3 className="font-semibold text-[#111F35] text-base">1. Eligibility & Authenticity</h3>
                            <p>
                                I confirm that I am eligible to request a scribe as per my institution or examination authority guidelines.
                            </p>
                            <p>
                                I declare that all disability information and supporting documents provided by me are genuine and valid.
                            </p>
                            <p>
                                I understand that submission of false information may lead to cancellation of my request and further disciplinary action.
                            </p>

                            <h3 className="font-semibold text-[#111F35] text-base">2. Accuracy of Exam Details</h3>
                            <p>
                                I confirm that the exam subject, date, time, duration, and center details entered by me are accurate.
                            </p>
                            <p>
                                I understand that incorrect details may result in volunteer unavailability or examination issues.
                            </p>
                            <p>
                                I agree to immediately update the platform if there are any changes in the examination schedule.
                            </p>

                            <h3 className="font-semibold text-[#111F35] text-base">3. Role of the Volunteer (Scribe)</h3>
                            <p>
                                I understand that the volunteer will only write what I dictate during the examination.
                            </p>
                            <p>
                                I agree that the volunteer is not responsible for answering, interpreting, or solving questions.
                            </p>
                            <p>
                                I accept full responsibility for all answers written in the examination.
                            </p>

                            <h3 className="font-semibold text-[#111F35] text-base">4. Academic Integrity</h3>
                            <p>
                                I agree not to misuse the scribe facility for any unfair advantage.
                            </p>
                            <p>
                                I understand that any violation of examination rules may result in cancellation of my exam or request.
                            </p>
                            <p>
                                I agree to follow all rules prescribed by the examination authority.
                            </p>

                            <h3 className="font-semibold text-[#111F35] text-base">5. Conduct & Respect</h3>
                            <p>
                                I agree to treat the assigned volunteer with dignity and respect.
                            </p>
                            <p>
                                I will not engage in harassment, discrimination, or inappropriate behavior.
                            </p>
                            <p>
                                I understand that misconduct may result in permanent suspension from the platform.
                            </p>

                            <h3 className="font-semibold text-[#111F35] text-base">6. Privacy & Communication</h3>
                            <p>
                                I agree not to misuse the volunteer’s personal information.
                            </p>
                            <p>
                                I understand that communication must remain professional and exam-related.
                            </p>
                            <p>
                                I acknowledge that the platform may store my request details for operational and safety purposes.
                            </p>

                            <h3 className="font-semibold text-[#111F35] text-base">7. Cancellation & Responsibility</h3>
                            <p>
                                I agree to cancel my request as early as possible if the exam is postponed or no longer required.
                            </p>
                            <p>
                                I understand that repeated last-minute cancellations may affect future request approvals.
                            </p>
                            <p>
                                I acknowledge that the platform acts only as a connection medium and is not responsible for decisions made by examination authorities.
                            </p>

                            <h3 className="font-semibold text-[#111F35] text-base">8. Final Declaration</h3>
                            <p>
                                I confirm that I have read, understood, and agreed to all the above terms before submitting my request.
                            </p>

                            <p className="text-xs text-gray-500 pt-4">
                                By checking the box below, you acknowledge that you have read, understood, and agree to all terms and conditions outlined above.
                            </p>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="border-t border-gray-200 px-8 py-5 bg-[#FAFBFD]">
                        <div className="mb-5">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={termsAgreed}
                                    onChange={(e) => setTermsAgreed(e.target.checked)}
                                    className="w-5 h-5 accent-[#F63049] cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">
                                    I agree to the Terms and Conditions
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancelTerms}
                                className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={!termsAgreed}
                                className={`bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition ${
                                    termsAgreed
                                        ? 'hover:bg-green-700'
                                        : 'opacity-50 cursor-not-allowed'
                                }`}
                            >
                                Agree & Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default ReviewStep;
