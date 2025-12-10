
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolSettings } from '../types';
import { SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY } from '../constants';
import { resetAiInstance } from '../services/geminiService';
import { resetSupabaseClient } from '../services/sheetService';
import { Save, Database, RefreshCw, Upload, Image as ImageIcon, Trash2, Lock, Flame, CheckCircle2, Sparkles, Key, AlertCircle } from 'lucide-react';

const Pengaturan: React.FC = () => {
  const { settings, setSettings, refreshData, isLoading } = useApp();
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  
  // States for DB Config
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');

  // States for AI Config
  const [aiKey, setAiKey] = useState('');
  
  const [connStatus, setConnStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Cek apakah konfigurasi sudah ditanam (hardcoded atau via Env Vars)
  const isHardcodedSb = !!SUPABASE_URL && !!SUPABASE_KEY;
  const isHardcodedAi = !!GEMINI_API_KEY;

  useEffect(() => { setFormData(settings); }, [settings]);
  
  // Load initial config from localStorage or constants
  useEffect(() => {
    // Database
    const storedSbUrl = SUPABASE_URL || localStorage.getItem('supabase_url') || '';
    const storedSbKey = SUPABASE_KEY || localStorage.getItem('supabase_key') || '';
    setSbUrl(storedSbUrl);
    setSbKey(storedSbKey);

    // AI
    const storedAiKey = GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
    setAiKey(storedAiKey);
  }, []);

  const handleChange = (field: keyof SchoolSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert("Ukuran file maksimal 2MB"); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
            setFormData(prev => ({ ...prev, logoUrl: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    await setSettings(formData);
    alert("Pengaturan Sekolah berhasil disimpan!");
  };

  const handleSaveDbConfig = async () => {
      if (isHardcodedSb) return;
      localStorage.setItem('supabase_url', sbUrl);
      localStorage.setItem('supabase_key', sbKey);
      
      // Reset client Supabase agar menggunakan config baru
      resetSupabaseClient();
      
      alert("Konfigurasi Database disimpan! Mencoba terhubung...");
      await testConnection();
  };

  const handleSaveAiConfig = () => {
      if (isHardcodedAi) return;
      localStorage.setItem('gemini_api_key', aiKey);
      
      // Reset instance AI agar menggunakan key baru
      resetAiInstance();
      
      alert("Konfigurasi AI disimpan! Anda bisa langsung mencobanya di menu Input Nilai.");
  };

  const handleClearData = () => {
      if (confirm("PERINGATAN: Ini akan menghapus koneksi database dan AI dari browser ini (kecuali jika hardcoded). Data di database tidak akan hilang. Lanjutkan?")) {
          localStorage.removeItem('supabase_url');
          localStorage.removeItem('supabase_key');
          localStorage.removeItem('gemini_api_key');
          localStorage.removeItem('raporPaudData');
          
          resetSupabaseClient();
          resetAiInstance();
          
          alert("Semua konfigurasi lokal telah dihapus.");
          window.location.reload(); // Reload diperlukan di sini untuk reset total state aplikasi
      }
  };

  const testConnection = async () => {
      setConnStatus('idle');
      try {
          await refreshData();
          setConnStatus('success');
          alert("Koneksi Database Berhasil!");
      } catch (e) {
          setConnStatus('error');
          alert("Gagal terhubung ke Database. Periksa URL dan Key Anda.");
      }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Pengaturan Aplikasi</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* --- KOLOM KIRI: Identitas Sekolah --- */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Database size={20} className="text-indigo-600"/> Identitas Sekolah
                </h2>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Satuan PAUD</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></div>
                    <div className="flex gap-4">
                        <div className="w-1/2"><label className="block text-sm font-medium text-slate-700 mb-1">NPSN</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.npsn || ''} onChange={e => handleChange('npsn', e.target.value)} /></div>
                        <div className="w-1/2"><label className="block text-sm font-medium text-slate-700 mb-1">Kode Pos</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.postalCode || ''} onChange={e => handleChange('postalCode', e.target.value)} /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label><textarea className="w-full p-2 border rounded bg-white text-slate-800" rows={2} value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Desa / Kelurahan</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.village || ''} onChange={e => handleChange('village', e.target.value)} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Kecamatan</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.district || ''} onChange={e => handleChange('district', e.target.value)} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Kabupaten / Kota</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.regency || ''} onChange={e => handleChange('regency', e.target.value)} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Provinsi</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.province || ''} onChange={e => handleChange('province', e.target.value)} /></div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ImageIcon size={20} className="text-pink-600"/> Logo Sekolah
                </h2>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden relative">
                        {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-xs text-slate-400 text-center">Belum ada logo</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        <div className="flex gap-2">
                             <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"><Upload size={16}/> Upload Logo</button>
                             {formData.logoUrl && (
                                <button onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100"><Trash2 size={16}/></button>
                             )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Format: PNG/JPG. Maks: 2MB. Logo akan muncul di KOP Rapor dan Sidebar.</p>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button onClick={handleSaveSettings} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg">
                    <Save size={20}/> Simpan Identitas & Logo
                </button>
            </div>
        </div>

        {/* --- KOLOM KANAN: Penandatangan & Koneksi --- */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Penandatangan Rapor</h2>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.headmaster || ''} onChange={e => handleChange('headmaster', e.target.value)} /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Guru Kelas (Default)</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.teacher || ''} onChange={e => handleChange('teacher', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Semester</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.semester || ''} onChange={e => handleChange('semester', e.target.value)} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Tahun Ajaran</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.academicYear || ''} onChange={e => handleChange('academicYear', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Tempat Tgl Rapor</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.reportPlace || ''} onChange={e => handleChange('reportPlace', e.target.value)} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Rapor</label><input type="date" className="w-full p-2 border rounded bg-white text-slate-800" value={formData.reportDate || ''} onChange={e => handleChange('reportDate', e.target.value)} /></div>
                    </div>
                </div>
            </div>

            {/* --- KONEKSI DATABASE (SUPABASE) --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Flame size={20} className="text-orange-500"/> Koneksi Database</h2>
                    {isHardcodedSb && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1"><Lock size={10}/> Config File</span>}
                </div>
                
                {isHardcodedSb ? (
                     <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-green-800">
                        <p className="font-bold flex items-center gap-2"><CheckCircle2 size={16}/> Terhubung ke Supabase</p>
                        <p className="mt-1">URL dan API Key telah dikonfigurasi melalui Environment Variables atau file <code>constants.ts</code>.</p>
                     </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 mb-2">Masukkan URL dan Key dari Project Supabase Anda. Dapatkan di <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" className="text-blue-600 underline">Dashboard Supabase</a>.</p>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project URL</label>
                            <input className="w-full p-2 border rounded bg-slate-50 text-slate-800 text-sm font-mono" placeholder="https://xyz.supabase.co" value={sbUrl} onChange={e => setSbUrl(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Anon / Public Key</label>
                            <input className="w-full p-2 border rounded bg-slate-50 text-slate-800 text-sm font-mono" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..." value={sbKey} onChange={e => setSbKey(e.target.value)} />
                        </div>
                        <div className="flex gap-2 pt-2">
                             <button onClick={handleSaveDbConfig} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 flex-1">Simpan Koneksi DB</button>
                             <button onClick={testConnection} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center gap-2"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/> Tes</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- KONEKSI AI (GEMINI) --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Sparkles size={20} className="text-purple-500"/> Koneksi AI (Google Gemini)</h2>
                    {isHardcodedAi && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1"><Lock size={10}/> Config File</span>}
                </div>

                {isHardcodedAi ? (
                     <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-green-800">
                        <p className="font-bold flex items-center gap-2"><CheckCircle2 size={16}/> Terhubung ke Gemini AI</p>
                        <p className="mt-1">API Key telah dikonfigurasi melalui Environment Variables atau file <code>constants.ts</code>.</p>
                     </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3">
                            <AlertCircle size={24} className="text-blue-600 shrink-0"/>
                            <div className="text-xs text-blue-800">
                                <p className="font-bold mb-1">Tentang Kuota Error 429</p>
                                <p>Jika muncul error "RESOURCE_EXHAUSTED", artinya kuota harian kunci gratis Anda habis. Solusinya:</p>
                                <ul className="list-disc ml-4 mt-1">
                                    <li>Tunggu besok untuk reset kuota.</li>
                                    <li>Buat Akun Google baru untuk dapat Key baru.</li>
                                    <li>Buat Key cadangan di sini dan ganti jika yang satu habis.</li>
                                </ul>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-2">Masukkan API Key Google Gemini untuk mengaktifkan fitur generate deskripsi otomatis. Dapatkan di <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 underline">Google AI Studio</a>.</p>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gemini API Key</label>
                            <div className="relative">
                                <Key size={14} className="absolute left-3 top-3 text-slate-400"/>
                                <input 
                                    className="w-full p-2 pl-9 border rounded bg-slate-50 text-slate-800 text-sm font-mono" 
                                    placeholder="AIzaSy..." 
                                    value={aiKey} 
                                    onChange={e => setAiKey(e.target.value)} 
                                    type="password"
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                             <button onClick={handleSaveAiConfig} className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700">Simpan API Key</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t">
                 <button onClick={handleClearData} className="text-red-600 text-sm font-medium hover:text-red-800 flex items-center gap-2"><Trash2 size={16}/> Reset Semua Konfigurasi Lokal</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;