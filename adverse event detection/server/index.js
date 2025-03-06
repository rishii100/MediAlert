import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import { createClient } from "@deepgram/sdk";
import { ComprehendMedicalClient, DetectEntitiesV2Command } from "@aws-sdk/client-comprehendmedical";
import Fuse from 'fuse.js'

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
    "severe headache", "severe dehydration",
    "cancer", "malignant", "tumor", "metastasis", "sepsis", "stroke", "heart attack", "pulmonary embolism",
    "abnormal growth", "malignant growth", "cancerous", "growth in lungs", "it is malignant", "hasn't spread extensively",
    "diabetes", "high sugar levels", "kidney problems", "nerve damage", "heart disease",
    "chronic kidney disease", "chronic liver disease", "copd", "asthma",
    "bronchiectasis", "bronchopulmonary dysplasia", "interstitial lung disease",
    "pulmonary hypertension", "cystic fibrosis", "dementia",
    "down syndrome", "immunocompromised", "hiv", "obesity",
    "pregnancy", "sickle cell disease", "thalassemia", "organ transplant",
    "cerebrovascular disease", "substance use disorder", "tuberculosis",
    "mental health conditions", "schizophrenia", "bipolar disorder",
    "severe depression", "parkinsons disease", "cerebral palsy",
    "multiple sclerosis", "motor neurone disease", "spinal muscular atrophy",
    "alpha-1 antitrypsin deficiency", "pulmonary fibrosis"
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
            const fdaResponse = await axios.get("https://api.fda.gov/drug/event.json?limit=10");
            fdaReports = fdaResponse.data.results.map(report => ({
                safetyreportid: report.safetyreportid,
                serious: report.serious,
                drug: report.patient?.drug?.[0]?.medicinalproduct?.toLowerCase() || "Unknown",
                reactions: report.patient?.reaction?.map(r => r.reactionmeddrapt.toLowerCase()) || []
            }));
        } catch (error) {
            console.error("⚠️ FDA API Error:", error.message);
        }

        //fuzzy string match config
        const fuseOptions = {
            keys: ['text'],
            threshold: 0.2
        };

        // Find matches
        const matchedEvents = [];

        for (const entity of extractedEntities) {
            for (const report of fdaReports) {
                const fuse = new Fuse(report.reactions, fuseOptions);
                const results = fuse.search(entity.text);

                if (results.length > 0) {
                    matchedEvents.push({
                        symptom: entity.text,
                        category: entity.category,
                        drug: report.drug,
                        safetyreportid: report.safetyreportid,
                        serious: report.serious,
                        reaction: results[0].item
                    });
                }
            }
        }

        // Risk Calculation
        const highRiskConditions = extractedEntities.filter(entity =>
            HIGH_RISK_CONDITIONS.includes(entity.text)
        );

        let riskScore;
        if (highRiskConditions.length === 0) {
            riskScore = 0;
        } else if (highRiskConditions.length === 1) {
            riskScore = 30;
        } else if (highRiskConditions.length === 2) {
            riskScore = 60;
        } else if (highRiskConditions.length === 3) {
            riskScore = 70;
        } else if (highRiskConditions.length === 4) {
            riskScore = 80;
        } else {
            riskScore = 100;
        }

        const riskLevel = riskScore >= 80 ? "High" : riskScore >= 60 ? "Moderate" : riskScore >= 30 ? "Low" : "Minimal";

        res.json({
            patientName,
            extractedEntities,
            riskScore,
            riskLevel,
            highRiskConditions: highRiskConditions.map(condition => condition.text),
            fdaMatches: matchedEvents
        });
    } catch (error) {
        console.error("🔥 Error:", error);
        res.status(500).json({ error: error.message || "Failed to analyze text" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
