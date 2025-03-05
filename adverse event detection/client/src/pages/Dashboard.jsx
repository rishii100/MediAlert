import React, { useState } from "react";
import Header from "../components/Header";
import FileUpload from "../components/FileUpload";
import AnalyzeTranscript from "../components/AnalyzeTranscript";

function Dashboard() {
    const [transcription, setTranscription] = useState("");
    return (
        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 min-h-screen">
            <Header />
            <div className="container mx-auto py-8 px-4">
                <FileUpload setTranscription={setTranscription} />
                <div className="pb-12">
                    <AnalyzeTranscript transcription={transcription} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
