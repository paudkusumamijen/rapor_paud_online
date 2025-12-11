import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolSettings } from '../types';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';
import { resetSupabaseClient, sheetService } from '../services/sheetService';
import { Save, Database, RefreshCw, Upload, Image as ImageIcon, Trash2, Lock, Flame, CheckCircle2, Sparkles, Key, AlertCircle, Cpu, ShieldCheck, Edit, Loader2 } from 'lucide-react';

const Pengaturan: React.FC = () => {
  const { settings, setSettings, refreshData, isLoading, isOnline } = useApp();
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  
  // States for DB Config (Supabase URL/Key must still be handled locally/env as they are needed to connect)
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');

  const [connStatus, setConnStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Cek apakah konfigurasi Supabase sudah ditanam (via Env Vars)
  const isHardcodedSb = !!SUPABASE_URL && !!SUPABASE_KEY;
  // Cek apakah Database sudah terkonfigurasi (baik hardcode maupun localstorage)
  const isDbConfigured = isHardcodedSb || (!!sbUrl && !!sbKey);

  // Cek apakah AI sudah disetting
  const isAiConfigured = !!settings.aiApiKey;
  // Mode edit untuk AI (jika user ingin mengubah key yang sudah ada)
  const [isEditingAi, setIsEditingAi] = useState(false);

  useEffect(() => { setFormData(settings); }, [settings]);
  
  // Load Supabase config from localStorage or constants
  useEffect(() => {
    const storedSbUrl = SUPABASE_URL || localStorage.getItem('supabase_url') || '';
    const storedSbKey = SUPABASE_KEY || localStorage.getItem('supabase_key') || '';
    setSbUrl(storedSbUrl);
    setSbKey(storedSbKey);
  }, []);

  const handleChange = (field: keyof SchoolSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert("Ukuran file maksimal 2MB"); return; }
      
      setIsUploadingLogo(true);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
            // Jika Online, Upload ke Storage
            if (isOnline) {
                 const img = new Image();
                 img.src = event.target.result as string;
                 img.onload = async () => {
                     const canvas = document.createElement('canvas');
                     const ctx = canvas.getContext('2d');
                     // Resize logo
                     const maxSize = 300;
                     let width = img.width; let height = img.height;
                     if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } } 
                     else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
                     canvas.width = width; canvas.height = height;
                     ctx?.drawImage(img, 0, 0, width, height);
                     
                     canvas.toBlob(async (blob) => {
                         if (blob) {
                             const publicUrl = await sheetService.uploadImage(blob, 'school', `logo_${Date.now()}.jpg`);
                             if (publicUrl) {
                                 setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
                             } else {
                                 alert("Gagal upload logo. Pastikan bucket 'images' ada.");
                             }
                             setIsUploadingLogo(false);
                         }
                     }, 'image/jpeg', 0.8);
                 };
            } else {
                 // Offline Fallback
                 setFormData(prev => ({ ...prev, logoUrl: event.target?.result as string }));
                 setIsUploadingLogo(false);
            }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    await setSettings(formData);
    setIsEditingAi(false); // Keluar dari mode edit setelah simpan
    alert("Semua Pengaturan berhasil disimpan ke Database!");
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

  const handleClearData = () => {
      if (confirm("PERINGATAN: Ini akan menghapus koneksi database dari browser ini. Anda harus memasukkan URL & Key lagi nanti. Lanjutkan?")) {
          localStorage.removeItem('supabase_url');
          localStorage.removeItem('supabase_key');
          
          resetSupabaseClient();
          
          alert("Konfigurasi lokal dihapus. Browser akan dimuat ulang.");
          window.location.reload(); 
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
                         {isUploadingLogo && (
                             <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                                 <Loader2 className="animate-spin text-white" size={24} />
                             </div>
                         )}
                        {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-xs text-slate-400 text-center">Belum ada logo</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        <div className="flex gap-2">
                             <button onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50">
                                <Upload size={16}/> {isUploadingLogo ? 'Mengupload...' : 'Upload Logo'}
                             </button>
                             {formData.logoUrl && (
                                <button onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100"><Trash2 size={16}/></button>
                             )}
                        </div>
                        {isOnline && <p className="text-[10px] text-slate-400 mt-2">Disimpan di Storage, bukan DB.</p>}
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button onClick={handleSaveSettings} disabled={isUploadingLogo} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg disabled:opacity-50">
                    <Save size={20}/> Simpan Data Sekolah
                </button>
            </div>
        </div>

        {/* --- KOLOM KANAN: Penandatangan & Koneksi --- */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Penandatangan Rapor</h2>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label><input className="w-full p-2 border rounded bg-white text-slate-800" value={formData.headmaster || ''} onChange={e => handleChange('headmaster', e.target.value)} /></div>
                    
                    {/* INPUT GURU KELAS DEFAULT DIHILANGKAN */}
                    
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

            {/* --- KONEKSI AI (DATABASE STORED) --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Cpu size={100} /></div>
                
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Sparkles size={20} className="text-purple-500"/> Konfigurasi AI
                </h2>
                
                <div className="relative z-10">
                    {/* TAMPILAN SUKSES / TERSEMBUNYI */}
                    {isAiConfigured && !isEditingAi ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5 animate-in fade-in zoom-in-95 duration-300">
                             <div className="flex items-center justify-between mb-2">
                                 <div className="flex items-center gap-3">
                                     <div className="bg-green-100 p-2 rounded-full text-green-600">
                                         <ShieldCheck size={24} />
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-green-800 text-lg">AI Siap Digunakan</h3>
                                         <p className="text-xs text-green-700 font-medium">
                                             Penyedia: <span className="uppercase">{formData.aiProvider === 'gemini' ? 'Google Gemini' : 'Groq AI'}</span>
                                         </p>
                                     </div>
                                 </div>
                                 <button 
                                    onClick={() => setIsEditingAi(true)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                    title="Ubah Konfigurasi"
                                 >
                                     <Edit size={18} />
                                 </button>
                             </div>
                             <p className="text-xs text-green-600 ml-12">
                                 API Key tersimpan aman di database. Anda bisa langsung menggunakan fitur AI di menu Input Nilai.
                             </p>
                        </div>
                    ) : (
                        /* TAMPILAN EDIT / INPUT */
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            {isEditingAi && (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><AlertCircle size={14}/> Mode Edit Konfigurasi AI</span>
                                    <button onClick={() => setIsEditingAi(false)} className="text-slate-500 underline hover:text-slate-700">Batal</button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Penyedia AI</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setFormData(prev => ({...prev, aiProvider: 'groq'}))}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.aiProvider === 'groq' ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Flame size={16}/> Groq (Gratis)
                                    </button>
                                    <button 
                                        onClick={() => setFormData(prev => ({...prev, aiProvider: 'gemini'}))}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.aiProvider === 'gemini' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Sparkles size={16}/> Google Gemini
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    API Key {formData.aiProvider === 'groq' ? '(Dimulai dengan gsk_...)' : '(Dimulai dengan AIza...)'}
                                </label>
                                <div className="relative">
                                    <Key size={14} className="absolute left-3 top-3 text-slate-400"/>
                                    <input 
                                        className="w-full p-2 pl-9 border rounded bg-white text-slate-800 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        placeholder={formData.aiProvider === 'groq' ? "gsk_..." : "AIzaSy..."}
                                        value={formData.aiApiKey || ''} 
                                        onChange={e => handleChange('aiApiKey', e.target.value)} 
                                        type="password"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button onClick={handleSaveSettings} className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 shadow-md">Simpan Konfigurasi AI</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- KONEKSI DATABASE (SUPABASE) --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Flame size={20} className="text-orange-500"/> Koneksi Database</h2>
                    {isHardcodedSb && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1"><Lock size={10}/> Config File</span>}
                </div>
                
                {isDbConfigured ? (
                     // TAMPILAN SUKSES DATABASE
                     <div className="bg-green-50 p-5 rounded-xl border border-green-200 text-green-800 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                             <div className="bg-green-100 p-2 rounded-full text-green-600">
                                 <CheckCircle2 size={24} />
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg">Database Terhubung</h3>
                                 <p className="text-xs text-green-700">Status: Online</p>
                             </div>
                        </div>
                        
                        {!isHardcodedSb && (
                            <div className="mt-2 border-t border-green-200 pt-3 flex justify-between items-center">
                                <span className="text-xs text-green-600">Ingin mengganti database?</span>
                                <button 
                                    onClick={handleClearData}
                                    className="text-xs bg-white border border-green-300 px-3 py-1.5 rounded-lg font-bold text-green-700 hover:bg-green-50 shadow-sm"
                                >
                                    Putuskan / Ganti
                                </button>
                            </div>
                        )}
                     </div>
                ) : (
                    // TAMPILAN INPUT DATABASE
                    <div className="space-y-4">
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800">
                             <p><strong>Catatan:</strong> URL & Key Database ini disimpan di Browser Anda agar bisa terhubung. Jangan bagikan ke orang lain.</p>
                        </div>
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
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;