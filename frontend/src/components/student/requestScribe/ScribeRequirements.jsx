import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const ScribeRequirements = ({ setStep, formData, updateFormData }) => {
    const handleNext = () => {
        // Validate before moving to next step
        if (!formData.requirements) {
            alert("Please fill in the requirements before continuing");
            return;
        }
        setStep(3);
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="border-t-4 border-[#F63049] p-8">
                <h3 className="font-semibold text-[#111F35] mb-6">Scribe Requirements</h3>

                <div className="space-y-6">
                    {/* Specific Requirements */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Specific Requirements <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            placeholder="E.g., Need someone familiar with scientific notation, or need slow dictation support."
                            rows={6}
                            value={formData.requirements}
                            onChange={(e) => updateFormData('requirements', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049] resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Please provide detailed requirements to help us match you with the best volunteer
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between items-center px-8 py-5 border-t bg-[#FAFBFD]">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 border border-gray-300 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-100 transition"
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

export default ScribeRequirements;
