
import { GoogleGenAI } from "@google/genai";
import { AssessmentLevel } from "../types";
import { GEMINI_API_KEY } from "../constants";

let aiInstance: GoogleGenAI | null = null;
let currentKey: string | null = null;

// Helper to reset instance
export const resetAiInstance = () => {
    aiInstance = null;
    currentKey = null;
};

// Helper untuk mendapatkan API Key
const getApiKey = (): string => {
  let apiKey = GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("GANTI_DENGAN_API_KEY")) {
      apiKey = localStorage.getItem('gemini_api_key') || "";
  }
  return apiKey;
};

// Helper untuk cek apakah key adalah Groq (dimulai dengan gsk_)
const isGroqKey = (key: string) => key.startsWith('gsk_');

// === GROQ API HANDLER ===
const callGroqApi = async (apiKey: string, prompt: string) => {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                // UPDATED: Menggunakan model Llama 3.3 terbaru karena versi lama sudah dihapus
                model: "llama-3.3-70b-versatile", 
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Groq API Error");
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Gagal menghasilkan deskripsi.";
    } catch (error: any) {
        throw new Error(`Groq Error: ${error.message}`);
    }
};

// === GOOGLE GEMINI HANDLER ===
const getGeminiInstance = (apiKey: string): GoogleGenAI | null => {
  if (!aiInstance || currentKey !== apiKey) {
      try {
        aiInstance = new GoogleGenAI({ apiKey });
        currentKey = apiKey;
      } catch (error) {
        console.error("Failed to initialize GoogleGenAI.", error);
        return null;
      }
  }
  return aiInstance;
};

const handleApiError = (error: any): string => {
    const errMsg = error.message || JSON.stringify(error);
    
    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        return "⚠️ KUOTA HABIS: Batas penggunaan AI harian tercapai. Silakan coba lagi besok atau gunakan Template Offline.";
    }
    
    if (errMsg.includes("API Key") || errMsg.includes("authentication")) {
        return "⚠️ API Key Salah/Tidak Valid. Periksa file constants.ts atau menu Pengaturan.";
    }

    return `Gagal generate: ${errMsg.substring(0, 100)}...`;
};

// --- FITUR TEMPLATE MANUAL (OFFLINE) ---
export const generateTemplateDescription = (
    studentName: string,
    category: string,
    assessmentsData: { tp: string, activity: string, score: AssessmentLevel }[]
): string => {
    const mahir = assessmentsData.filter(a => a.score === AssessmentLevel.MAHIR);
    const cakap = assessmentsData.filter(a => a.score === AssessmentLevel.CAKAP);
    const berkembang = assessmentsData.filter(a => a.score === AssessmentLevel.BERKEMBANG);

    let descParts = [];
    descParts.push(`Pada aspek ${category}, Ananda ${studentName}`);

    if (mahir.length > 0) {
        const activities = mahir.map(a => a.activity.toLowerCase()).join(", ");
        descParts.push(`menunjukkan kemampuan yang sangat baik dalam ${activities}.`);
    }
    if (cakap.length > 0) {
        const activities = cakap.map(a => a.activity.toLowerCase()).join(", ");
        const connector = mahir.length > 0 ? "Selain itu, ananda juga" : "telah";
        descParts.push(`${connector} mampu ${activities}.`);
    }
    if (berkembang.length > 0) {
        const activities = berkembang.map(a => a.activity.toLowerCase()).join(", ");
        descParts.push(`Namun, ananda masih memerlukan bimbingan dan motivasi dalam hal ${activities} agar dapat berkembang lebih optimal.`);
    }

    return descParts.join(" ");
};

export const generateCategoryDescription = async (
  studentName: string,
  category: string,
  assessmentsData: { tp: string, activity: string, score: AssessmentLevel }[],
  teacherKeywords: string
): Promise<string> => {
  const apiKey = getApiKey();
  
  // Fallback ke Template Manual jika AI Key tidak ada
  if (!apiKey) {
      console.warn("AI Key not found, using offline template.");
      return generateTemplateDescription(studentName, category, assessmentsData);
  }
  
  const assessmentList = assessmentsData.map(a => {
      let scoreText = "";
      switch (a.score) {
        case AssessmentLevel.BERKEMBANG: scoreText = "Mulai Berkembang"; break;
        case AssessmentLevel.CAKAP: scoreText = "Cakap / Mampu"; break;
        case AssessmentLevel.MAHIR: scoreText = "Sangat Mahir"; break;
      }
      return `- TP: "${a.tp}" (Aktivitas: ${a.activity}) -> Capaian: ${scoreText}`;
  }).join("\n");

  const prompt = `
    Bertindaklah sebagai guru PAUD Kurikulum Merdeka.
    Buatlah SATU paragraf narasi deskripsi perkembangan anak untuk Rapor.
    
    Data Siswa: ${studentName}
    Kategori Perkembangan: ${category}
    
    Data Penilaian TP dan Aktivitas:
    ${assessmentList}

    Catatan Tambahan/Kata Kunci Guru: ${teacherKeywords}

    Panduan:
    1. Buat narasi yang mengalir, padu, dan positif (apresiatif).
    2. Jangan sebutkan nilai angka atau poin-poin. Gabungkan menjadi cerita.
    3. Untuk yang 'Mahir', berikan apresiasi tinggi.
    4. Untuk yang 'Cakap', nyatakan kemampuannya.
    5. Untuk yang 'Berkembang', gunakan bahasa yang memotivasi (misal: "Ananda mulai mengenal...", "perlu bimbingan dalam...").
    6. Gunakan sudut pandang orang ketiga (Ananda ${studentName}...).
    7. Panjang sekitar 3-5 kalimat.
  `;

  try {
    if (isGroqKey(apiKey)) {
        // --- USE GROQ API ---
        return await callGroqApi(apiKey, prompt);
    } else {
        // --- USE GOOGLE GEMINI API ---
        const ai = getGeminiInstance(apiKey);
        if (!ai) return "Gagal inisialisasi AI.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() || "Gagal menghasilkan deskripsi.";
    }
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateP5Description = async (
  studentName: string,
  subDimension: string,
  score: AssessmentLevel,
  keywords: string
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
     return `Ananda ${studentName} menunjukkan perkembangan dalam ${subDimension}. ${keywords}`;
  }

  let scoreText = "";
  switch (score) {
    case AssessmentLevel.BERKEMBANG: scoreText = "Mulai Berkembang"; break;
    case AssessmentLevel.CAKAP: scoreText = "Berkembang Sesuai Harapan"; break;
    case AssessmentLevel.MAHIR: scoreText = "Sangat Berkembang"; break;
  }

  const prompt = `
    Buatkan narasi singkat untuk Rapor Projek Penguatan Profil Pelajar Pancasila (P5) PAUD.
    
    Nama Siswa: ${studentName}
    Dimensi/Elemen P5: ${subDimension}
    Capaian: ${scoreText}
    Kata Kunci/Perilaku yang diamati: ${keywords}

    Instruksi:
    - Buat 1 paragraf pendek (2-3 kalimat).
    - Narasikan bagaimana anak menunjukkan perilaku ${subDimension} sesuai kata kunci tersebut.
    - Gunakan bahasa yang positif dan personal.
  `;

  try {
    if (isGroqKey(apiKey)) {
        // --- USE GROQ API ---
        return await callGroqApi(apiKey, prompt);
    } else {
        // --- USE GOOGLE GEMINI API ---
        const ai = getGeminiInstance(apiKey);
        if (!ai) return "Gagal inisialisasi AI.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() || "Gagal menghasilkan deskripsi.";
    }
  } catch (error) {
    return handleApiError(error);
  }
};
