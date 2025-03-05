import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import { createClient } from "@deepgram/sdk";
import { ComprehendMedicalClient, DetectEntitiesV2Command } from "@aws-sdk/client-comprehendmedical";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const comprehendMedicalClient = new ComprehendMedicalClient({ region: "us-east-1" });

const HIGH_RISK_CONDITIONS = [
    "breathing difficulty", "chest pain", "unconsciousness",
    "severe allergic reaction", "high fever", "low oxygen levels",
    "severe headache", "severe dehydration"
];

// Transcribe Audio
app.post("/api/upload", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        console.log(`Received file: ${req.file.originalname}`);

        const audioBuffer = fs.readFileSync(req.file.path);
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioBuffer, { model: "nova-3", smart_format: true });

        if (error) {
            console.error("Deepgram API Error:", error);
            return res.status(500).json({ error: "Failed to transcribe audio" });
        }

        const transcription = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "No transcription available";
        fs.unlinkSync(req.file.path);

        res.json({ transcription });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "An error occurred while processing the file" });
    }
});

// Analyze Text with AWS Comprehend Medical & FDA API
app.post("/api/analyze", async (req, res) => {
    try {
        const { patientName, transcription } = req.body;
        if (!transcription) return res.status(400).json({ error: "No transcription provided" });

        console.log(`🔍 Analyzing transcript for patient: ${patientName}`);

        // Extract medical terms using AWS Medical Comprehend
        const command = new DetectEntitiesV2Command({ Text: transcription });
        const response = await comprehendMedicalClient.send(command);

        const extractedEntities = response.Entities
            ? response.Entities.map(entity => ({
                text: entity.Text.toLowerCase(),
                category: entity.Category
            }))
            : []; 

        // Fetch adverse event reports from FDA API
        let fdaReports = [];
        try {
            const fdaResponse = await axios.get("https://api.fda.gov/drug/event.json?limit=5");
            fdaReports = fdaResponse.data.results.flatMap(report => ({
                drug: report.patient?.drug?.[0]?.medicinalproduct?.toLowerCase() || "Unknown",
                reactions: report.patient?.reaction?.map(r => r.reactionmeddrapt.toLowerCase()) || []
            }));
        } catch (error) {
            console.error("⚠️ FDA API Error:", error.message);
        }

        // Find matches
        const matchedEvents = extractedEntities.filter(entity =>
            fdaReports.some(fda => fda.reactions.includes(entity.text))
        );

        // Risk Calculation
        let riskScore = matchedEvents.length * 20;
        if (extractedEntities.some(symptom => HIGH_RISK_CONDITIONS.includes(symptom.text))) riskScore += 30;
        riskScore = Math.min(riskScore, 100); // ✅ FIXED: Ensure max risk score is 100

        const riskLevel = riskScore >= 70 ? "High" : riskScore >= 40 ? "Moderate" : "Low";

        res.json({
            patientName,
            extractedEntities,
            riskScore,
            riskLevel,
            fdaMatches: matchedEvents.map(event => ({
                symptom: event.text,
                category: event.category
            }))
        });
    } catch (error) {
        console.error("🔥 Error:", error);
        res.status(500).json({ error: error.message || "Failed to analyze text" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
