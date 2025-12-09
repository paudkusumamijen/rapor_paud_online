

export enum AssessmentLevel {
  BERKEMBANG = 1,
  CAKAP = 2,
  MAHIR = 3
}

export enum TPType {
  ABP = 'Nilai Agama dan Budi Pekerti',
  JD = 'Jati Diri',
  IMTAK = 'Dasar Literasi, Matematika, Sains, Teknologi, Rekayasa dan Seni'
}

export interface ClassData {
  id: string;
  name: string; // Kelas/Kelompok
  teacherName: string;
  nuptk: string;
}

export interface Student {
  id: string; // NISN or UUID
  nisn: string;
  name: string;
  classId: string; // Links to ClassData
  pob: string; // Tempat Lahir
  dob: string; // Tanggal Lahir
  religion: string;
  childOrder: number; // Anak ke-
  gender: 'L' | 'P';
  phone: string;
  fatherName: string;
  motherName: string;
  fatherJob: string;
  motherJob: string;
  address: string;
  photoUrl?: string;
  height?: number; // Tinggi Badan (cm)
  weight?: number; // Berat Badan (kg)
}

export interface LearningObjective {
  id: string;
  classId: string; // NEW: Links to ClassData (TP is now specific to a class)
  category: TPType;
  description: string; // Tujuan Pembelajaran
  activity: string; // Aktivitas
}

// Data Penilaian per TP (Hanya skor, teacherNote optional)
export interface Assessment {
  id: string;
  studentId: string;
  tpId: string; // Links to LearningObjective
  score: AssessmentLevel;
  semester: string;
  academicYear: string;
}

// NEW: Data Deskripsi Akhir per Kategori (Hasil AI / Edit Guru)
export interface CategoryResult {
  id: string;
  studentId: string;
  category: string; // TPType
  teacherNote: string; // Kata kunci umum untuk kategori ini
  generatedDescription: string; // Deskripsi Narasi Final
  semester: string;
  academicYear: string;
}

// --- NEW FEATURES TYPES ---

// 1. KOKURIKULER (P5)
export interface P5Criteria {
  id: string;
  subDimension: string;
  descBerkembang: string; // Deskripsi untuk nilai 1
  descCakap: string;      // Deskripsi untuk nilai 2
  descMahir: string;      // Deskripsi untuk nilai 3
}

export interface P5Assessment {
  id: string;
  studentId: string;
  criteriaId: string;
  score: AssessmentLevel;
  teacherNote?: string; // Kata kunci guru
  generatedDescription?: string; // Hasil AI
}

// 2. REFLEKSI ORANG TUA
export interface Reflection {
  id: string;
  studentId: string;
  question: string;
  answer: string;
}

// 3. CATATAN PERKEMBANGAN
export interface StudentNote {
  id: string;
  studentId: string;
  note: string;
}

// 4. KEHADIRAN
export interface AttendanceData {
  id: string;
  studentId: string;
  sick: number;
  permission: number;
  alpha: number;
}

export interface SchoolSettings {
  name: string;
  npsn: string;
  address: string;
  postalCode: string;
  village: string; // Desa
  district: string; // Kecamatan
  regency: string; // Kabupaten
  province: string;
  website: string;
  email: string;
  headmaster: string;
  teacher: string; // Default teacher name if not in class
  currentClass: string;
  semester: string;
  academicYear: string;
  reportDate: string;
  reportPlace: string;
  logoUrl?: string;
}

export interface AppState {
  classes: ClassData[];
  students: Student[];
  tps: LearningObjective[];
  assessments: Assessment[];
  categoryResults: CategoryResult[]; // New State
  settings: SchoolSettings;
  // New States
  p5Criteria: P5Criteria[];
  p5Assessments: P5Assessment[];
  reflections: Reflection[];
  notes: StudentNote[];
  attendance: AttendanceData[];
}

// Response structure from Google Apps Script
export interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  data?: any;
}

export interface ApiPayload {
  action: 'create' | 'update' | 'delete' | 'readAll';
  collection: 'classes' | 'students' | 'TPs' | 'assessments' | 'categoryResults' | 'settings' | 'p5Criteria' | 'p5Assessments' | 'reflections' | 'notes' | 'attendance';
  data?: any;
  id?: string;
}

// Global declaration for external libraries
declare global {
  interface Window {
    html2pdf: any;
    XLSX: any;
  }
}