import { FaChevronDown } from "react-icons/fa";

const SelectField = ({ label, options, defaultOption = "Select type" }) => (
    <div>
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        <div className="relative">
            <select className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F63049]">
                <option>{defaultOption}</option>
                {options ? (
                    options.map((opt, idx) => <option key={idx}>{opt}</option>)
                ) : (
                    <>
                        <option>Midterm</option>
                        <option>Final</option>
                        <option>Quiz</option>
                        <option>Assignment</option>
                    </>
                )}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
        </div>
    </div>
);

export default SelectField;
