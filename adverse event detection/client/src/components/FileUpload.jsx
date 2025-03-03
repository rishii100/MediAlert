import { useState, useRef } from "react";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { FaFileAudio, FaCheckCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [audioURL, setAudioURL] = useState("");
    const [transcription, setTranscription] = useState("");
    const [loadingTranscription, setLoadingTranscription] = useState(false);
    const audioRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("audio/")) {
            toast.error("Please upload a valid audio file!");
            return;
        }

        setFile(selectedFile);
        setAudioURL(URL.createObjectURL(selectedFile));

        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.load();
            }
        }, 100);

        setTranscription("");
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("No file selected!");
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

            setTranscription(response.data.transcription);
            toast.success("File uploaded and transcribed successfully!");
        } catch (error) {
            toast.error("Upload failed. Please try again!");
            console.error(error);
        } finally {
            setUploading(false);
            setLoadingTranscription(false);
        }
    };

    const removeFile = () => {
        if (!file) return;

        setFile(null);
        setAudioURL("");
        setProgress(0);
        setTranscription("");

        if (audioRef.current) {
            audioRef.current.src = "";
        }

        toast.info("Audio file removed.");
    };

    const handleCopyTranscription = () => {
        if (transcription) {
            navigator.clipboard.writeText(transcription);
            toast.success("Transcription copied to clipboard!");
        }
    };

    return (
        <section className="flex flex-col items-center justify-center min-h-screen p-8">
            <ToastContainer position="top-center" autoClose={3000} />

            <div className="bg-gradient-to-r from-sky-100 via-white to-emerald-100 backdrop-blur-lg shadow-2xl rounded-2xl border border-gray-200 p-10 w-full max-w-4xl text-center">
                {/* Title */}
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                    Upload Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">Audio File</span>
                </h2>
                <p className="text-gray-600 text-md mb-6">
                    Convert speech to text effortlessly with AI-powered transcription.
                </p>

                {/* Upload Box */}
                <label className="flex flex-col items-center justify-center w-full h-52 cursor-pointer bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 ease-in-out rounded-xl border-2 border-dashed border-gray-400 p-6 shadow-md">
                    <FiUploadCloud className="text-6xl text-gray-600 mb-3 animate-bounce" />
                    <span className="text-gray-700 font-semibold">Click to upload or drag & drop</span>
                    <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                </label>

                {/* File Details */}
                {file && (
                    <div className="mt-6 flex flex-col items-center bg-white p-5 rounded-xl shadow-lg border border-gray-300">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-x-3">
                                <FaFileAudio className="text-gray-700 text-4xl" />
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
                            className={`mt-4 w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600"
                                }`}
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Upload & Transcribe"}
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
                {loadingTranscription && <p className="mt-4 text-gray-700 animate-pulse">Transcribing...</p>}
                {transcription && (
                    <div className="mt-6 p-6 bg-white shadow-lg rounded-xl text-sm text-gray-800 border border-gray-300">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-x-2">
                            <FaCheckCircle className="text-green-500" /> Transcription:
                        </h3>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                            {transcription}
                        </p>
                        <button
                            onClick={handleCopyTranscription}
                            className="mt-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white text-sm px-6 py-3 rounded-lg shadow-md transition-all duration-300"
                        >
                            📋 Copy Transcription
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FileUpload;
