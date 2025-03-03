import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { createClient } from "@deepgram/sdk";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

app.post("/api/upload", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log(`Received file: ${req.file.originalname}`);

        const audioBuffer = fs.readFileSync(req.file.path);

        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioBuffer,
            {
                model: "nova-3",
                smart_format: true,
            }
        );

        if (error) {
            console.error("Deepgram API Error:", error);
            return res.status(500).json({ error: "Failed to transcribe audio" });
        }

        const transcription = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "No transcription available";

        console.log("Transcription Complete:", transcription);

        fs.unlinkSync(req.file.path);

        res.json({ transcription });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "An error occurred while processing the file" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
