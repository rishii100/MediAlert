import { useState } from "react";
import {
    FaUser, FaStethoscope, FaPills, FaClipboardList,
    FaExclamationTriangle, FaHeartbeat, FaInfoCircle, FaNotesMedical, FaSpinner
} from "react-icons/fa";
import Swal from 'sweetalert2';
import axios from "axios";

const HIGH_RISK_CONDITIONS = [
    "breathing difficulty", "chest pain", "unconsciousness",
    "severe allergic reaction", "high fever", "low oxygen levels",
    "severe headache", "severe dehydration"
];

const AnalyzeTranscript = ({ transcription }) => {
    const [patientName, setPatientName] = useState("");
    const [medicalEntities, setMedicalEntities] = useState([]);
    const [riskLevel, setRiskLevel] = useState(null);
    const [riskScore, setRiskScore] = useState(null);
    const [fdaMatches, setFdaMatches] = useState([]);
    const [criticalSymptoms, setCriticalSymptoms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    const [analysisComplete, setAnalysisComplete] = useState(false);

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

    const handleAnalyze = async () => {
        if (!transcription?.trim()) {
            showToast("No transcription available for analysis!", 'error');
            return;
        }
        if (!patientName.trim()) {
            showToast("Please enter the patient's name.", 'error');
            return;
        }

        setLoading(true);
        setMedicalEntities([]);
        setRiskLevel(null);
        setRiskScore(null);
        setFdaMatches([]);
        setCriticalSymptoms([]);
        setAnalysisError(null);
        setAnalysisComplete(false);

        try {
            const response = await axios.post("http://localhost:5000/api/analyze", {
                patientName,
                transcription
            });

            if (!response.data) {
                throw new Error("No response from the server.");
            }

            const extractedEntities = response.data?.extractedEntities || [];
            const detectedHighRisk = extractedEntities
                .filter(entity => HIGH_RISK_CONDITIONS.includes(entity.text.toLowerCase()))
                .map(entity => entity.text);

            setMedicalEntities(extractedEntities);
            setRiskLevel(response.data.riskLevel || "Unknown");
            setRiskScore(response.data.riskScore || 0);
            setFdaMatches(response.data.fdaMatches || []);
            setCriticalSymptoms(detectedHighRisk);
            setAnalysisComplete(true);

            if (extractedEntities.length === 0) {
                showToast("No medical entities detected.", 'warning');
            } else {
                showToast(`Analysis complete for ${patientName}!`);
            }
        } catch (error) {
            setAnalysisError("Failed to analyze transcript.");
            showToast("Failed to analyze transcript.", 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Categorize entities
    const categorizedEntities = {
        "MEDICAL_CONDITION": [],
        "MEDICATION": [],
        "TEST_TREATMENT_PROCEDURE": [],
        "ANATOMY": []
    };

    medicalEntities.forEach(entity => {
        if (categorizedEntities[entity.category]) {
            categorizedEntities[entity.category].push(entity);
        }
    });

    const handleDownloadReport = () => {
        if (!analysisComplete) {
            showToast("No analysis to download.", 'warning');
            return;
        }

        const reportContent = `
    ====================================
        ADVERSE EVENT ANALYSIS REPORT
    ====================================
    
    Patient Name: ${patientName}
    Date & Time: ${new Date().toLocaleString()}
    
    ------------------------------------
    🩺 RISK ASSESSMENT
    ------------------------------------
    - Risk Level: ${riskLevel}
    - Risk Score: ${riskScore}%
    
    ------------------------------------
    🚨 CRITICAL SYMPTOMS DETECTED
    ------------------------------------
    ${criticalSymptoms.length > 0 ? criticalSymptoms.map((symptom, i) => `  ${i + 1}. ${symptom}`).join("\n") : "  None"}
    
    ------------------------------------
    ⚠️ HIGH-RISK CONDITIONS
    ------------------------------------
    ${fdaMatches.length > 0 ? fdaMatches.map((match, i) => `  ${i + 1}. ${match.symptom} (${match.category})`).join("\n") : "  None"}
    
    ------------------------------------
    📌 MEDICAL ENTITIES IDENTIFIED
    ------------------------------------
    ${medicalEntities.length > 0 ?
                medicalEntities.map((entity, i) => `  ${i + 1}. ${entity.text} - [${entity.category}]`).join("\n")
                : "  None"}
    
    ====================================
    END OF REPORT
    ====================================
    `;

        const blob = new Blob([reportContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${patientName}_Analysis_Report.txt`;
        link.click();
    };

    return (
        <div className="bg-white mt-4 shadow-2xl rounded-2xl border border-gray-200 p-4 sm:p-6 w-full max-w-4xl mx-auto">
            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4 sm:mb-6">
                <FaNotesMedical className="text-blue-500" /> Adverse Event Detection
            </h3>

            {/* Patient Name Input */}
            <div className="flex items-center bg-white p-3 sm:p-4 rounded-lg shadow-md mb-4 sm:mb-6 w-full hover:shadow-lg transition-shadow duration-300">
                <FaUser className="text-gray-500 mr-3" />
                <input
                    type="text"
                    placeholder="Enter Patient Name"
                    className="w-full outline-none text-gray-700 placeholder-gray-400"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                />
            </div>

            {/* Analyze Button */}
            <button
                className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-white transition-all duration-300 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                onClick={handleAnalyze}
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" /> Analyzing...
                    </div>
                ) : "Analyze Transcript"}
            </button>

            {/* Risk Level & Score Analysis */}
            {riskLevel && (
                <div className={`mt-4 sm:mt-6 p-4 sm:p-6 border rounded-xl shadow-md ${riskLevel === "High" ? "bg-red-100 border-red-500 text-red-800" :
                    riskLevel === "Moderate" ? "bg-yellow-100 border-yellow-500 text-yellow-800" :
                        "bg-green-100 border-green-500 text-green-800"
                    }`}>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaHeartbeat /> Risk Level: {riskLevel}
                    </h3>
                    <div className="w-full bg-gray-300 rounded-full h-4 mt-3 relative">
                        <div
                            className={`h-4 rounded-full transition-all duration-500 ${riskLevel === "High" ? "bg-red-500" :
                                riskLevel === "Moderate" ? "bg-yellow-500" :
                                    "bg-green-500"
                                }`}
                            style={{ width: `${riskScore}%` }}
                        ></div>
                    </div>
                    <p className="mt-2 text-sm">Risk Score: <strong>{riskScore}%</strong></p>
                </div>
            )}

            {/* Critical Symptoms Alert */}
            {criticalSymptoms.length > 0 && (
                <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-red-100 border border-red-500 text-red-800 shadow-md rounded-xl">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaExclamationTriangle className="text-red-600" /> ⚠️ Critical Symptoms Detected:
                    </h3>
                    <ul className="list-disc list-inside text-sm mt-2">
                        {criticalSymptoms.map((symptom, index) => (
                            <li key={index} className="pl-2">{symptom}</li>
                        ))}
                    </ul>
                    <p className="text-xs mt-2">⚠️ Immediate medical attention is required.</p>
                </div>
            )}

            {/* High-Risk Conditions Alert */}
            {fdaMatches.length > 0 && (
                <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-red-100 border border-red-500 text-red-800 shadow-md rounded-xl">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaExclamationTriangle className="text-red-600" /> ⚠️ High-Risk Conditions Detected:
                    </h3>
                    <ul className="list-disc list-inside text-sm mt-2">
                        {fdaMatches.map((match, index) => (
                            <li key={index} className="pl-2">{match.symptom} ({match.category})</li>
                        ))}
                    </ul>
                    <p className="text-xs mt-2">⚠️ Immediate medical attention may be required.</p>
                </div>
            )}

            {/* Categorized Medical Insights - Grid Layout */}
            {analysisComplete && medicalEntities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 sm:mt-6">
                    {Object.keys(categorizedEntities).map((category) => (
                        categorizedEntities[category].length > 0 && (
                            <div key={category} className="p-4 sm:p-6 bg-white shadow-lg rounded-xl text-gray-800 border border-gray-300 hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-x-2">
                                    {category === "MEDICAL_CONDITION" && <FaClipboardList className="text-red-500" />}
                                    {category === "MEDICATION" && <FaPills className="text-blue-500" />}
                                    {category === "TEST_TREATMENT_PROCEDURE" && <FaStethoscope className="text-green-500" />}
                                    {category === "ANATOMY" && <FaInfoCircle className="text-yellow-500" />}
                                    {category.replace("_", " ")}
                                </h3>
                                <ul className="list-disc list-inside text-sm">
                                    {categorizedEntities[category].map((entity, index) => (
                                        <li key={index}>{entity.text}</li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* No Medical Entities Detected */}
            {analysisComplete && medicalEntities.length === 0 && (
                <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-yellow-100 border border-yellow-500 text-yellow-800 shadow-md rounded-xl">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaInfoCircle className="text-yellow-600" /> No Medical Entities Detected
                    </h3>
                    <p className="text-sm mt-2">The provided text does not appear to be medically relevant. Please ensure the transcription contains medical information.</p>
                </div>
            )}

            {analysisComplete && (
                <button
                    className="mt-4 sm:mt-6 w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-all duration-300"
                    onClick={handleDownloadReport}
                >
                    Download Report
                </button>
            )}
        </div>
    );
};

export default AnalyzeTranscript;
