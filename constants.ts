import { SchoolSettings, TPType } from './types';

// Helper untuk membaca Env Var dengan aman (mendukung Vite, Create-React-App, dan Vercel)
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) return process.env[key];
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) return import.meta.env[key];
  } catch (e) { return ""; }
  return "";
};

// --- KONFIGURASI DATABASE ---

// OPSI 1: JIKA MENGGUNAKAN VERCEL ENVIRONMENT VARIABLES (SETTINGS > ENVIRONMENT VARIABLES)
// Masukkan Key dengan nama: REACT_APP_SUPABASE_URL dan REACT_APP_SUPABASE_KEY di Dashboard Vercel.
const ENV_URL = getEnv('REACT_APP_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
const ENV_KEY = getEnv('REACT_APP_SUPABASE_KEY') || getEnv('VITE_SUPABASE_KEY');

// OPSI 2: JIKA TIDAK PAKAI ENV VARS, ISI MANUAL DI BAWAH INI (HARDCODE)
// Ganti tanda kutip kosong "" di bawah ini dengan URL dan Key dari Supabase Anda.
// Contoh: export const SUPABASE_URL = ENV_URL || "https://abcdefgh.supabase.co";
export const SUPABASE_URL = ENV_URL || "https://wohhrumqbuwhfulhrlfy.supabase.co"; 
export const SUPABASE_KEY = ENV_KEY || "sb_publishable_ZSBDUUg7_lXLAKjsurs_9g_JopYWvs_"; 

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