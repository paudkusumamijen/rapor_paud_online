
import { GoogleGenAI } from "@google/genai";
import { AssessmentLevel } from "../types";
import { GEMINI_API_KEY } from "../constants";

let aiInstance: GoogleGenAI | null = null;
let currentKey: string | null = null;

// Helper to reset instance (used when user updates Key in Settings)
export const resetAiInstance = () => {
    aiInstance = null;
    currentKey = null;
};

// Helper to initialize AI dynamically
const getAiInstance = (): GoogleGenAI | null => {
  // Prioritize Env Var/Constant, then LocalStorage
  const apiKey = GEMINI_API_KEY || localStorage.getItem('gemini_api_key');

  if (!apiKey) {
    return null;
  }

  // Re-initialize if key changes or instance is null
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

const handleGeminiError = (error: any): string => {
    const errMsg = error.message || JSON.stringify(error);
    
    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        return "⚠️ KUOTA HABIS: Batas penggunaan AI harian tercapai. Silakan tunggu beberapa saat, gunakan API Key cadangan di Pengaturan, atau coba lagi besok.";
    }
    
    if (errMsg.includes("API Key")) {
        return "⚠️ API Key Salah/Tidak Valid. Periksa kembali di menu Pengaturan.";
    }

    return `Gagal generate: ${errMsg.substring(0, 100)}...`;
};

export const generateCategoryDescription = async (
  studentName: string,
  category: string,
  assessmentsData: { tp: string, activity: string, score: AssessmentLevel }[],
  teacherKeywords: string
): Promise<string> => {
  const ai = getAiInstance();
  if (!ai) return "Error: API Key belum diatur. Masuk ke menu Pengaturan > Koneksi AI.";
  
  // Format data penilaian menjadi teks untuk prompt
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "Gagal menghasilkan deskripsi.";
  } catch (error) {
    return handleGeminiError(error);
  }
};

export const generateP5Description = async (
  studentName: string,
  subDimension: string,
  score: AssessmentLevel,
  keywords: string
): Promise<string> => {
  const ai = getAiInstance();
  if (!ai) return "Error: API Key belum diatur. Masuk ke menu Pengaturan > Koneksi AI.";

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "Gagal menghasilkan deskripsi.";
  } catch (error) {
    return handleGeminiError(error);
  }
};