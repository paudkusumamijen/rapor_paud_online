import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolSettings } from '../types';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';
import { Save, Database, RefreshCw, Upload, Image as ImageIcon, Trash2, Lock, Flame } from 'lucide-react';

const Pengaturan: React.FC = () => {
  const { settings, setSettings, refreshData, isLoading } = useApp();
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  
  // States for DB Config
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  
  const [connStatus, setConnStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isHardcodedSb = !!SUPABASE_URL;

  useEffect(() => { setFormData(settings); }, [settings]);
  
  // Load initial config from localStorage or constants
  useEffect(() => {
    const storedSbUrl = SUPABASE_URL || localStorage.getItem('supabase_url') || '';
    const storedSbKey = SUPABASE_KEY || localStorage.getItem('supabase_key') || '';
    
    setSbUrl(storedSbUrl);
    setSbKey(storedSbKey);
  }, []);

  const handleChange = (field: keyof SchoolSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    setSettings(formData);
    alert("Pengaturan sekolah berhasil disimpan.");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { alert("Ukuran logo maksimal 2MB"); return; }
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) setFormData(prev => ({ ...prev, logoUrl: event.target?.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleConnect = async () => {
      setConnStatus('idle');
      
      if (!sbUrl || !sbKey) return alert("URL dan Key Supabase wajib diisi.");
      
      if (!SUPABASE_URL) {
        localStorage.setItem('supabase_url', sbUrl);
        localStorage.setItem('supabase_key', sbKey);
      }

      try {
          await refreshData();
          setConnStatus('success');
          alert("Koneksi Berhasil! Data tersinkronisasi.");
      } catch (e) {
          setConnStatus('error');
          alert("Gagal terhubung. Periksa kredensial Anda.");
      }
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* --- DATABASE CONNECTION --- */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-6 text-slate-800 flex items-center gap-2">
                    <Database size={20} className="text-indigo-600"/> Koneksi Database
                </h2>
                
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-center gap-2 text-teal-700 text-sm mb-6">
                    <Flame size={16} className="fill-teal-500 text-teal-600"/> 
                    <strong>Mode: Supabase Database (Stabil & Cepat)</strong>
                </div>

                <div className="space-y-4 animate-in fade-in duration-300">
                    {isHardcodedSb && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-2 text-indigo-700 text-sm mb-2">
                            <Lock size={16}/> Konfigurasi dikunci via <code>constants.ts</code>
                            </div>
                    )}
                    <div>
                        <label className="label">Project URL</label>
                        <input className="input font-mono text-sm" placeholder="https://xyz.supabase.co" value={sbUrl} onChange={e => setSbUrl(e.target.value)} disabled={isHardcodedSb} />
                    </div>
                    <div>
                        <label className="label">API Key (public/anon)</label>
                        <input className="input font-mono text-sm" type="password" placeholder="eyJhbGciOiJIUz..." value={sbKey} onChange={e => setSbKey(e.target.value)} disabled={isHardcodedSb} />
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
                        <strong>Cara mendapatkan kredensial:</strong>
                        <ol className="list-decimal pl-4 mt-1 space-y-1">
                            <li>Buat project baru di <a href="https://supabase.com" target="_blank" className="text-blue-600 underline">supabase.com</a>.</li>
                            <li>Masuk ke <strong>Settings {'>'} API</strong>. Copy URL & Anon Key.</li>
                            <li>Buka <strong>SQL Editor</strong> di Supabase, jalankan script pembuatan tabel (Tersedia di dokumentasi aplikasi).</li>
                        </ol>
                    </div>
                </div>

                <button 
                    type="button"
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="w-full mt-6 bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""}/> 
                    {isLoading ? "Menghubungkan..." : "Simpan & Hubungkan Database"}
                </button>
            </div>
        </div>

        {/* --- SCHOOL DATA FORM --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6 text-slate-800 flex items-center gap-2">
                <Save size={20} className="text-teal-600"/> Data Sekolah & Pengaturan Umum
            </h2>

            <div className="space-y-4">
                 {/* Logo Upload */}
                 <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50 mb-4">
                    <div className="w-16 h-16 bg-white border rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain"/>
                        ) : (
                            <ImageIcon className="text-slate-300" size={32}/>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Logo Sekolah</label>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => logoInputRef.current?.click()} className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-100 flex items-center gap-1"><Upload size={12}/> Upload Logo</button>
                            {formData.logoUrl && (
                                <button type="button" onClick={() => setFormData(p => ({...p, logoUrl: ''}))} className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded hover:bg-red-100 flex items-center gap-1"><Trash2 size={12}/> Hapus</button>
                            )}
                            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload}/>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Format: PNG/JPG, Max 2MB</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="label">Nama Sekolah</label><input className="input" value={formData.name} onChange={e => handleChange('name', e.target.value)} /></div>
                    <div><label className="label">NPSN</label><input className="input" value={formData.npsn} onChange={e => handleChange('npsn', e.target.value)} /></div>
                </div>
                <div><label className="label">Alamat Lengkap</label><textarea className="input" rows={2} value={formData.address} onChange={e => handleChange('address', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Desa / Kelurahan</label><input className="input" value={formData.village} onChange={e => handleChange('village', e.target.value)} /></div>
                    <div><label className="label">Kecamatan</label><input className="input" value={formData.district} onChange={e => handleChange('district', e.target.value)} /></div>
                    <div><label className="label">Kabupaten / Kota</label><input className="input" value={formData.regency} onChange={e => handleChange('regency', e.target.value)} /></div>
                    <div><label className="label">Provinsi</label><input className="input" value={formData.province} onChange={e => handleChange('province', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Email</label><input className="input" value={formData.email} onChange={e => handleChange('email', e.target.value)} /></div>
                    <div><label className="label">Website</label><input className="input" value={formData.website} onChange={e => handleChange('website', e.target.value)} /></div>
                </div>
                
                <div className="border-t border-slate-100 my-4 pt-4">
                    <h3 className="font-semibold text-slate-700 mb-3">Pejabat Penandatangan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label">Kepala Sekolah</label><input className="input" value={formData.headmaster} onChange={e => handleChange('headmaster', e.target.value)} /></div>
                        <div><label className="label">Wali Kelas (Default)</label><input className="input" value={formData.teacher} onChange={e => handleChange('teacher', e.target.value)} /></div>
                    </div>
                </div>

                <div className="border-t border-slate-100 my-4 pt-4">
                     <h3 className="font-semibold text-slate-700 mb-3">Tahun Ajaran & Laporan</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Tahun Ajaran</label><input className="input" value={formData.academicYear} onChange={e => handleChange('academicYear', e.target.value)} /></div>
                        <div><label className="label">Semester</label><input className="input" value={formData.semester} onChange={e => handleChange('semester', e.target.value)} /></div>
                        <div><label className="label">Tempat Tgl Rapor</label><input className="input" value={formData.reportPlace} onChange={e => handleChange('reportPlace', e.target.value)} /></div>
                        <div><label className="label">Tanggal Rapor</label><input type="date" className="input" value={formData.reportDate} onChange={e => handleChange('reportDate', e.target.value)} /></div>
                     </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="button" onClick={handleSaveSettings} className="bg-teal-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-teal-700 shadow-lg font-bold">
                        <Save size={20}/> Simpan Pengaturan
                    </button>
                </div>
            </div>
        </div>

      </div>
      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background-color: white; color: #1f2937; font-size: 0.875rem; }
        .input:focus { outline: 2px solid #0d9488; outline-offset: -1px; }
      `}</style>
    </div>
  );
};

export default Pengaturan;