import { SchoolSettings, TPType } from './types';

// --- KONFIGURASI DATABASE ---
// SUPABASE (Wajib: Lebih Cepat & Stabil)
export const SUPABASE_URL = ""; 
export const SUPABASE_KEY = ""; 

// -------------------------------------

export const INITIAL_SETTINGS: SchoolSettings = {
  name: "TK Pertiwi Harapan",
  npsn: "12345678",
  address: "Jl. Merdeka No. 1",
  postalCode: "12345",
  village: "Sukamaju",
  district: "Maju Jaya",
  regency: "Jakarta Selatan",
  province: "DKI Jakarta",
  website: "www.tkpertiwi.sch.id",
  email: "info@tkpertiwi.sch.id",
  headmaster: "Budi Santoso, S.Pd",
  teacher: "Siti Aminah, S.Pd",
  currentClass: "Kelompok A",
  semester: "1 (Ganjil)",
  academicYear: "2024/2025",
  reportPlace: "Jakarta",
  reportDate: new Date().toISOString().split('T')[0],
  logoUrl: ""
};

export const TP_CATEGORIES = [TPType.ABP, TPType.JD, TPType.IMTAK];

export const LEVEL_LABELS = {
  1: "Berkembang (Perlu Bimbingan)",
  2: "Cakap (Layak)",
  3: "Mahir (Sangat Baik)"
};