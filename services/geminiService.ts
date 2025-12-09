
import { GoogleGenAI } from "@google/genai";
import { AssessmentLevel, TPType } from "../types";

let ai: GoogleGenAI | null = null;

try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI. Check your API_KEY.", error);
}

// REMOVED old function generateRaporDescription as it is replaced by category summary
// Added new function:

export const generateCategoryDescription = async (
  studentName: string,
  category: string,
  assessmentsData: { tp: string, activity: string, score: AssessmentLevel }[],
  teacherKeywords: string
): Promise<string> => {
  if (!ai) return "Error: AI instance is not initialized. Cek API Key.";
  
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
    return `Error AI: ${(error as Error).message}`;
  }
};

export const generateP5Description = async (
  studentName: string,
  subDimension: string,
  score: AssessmentLevel,
  keywords: string
): Promise<string> => {
  if (!ai) return "Error: AI belum siap. Cek API Key.";

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
    return `Error: ${(error as Error).message}`;
  }
};
