import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { P5Criteria, AssessmentLevel } from '../types';
import { generateP5Description } from '../services/geminiService';
import { Plus, Edit2, Trash2, Save, Filter, Sparkles, Loader2, X } from 'lucide-react';
import { LEVEL_LABELS } from '../constants';

const Kokurikuler: React.FC = () => {
  const { p5Criteria, addP5Criteria, updateP5Criteria, deleteP5Criteria, 
          students, classes, p5Assessments, upsertP5Assessment, confirmAction, settings } = useApp();
  
  const [activeTab, setActiveTab] = useState<'assessment' | 'criteria'>('assessment');
  
  // State for Criteria Management
  const [criteriaClassId, setCriteriaClassId] = useState('');
  const [isEditingCrit, setIsEditingCrit] = useState<string | null>(null);
  const [critForm, setCritForm] = useState<Partial<P5Criteria>>({});
  
  // State for Assessment
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [activeCritId, setActiveCritId] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState<AssessmentLevel>(AssessmentLevel.BERKEMBANG);
  const [teacherNote, setTeacherNote] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filters
  const filteredStudents = selectedClassId ? students.filter(s => String(s.classId) === String(selectedClassId)) : [];
  const selectedStudent = students.find(s => String(s.id) === String(selectedStudentId));
  
  // Criteria filtering: For assessment (use student's class), for management (use selected dropdown)
  const assessmentCriteria = selectedStudent ? p5Criteria.filter(c => String(c.classId) === String(selectedStudent.classId)) : [];
  const managementCriteria = criteriaClassId ? p5Criteria.filter(c => String(c.classId) === String(criteriaClassId)) : [];

  const handleSaveCriteria = () => {
    if (!criteriaClassId) { alert("Pilih kelas terlebih dahulu!"); return; }
    if (!critForm.subDimension) { alert("Nama Sub Dimensi wajib diisi"); return; }
    
    const dataToSave = {
        ...critForm,
        classId: criteriaClassId,
        descBerkembang: critForm.descBerkembang || 'Mulai berkembang...',
        descCakap: critForm.descCakap || 'Sudah cakap...',
        descMahir: critForm.descMahir || 'Sangat mahir...'
    };
    
    if (isEditingCrit) { updateP5Criteria({ ...dataToSave, id: isEditingCrit } as P5Criteria); } 
    else { addP5Criteria({ ...dataToSave, id: Date.now().toString() } as P5Criteria); }
    
    setCritForm({}); setIsEditingCrit(null);
  };

  const handleDeleteCriteria = async (id: string) => {
    const subDimensionName = p5Criteria.find(c => c.id === id)?.subDimension || "Sub Dimensi ini";
    const isConfirmed = await confirmAction(`Apakah Anda yakin ingin menghapus "${subDimensionName}"?`);
    if (isConfirmed) { deleteP5Criteria(String(id)); }
  };

  const handleOpenAssessment = (crit: P5Criteria) => {
    setActiveCritId(crit.id);
    const existing = p5Assessments.find(a => String(a.studentId) === String(selectedStudentId) && String(a.criteriaId) === String(crit.id));
    if (existing) { setCurrentScore(existing.score); setTeacherNote(existing.teacherNote || ''); setDescription(existing.generatedDescription || ''); } 
    else { setCurrentScore(AssessmentLevel.BERKEMBANG); setTeacherNote(''); setDescription(''); }
  };

  const handleGenerateAI = async (subDimension: string) => {
      if (!selectedStudent) return;
      if (!teacherNote) { alert("Mohon isi 'Kata Kunci Kegiatan' terlebih dahulu agar untuk membuat deskripsi yang sesuai."); return; }
      setIsGenerating(true);
      try {
          // UPDATED: Pass API Key and Provider from Settings
          const res = await generateP5Description(
              selectedStudent.name, 
              subDimension, 
              currentScore, 
              teacherNote,
              settings.aiApiKey || "",
              settings.aiProvider || 'groq'
          );
          if (res.startsWith("Error")) { alert(res); } else { setDescription(res); }
      } catch (e) { alert("Gagal menghubungi Layanan Cerdas. Periksa koneksi internet."); } finally { setIsGenerating(false); }
  };

  const handleGenerateTemplate = (subDimension: string) => {
      if (!selectedStudent) return;
      // Using empty key forces offline template mode in service (if implemented for P5, otherwise basic template)
      const res = `Ananda ${selectedStudent.name} ${currentScore === 3 ? 'sangat berkembang' : currentScore === 2 ? 'berkembang sesuai harapan' : 'mulai berkembang'} dalam ${subDimension}. ${teacherNote}`;
      setDescription(res);
  };

  const handleSaveAssessment = () => {
    if (!selectedStudentId || !activeCritId) return;
    upsertP5Assessment({
        id: `${selectedStudentId}-${activeCritId}`, studentId: selectedStudentId, criteriaId: activeCritId, score: currentScore, teacherNote: teacherNote, generatedDescription: description
    });
    setActiveCritId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kokurikuler (P5)</h1>
        <div className="bg-slate-200 p-1 rounded-lg flex gap-1">
            <button type="button" onClick={() => setActiveTab('assessment')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'assessment' ? 'bg-white shadow' : 'text-slate-500'}`}>Input Penilaian</button>
            <button type="button" onClick={() => setActiveTab('criteria')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'criteria' ? 'bg-white shadow' : 'text-slate-500'}`}>Data Sub Dimensi</button>
        </div>
      </div>

      {activeTab === 'criteria' && (
        <div className="space-y-6">
             {/* Class Selector for Criteria Management */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                     <Filter size={16} /> Pilih Kelas untuk Mengelola Data P5
                 </label>
                 <select 
                    className="w-full md:w-1/2 p-2 border rounded-lg text-slate-800 bg-white"
                    value={criteriaClassId}
                    onChange={e => { setCriteriaClassId(e.target.value); setIsEditingCrit(null); setCritForm({}); }}
                 >
                     <option value="">-- Pilih Kelas --</option>
                     {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
            </div>

            {criteriaClassId ? (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">{isEditingCrit ? <Edit2 size={20}/> : <Plus size={20}/>} {isEditingCrit ? "Edit Sub Dimensi" : "Tambah Sub Dimensi P5"}</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Sub Dimensi / Elemen Profil Pelajar Pancasila</label><input className="w-full p-2 border rounded-lg bg-white text-slate-800" placeholder="Contoh: Mandiri, Bernalar Kritis..." value={critForm.subDimension || ''} onChange={e => setCritForm({...critForm, subDimension: e.target.value})} /></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Deskripsi Standar (Berkembang)</label><textarea className="w-full p-2 border rounded-lg bg-white text-slate-800 text-sm" rows={2} value={critForm.descBerkembang || ''} onChange={e => setCritForm({...critForm, descBerkembang: e.target.value})} /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Deskripsi Standar (Cakap)</label><textarea className="w-full p-2 border rounded-lg bg-white text-slate-800 text-sm" rows={2} value={critForm.descCakap || ''} onChange={e => setCritForm({...critForm, descCakap: e.target.value})} /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Deskripsi Standar (Mahir)</label><textarea className="w-full p-2 border rounded-lg bg-white text-slate-800 text-sm" rows={2} value={critForm.descMahir || ''} onChange={e => setCritForm({...critForm, descMahir: e.target.value})} /></div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                {isEditingCrit && <button type="button" onClick={() => { setIsEditingCrit(null); setCritForm({}); }} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300">Batal</button>}
                                <button type="button" onClick={handleSaveCriteria} className="bg-teal-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700"><Save size={16}/> Simpan Data</button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b"><tr><th className="p-4 text-slate-600 w-1/3">Sub Dimensi</th><th className="p-4 text-slate-600">Deskripsi Default</th><th className="p-4 text-slate-600 w-24 text-center">Aksi</th></tr></thead>
                            <tbody className="text-slate-700">
                                {managementCriteria.map(c => (
                                    <tr key={c.id} className="border-b hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-800">{c.subDimension}</td>
                                        <td className="p-4 text-xs text-slate-500"><div className="grid grid-cols-1 gap-1"><span className="truncate block">1. {c.descBerkembang}</span><span className="truncate block">2. {c.descCakap}</span><span className="truncate block">3. {c.descMahir}</span></div></td>
                                        <td className="p-4"><div className="flex justify-center gap-2"><button type="button" onClick={() => { setIsEditingCrit(c.id); setCritForm(c); }} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit2 size={16}/></button><button type="button" onClick={() => handleDeleteCriteria(c.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={16}/></button></div></td>
                                    </tr>
                                ))}
                                {managementCriteria.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-400">Belum ada data sub dimensi untuk kelas ini.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                     <Filter size={48} className="mb-4 opacity-30"/>
                     <p className="text-lg font-medium">Pilih Kelas Terlebih Dahulu</p>
                     <p className="text-sm">Anda harus memilih kelas untuk mengelola data sub dimensi.</p>
                </div>
            )}
        </div>
      )}

      {activeTab === 'assessment' && (
        <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Filter size={16}/> Filter Kelas</label><select className="w-full p-2 border rounded-lg bg-white text-slate-800" value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); setSelectedStudentId(''); setActiveCritId(null); }}><option value="">-- Pilih Kelas --</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-2">Pilih Siswa</label><select className="w-full p-2 border rounded-lg bg-white text-slate-800 disabled:bg-slate-100 disabled:text-slate-400" value={selectedStudentId} onChange={e => { setSelectedStudentId(e.target.value); setActiveCritId(null); }} disabled={!selectedClassId}><option value="">-- Pilih Siswa --</option>{filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                 </div>
             </div>
             {selectedStudentId ? (
                 <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 border-b pb-2">Daftar Sub Dimensi P5 ({classes.find(c => c.id === selectedClassId)?.name})</h3>
                    {assessmentCriteria.length > 0 ? (
                        assessmentCriteria.map(c => {
                            const isEditingThis = activeCritId === c.id;
                            const existing = p5Assessments.find(a => String(a.studentId) === String(selectedStudentId) && String(a.criteriaId) === String(c.id));
                            if (!isEditingThis) {
                                return (
                                    <div key={c.id} className={`bg-white rounded-xl border shadow-sm p-5 flex justify-between items-center transition-all ${existing ? 'border-l-4 border-l-teal-500' : 'border-slate-200'}`}>
                                        <div><h4 className="font-bold text-slate-800 text-lg">{c.subDimension}</h4>{existing ? (<div className="mt-2 text-sm text-slate-600"><span className="inline-block bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-xs font-bold mr-2">{existing.score === 1 ? 'Berkembang' : existing.score === 2 ? 'Cakap' : 'Mahir'}</span><span className="italic">"{existing.generatedDescription?.substring(0, 60)}..."</span></div>) : (<p className="text-sm text-slate-400 mt-1">Belum dinilai</p>)}</div>
                                        <button type="button" onClick={() => handleOpenAssessment(c)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${existing ? 'bg-white text-teal-600 border-teal-200 hover:bg-teal-50' : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'}`}>{existing ? 'Edit Nilai' : 'Input Nilai'}</button>
                                    </div>
                                );
                            }
                            return (
                                <div key={c.id} className="bg-white rounded-xl border-2 border-indigo-500 shadow-lg p-6 relative animate-in fade-in zoom-in-95 duration-200">
                                    <button type="button" onClick={() => setActiveCritId(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                                    <h4 className="font-bold text-xl text-indigo-700 mb-6">{c.subDimension}</h4>
                                    <div className="space-y-6">
                                        <div><label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">1. Pilih Tingkat Pencapaian</label><div className="flex flex-col sm:flex-row gap-3">{[AssessmentLevel.BERKEMBANG, AssessmentLevel.CAKAP, AssessmentLevel.MAHIR].map(val => (<button type="button" key={val} onClick={() => setCurrentScore(val)} className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${currentScore === val ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300'}`}>{LEVEL_LABELS[val]}</button>))}</div></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">2. Kata Kunci Kegiatan / Perilaku</label><input className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contoh: mau berbagi mainan..." value={teacherNote} onChange={e => setTeacherNote(e.target.value)} /><p className="text-xs text-slate-500 mt-1">*Wajib diisi untuk dapat membuat narasi yang akurat.</p></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">3. Buat Deskripsi Otomatis</label>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => handleGenerateAI(c.subDimension)} disabled={!teacherNote || isGenerating} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-white shadow-md transition-all ${!teacherNote ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}`}>{isGenerating ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>} {isGenerating ? 'Menyusun...' : 'Susun Narasi Otomatis'}</button>
                                                <button type="button" onClick={() => handleGenerateTemplate(c.subDimension)} className="px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-sm">Offline</button>
                                            </div>
                                        </div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">4. Hasil Deskripsi (Bisa Diedit)</label><textarea className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 h-32 leading-relaxed focus:ring-2 focus:ring-teal-500 outline-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Hasil narasi akan muncul di sini..." /></div>
                                        <div className="flex justify-end pt-4 border-t border-slate-100"><button type="button" onClick={handleSaveAssessment} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"><Save size={18}/> Simpan Penilaian</button></div>
                                    </div>
                                </div>
                            );
                        })
                    ) : ( <div className="text-center p-8 bg-orange-50 rounded-xl border border-orange-200"><p className="text-orange-800 font-medium">Belum ada data Sub Dimensi untuk kelas ini.</p><p className="text-sm mt-2 text-orange-600">Silakan masuk ke tab "Data Sub Dimensi" dan pilih kelas ini untuk menambahkan data.</p></div> )}
                 </div>
             ) : ( <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 text-slate-400"><Filter size={48} className="mb-4 opacity-30"/><p className="text-lg font-medium">Pilih Siswa Terlebih Dahulu</p></div> )}
        </div>
      )}
    </div>
  );
};

export default Kokurikuler;