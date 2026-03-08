import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useState } from "react";


const durations = ["1 hour", "2 hours", "3 hours", "4 hours"];

const ExamDetails = ({ setStep, formData, updateFormData }) => {
    const [selectedDuration, setSelectedDuration] = useState(formData.duration || null);

    const handleNext = () => {
        // Validate before moving to next step
        if (!formData.subject || !formData.examType || !formData.examDate || !formData.examTime || !selectedDuration) {
            alert("Please fill in all fields before continuing");
            return;
        }
        setStep(2);
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="border-t-4 border-[#F63049] p-8">
                <h3 className="font-semibold text-[#111F35] mb-6">Exam Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Subject / Course Name</label>
                        <input
                            placeholder="e.g. Advanced Calculus II"
                            value={formData.subject}
                            onChange={(e) => updateFormData('subject', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049]"
                        />
                    </div>

                    {/* Exam Type */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Exam Type</label>
                        <select
                            value={formData.examType}
                            onChange={(e) => updateFormData('examType', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049]"
                        >
                            <option value="">Select type</option>
                            <option value="Midterm">Midterm</option>
                            <option value="Final">Final</option>
                            <option value="Quiz">Quiz</option>
                            <option value="Assignment">Assignment</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Date</label>
                        <input
                            type={formData.examDate ? "date" : "text"}
                            placeholder="Select Date"
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => {
                                if (!e.target.value) e.target.type = "text";
                            }}
                            value={formData.examDate}
                            onChange={(e) => updateFormData('examDate', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049]"
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Time</label>
                        <input
                            type={formData.examTime ? "time" : "text"}
                            placeholder="Select Time"
                            onFocus={(e) => (e.target.type = "time")}
                            onBlur={(e) => {
                                if (!e.target.value) e.target.type = "text";
                            }}
                            value={formData.examTime}
                            onChange={(e) => updateFormData('examTime', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049]"
                        />
                    </div>
                </div>

                {/* Duration */}
                <div className="mt-8">
                    <p className="text-sm font-medium text-gray-600 mb-3">Duration (Hours)</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {durations.map((d) => (
                            <button
                                key={d}
                                onClick={() => {
                                    setSelectedDuration(d);
                                    updateFormData('duration', d);
                                }}
                                type="button"
                                className={`border rounded-xl py-3 text-sm font-medium transition
                                ${selectedDuration === d
                                        ? "border-[#F63049] bg-red-50 text-[#F63049]"
                                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between items-center px-8 py-5 border-t bg-[#FAFBFD]">
                <button
                    type="button"
                    className="flex items-center gap-2 border border-gray-300 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-100 transition opacity-50 cursor-not-allowed"
                    disabled
                >
                    <FaArrowLeft />
                    Back
                </button>

                <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-[#F63049] text-white px-6 py-2 rounded-lg hover:bg-[#e12a40] transition"
                >
                    Next
                    <FaArrowRight />
                </button>
            </div>
        </div>
    );
};

export default ExamDetails;