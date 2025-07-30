require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require ("path");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint untuk memperbaiki tanda baca (tidak berubah)
app.post("/punctuate", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a text formatter. Your job is to add punctuation and proper capitalization to spoken Indonesian text. In the events that sentence structural mistakes are present, you are to fix the sentence to a proper formatting and structure. Your output must ONLY be the corrected text. Do not add any commentary, explanations, or introductory text. If the text is too short (fewer than three words), simply return it unchanged.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });
    const formattedText = response.choices[0].message.content.trim();
    res.json({ formattedText });
  } catch (error) {
    console.error("Error in /punctuate:", error);
    res.status(500).json({ error: "Failed to punctuate text" });
  }
});

// Endpoint untuk ringkasan (tidak berubah)
app.post("/api/summarize-text", async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Teks tidak boleh kosong untuk diringkas." });
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Anda adalah asisten yang sangat baik dalam membuat ringkasan teks dalam Bahasa Indonesia. Buatlah ringkasan yang jelas, padat, dan menangkap poin-poin utama dari teks yang diberikan."
        },
        {
          role: "user",
          content: `Tolong buatkan ringkasan dari teks berikut:\n\n${text}`
        }
      ],
      temperature: 0.5,
    });
    const summary = response.choices[0].message.content.trim();
    res.json({ summary });
  } catch (error) {
    console.error("Error in /api/summarize-text:", error);
    res.status(500).json({ error: "Gagal membuat ringkasan di server." });
  }
});

// --- PENAMBAHAN BARU: Endpoint untuk mendapatkan Topik Pembahasan ---
app.post("/api/get-topic", async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Teks tidak boleh kosong untuk diidentifikasi topiknya." });
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Anda adalah seorang analis ahli. Berdasarkan keseluruhan teks diskusi berikut, identifikasi dan sebutkan topik utama atau persoalan yang sedang dibahas dalam satu kalimat singkat."
        },
        {
          role: "user",
          content: `Identifikasi topik utama dari teks berikut:\n\n${text}`
        }
      ],
      temperature: 0.3,
    });
    const topic = response.choices[0].message.content.trim();
    res.json({ topic }); // Mengirim kembali objek dengan properti 'topic'
  } catch (error) {
    console.error("Error in /api/get-topic:", error);
    res.status(500).json({ error: "Gagal mengidentifikasi topik di server." });
  }
});
// --- AKHIR PENAMBAHAN ---


// Endpoint Deepgram Token (tidak berubah)
app.get("/deepgram-token", (req, res) => {
  res.json({ key: process.env.DG_KEY });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
