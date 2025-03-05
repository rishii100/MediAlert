import { useState, useRef, useCallback, useEffect } from "react";
import { FiUploadCloud, FiTrash2, FiEdit2, FiSave, FiCopy, FiX } from "react-icons/fi";
import { FaFileAudio, FaCheckCircle, FaSpinner } from "react-icons/fa";
import Swal from 'sweetalert2';
import axios from "axios";

const FileUpload = ({ setTranscription }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [audioURL, setAudioURL] = useState("");
    const [localTranscription, setLocalTranscription] = useState("");
    const [loadingTranscription, setLoadingTranscription] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [originalTranscription, setOriginalTranscription] = useState("");
    const audioRef = useRef(null);
    const transcriptionRef = useRef(null);

    const showToast = (message, type = 'success') => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        Toast.fire({
            icon: type,
            title: message
        });
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        // Validate file type and size
        if (!selectedFile.type.startsWith("audio/")) {
            showToast("Please upload a valid audio file!", 'error');
            return;
        }

        if (selectedFile.size > 50 * 1024 * 1024) {
            showToast("File size must be less than 50MB!", 'error');
            return;
        }

        setFile(selectedFile);
        setAudioURL(URL.createObjectURL(selectedFile));

        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.load();
            }
        }, 100);

        setLocalTranscription("");
    };

    const handleUpload = async () => {
        if (!file) {
            showToast("No file selected!", 'error');
            return;
        }

        setUploading(true);
        setProgress(0);
        setLoadingTranscription(true);

        const formData = new FormData();
        formData.append("audio", file);

        try {
            const response = await axios.post("http://localhost:5000/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            const transcriptionText = response.data.transcription;
            setLocalTranscription(transcriptionText);
            setOriginalTranscription(transcriptionText);
            setTranscription(transcriptionText);
            showToast("File uploaded and transcribed successfully!");
        } catch (error) {
            showToast("Upload failed. Please try again!", 'error');
            console.error(error);
        } finally {
            setUploading(false);
            setLoadingTranscription(false);
        }
    };

    const removeFile = () => {
        if (uploading) {
            showToast("Upload canceled.", 'info');
        }

        setFile(null);
        setAudioURL("");
        setProgress(0);
        setLocalTranscription("");
        setTranscription("");
        setOriginalTranscription("");

        if (audioRef.current) {
            audioRef.current.src = "";
        }

        showToast("Audio file removed.", 'info');
    };

    const handleCopyTranscription = useCallback(async () => {
        if (localTranscription) {
            try {
                await navigator.clipboard.writeText(localTranscription);
                showToast("Transcription copied to clipboard!");
            } catch (error) {
                showToast("Failed to copy transcription.", 'error');
            }
        }
    }, [localTranscription]);

    const handleEditToggle = () => {
        if (isEditing) {
            // Canceling edit
            setLocalTranscription(originalTranscription);
            setIsEditing(false);
        } else {
            // Starting edit
            setIsEditing(true);
        }
    };

    const handleSaveTranscription = () => {
        if (localTranscription.length > 7000) {
            showToast("Transcription exceeds 7000 characters.", 'error');
            return;
        }

        setOriginalTranscription(localTranscription);
        setTranscription(localTranscription);
        setIsEditing(false);
        showToast("Transcription updated!");
    };

    const handleTranscriptionChange = (event) => {
        const text = event.target.value;
        if (text.length <= 7000) {
            setLocalTranscription(text);
        } else {
            showToast("Transcription exceeds 7000 characters.", 'error');
        }
    };

    // Focus the textarea when editing starts
    useEffect(() => {
        if (isEditing && transcriptionRef.current) {
            transcriptionRef.current.focus();
        }
    }, [isEditing]);

    return (
        <section className="bg-gradient-to-r from-sky-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-2xl rounded-2xl border border-gray-200 p-6 sm:p-10 w-full max-w-4xl mx-auto text-center">
                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                    Predict Adverse Medical Events <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">from Phone Calls</span>
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                    Upload a recorded conversation between a patient and a medical agent to identify potential adverse events using AI-powered analysis.
                </p>
                <p className="text-gray-500 text-sm mb-8">
                    Your data is secure and will only be used for analysis purposes.
                </p>

                {/* Upload Box */}
                <label className="flex flex-col items-center justify-center w-full h-48 sm:h-52 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 ease-in-out rounded-xl border-2 border-dashed border-gray-400 p-6 shadow-md">
                    <FiUploadCloud className="text-5xl sm:text-6xl text-gray-600 mb-3 animate-bounce" />
                    <span className="text-gray-700 font-semibold">Click to upload or drag & drop a recorded conversation</span>
                    <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                </label>

                {/* File Details */}
                {file && (
                    <div className="mt-6 flex flex-col items-center bg-white p-4 sm:p-5 rounded-xl shadow-lg border border-gray-300">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-x-3">
                                <FaFileAudio className="text-gray-700 text-3xl sm:text-4xl" />
                                <p className="text-md text-gray-800 font-medium">{file.name}</p>
                            </div>

                            {/* Remove File Button */}
                            <button
                                onClick={removeFile}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md shadow-md transition duration-300 flex items-center gap-x-2 text-sm border border-red-300 hover:border-red-400"
                            >
                                <FiTrash2 className="text-md" />
                                Remove
                            </button>
                        </div>

                        {/* Audio Preview */}
                        {audioURL && (
                            <audio ref={audioRef} controls className="mt-3 w-full">
                                <source src={audioURL} type={file.type} />
                                Your browser does not support the audio element.
                            </audio>
                        )}

                        {/* Upload Button */}
                        <button
                            className={`mt-4 w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 ${uploading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600"
                                }`}
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Upload & Analyze"}
                        </button>

                        {/* Progress Bar */}
                        {uploading && (
                            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-sky-500 h-3 rounded-full transition-all ease-in-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}

                {/* Transcription Display */}
                {loadingTranscription && (
                    <div className="mt-6 flex items-center justify-center gap-x-2 text-gray-700">
                        <FaSpinner className="animate-spin" />
                        <p>Analyzing conversation for adverse events...</p>
                    </div>
                )}
                {localTranscription && (
                    <div className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 shadow-lg rounded-xl text-sm text-gray-800 border border-gray-300">
                        <h3 className="text-base font-medium mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-x-2">
                                <FaCheckCircle className="text-green-500" />
                                Analysis Results
                            </div>
                            <div className="flex items-center gap-x-2">
                                {!isEditing ? (
                                    <button
                                        onClick={handleEditToggle}
                                        className="text-blue-500 hover:text-blue-600 transition-colors duration-300 flex items-center gap-x-1"
                                    >
                                        <FiEdit2 /> Edit
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSaveTranscription}
                                            className="text-green-500 hover:text-green-600 transition-colors duration-300 flex items-center gap-x-1 mr-2"
                                        >
                                            <FiSave /> Save
                                        </button>
                                        <button
                                            onClick={handleEditToggle}
                                            className="text-red-500 hover:text-red-600 transition-colors duration-300 flex items-center gap-x-1"
                                        >
                                            <FiX /> Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </h3>
                        <textarea
                            ref={transcriptionRef}
                            value={localTranscription}
                            onChange={handleTranscriptionChange}
                            className={`w-full text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-inner border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-y 
                                ${isEditing
                                    ? "cursor-text"
                                    : "cursor-not-allowed text-gray-600"}`}
                            rows={8}
                            maxLength={7000}
                            placeholder="Edit the transcription if needed..."
                            readOnly={!isEditing}
                        />
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-gray-500">
                                {localTranscription.length}/7000 characters
                            </span>
                            <button
                                onClick={handleCopyTranscription}
                                className="bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white text-sm px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center gap-x-2"
                            >
                                <FiCopy /> Copy Analysis
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FileUpload;

