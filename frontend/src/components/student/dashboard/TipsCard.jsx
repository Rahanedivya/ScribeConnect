import React, { useState } from "react";
import { FaBookOpen, FaTimes, FaCloudUploadAlt, FaSpinner, FaTrash } from "react-icons/fa";
import studentService from "../../../services/studentService";

const TipsCard = () => {
    const [showModal, setShowModal] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState("");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleOpenModal = async () => {
        setShowModal(true);
        setLoadingRequests(true);
        setMessage({ type: "", text: "" });
        try {
            const data = await studentService.getRequests();
            // Filter for pending or accepted requests
            // Filter for pending or accepted requests and deduplicate
            const activeRequests = data.filter(r =>
                ['pending', 'accepted', 'in-progress'].includes(r.status)
            );

            // Remove duplicates based on _id
            const uniqueRequests = Array.from(new Map(activeRequests.map(item => [item._id, item])).values());

            setRequests(uniqueRequests);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setMessage({ type: "error", text: err.message || "Failed to load requests" });
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedRequest || !file) {
            setMessage({ type: "error", text: "Please select a request and a file" });
            return;
        }

        setUploading(true);
        setMessage({ type: "", text: "" });

        try {
            await studentService.uploadRequestMaterials(selectedRequest, file);
            setMessage({ type: "success", text: "Material uploaded successfully!" });
            setFile(null);
            setTimeout(() => {
                setShowModal(false);
                setMessage({ type: "", text: "" });
            }, 2000);
        } catch (err) {
            console.error("Error uploading material:", err);
            setMessage({ type: "error", text: err.message || "Upload failed" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <div className="bg-[#F63049] rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between h-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <FaBookOpen className="text-xl" />
                    <h3 className="text-lg font-semibold">Tips</h3>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed mb-6 opacity-95">
                    Did you know? You can upload your reference material ahead of time to
                    help your scribe prepare better.
                </p>

                {/* Button */}
                <button
                    onClick={handleOpenModal}
                    className="bg-white text-[#F63049] font-medium py-2.5 rounded-xl hover:bg-gray-100 transition"
                >
                    Upload Materials
                </button>
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-fadeIn">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>

                        <h3 className="text-xl font-bold text-[#111F35] mb-4 flex items-center gap-2">
                            <FaCloudUploadAlt className="text-[#F63049]" />
                            Upload Reference Material
                        </h3>

                        {message.text && (
                            <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {loadingRequests ? (
                            <div className="text-center py-8 text-gray-500">
                                <FaSpinner className="animate-spin mx-auto mb-2" />
                                Loading requests...
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <p>No active requests found.</p>
                                <p className="text-sm mt-1">Create a request first to upload materials.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Request
                                    </label>
                                    <select
                                        value={selectedRequest}
                                        onChange={(e) => setSelectedRequest(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F63049] focus:outline-none"
                                    >
                                        <option value="">-- Select a request --</option>
                                        {requests.map(req => (
                                            <option key={req._id} value={req._id}>
                                                {req.subject} - {new Date(req.examDate).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Existing Materials List */}
                                {selectedRequest && (() => {
                                    const req = requests.find(r => r._id === selectedRequest);
                                    if (req && req.materials && req.materials.length > 0) {
                                        return (
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Current Materials</h4>
                                                <ul className="space-y-2">
                                                    {req.materials.map((mat, idx) => {
                                                        const filename = mat.split('/').pop();
                                                        return (
                                                            <li key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-200">
                                                                <span className="truncate text-gray-700 pr-2">{filename}</span>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (window.confirm('Delete this file?')) {
                                                                            try {
                                                                                await studentService.deleteRequestMaterial(selectedRequest, filename);
                                                                                // Refresh requests
                                                                                const updatedRequests = await studentService.getRequests();
                                                                                const unique = Array.from(new Map(updatedRequests.map(item => [item._id, item])).values());
                                                                                setRequests(unique);
                                                                                setMessage({ type: "success", text: "File deleted successfully" });
                                                                            } catch (err) {
                                                                                alert(err.message);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                                    title="Delete file"
                                                                >
                                                                    <FaTrash size={14} />
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select File
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-[#F63049] file:text-white
                                            hover:file:bg-[#d9283f]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        PDF, DOCX, JPG, PNG (Max 10MB)
                                    </p>
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !selectedRequest || !file}
                                    className="w-full bg-[#111F35] text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default TipsCard;
