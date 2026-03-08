const InputField = ({ label, placeholder, icon }) => (
    <div>
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        <div className="relative">
            <input
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049]"
            />
            {icon && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </span>
            )}
        </div>
    </div>
);

export default InputField;
