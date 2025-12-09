import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Reflection } from '../types';
import { Plus, Trash2, Save, Filter } from 'lucide-react';

const Refleksi: React.FC = () => {
  const { students, classes, reflections, addReflection, updateReflection, deleteReflection, confirmAction } = useApp();
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const filteredStudents = selectedClassId 
    ? students.filter(s => String(s.classId) === String(selectedClassId))
    : [];

  const studentReflections = reflections.filter(r => String(r.studentId) === String(selectedStudentId));

  const handleAdd = () => {
    if (!newQuestion || !newAnswer) return alert("Pertanyaan dan Jawaban harus diisi");
    addReflection({
        id: Date.now().toString(),
        studentId: selectedStudentId,
        question: newQuestion,
        answer: newAnswer
    });
    setNewQuestion('');
    setNewAnswer('');
    setIsAdding(false);
  };

  const handleUpdate = (r: Reflection, field: 'question'|'answer', value: string) => {
      updateReflection({ ...r, [field]: value });
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAction("Apakah Anda yakin ingin menghapus Refleksi ini?");
    if (isConfirmed) {
        deleteReflection(String(id));
    }
  };

  return (
    <div>
       <h1 className="text-2xl font-bold text-slate-800 mb-6">Refleksi Orang Tua</h1>
       
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Filter Kelas</label>
                    <select className="w-full p-2 border rounded-lg bg-white text-slate-800" value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); setSelectedStudentId(''); }}>
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Siswa</label>
                    <select 
                        className="w-full p-2 border rounded-lg bg-white text-slate-800 disabled:bg-slate-100" 
                        value={selectedStudentId} 
                        onChange={e => setSelectedStudentId(e.target.value)}
                        disabled={!selectedClassId}
                    >
                        <option value="">-- Pilih Siswa --</option>
                        {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
       </div>

       {selectedStudentId && (
           <div className="space-y-4">
               {studentReflections.map(r => (
                   <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                       <div className="mb-3">
                           <label className="text-xs font-bold text-indigo-600 uppercase mb-1 block">Pertanyaan Refleksi</label>
                           <input 
                                className="w-full p-2 border rounded bg-slate-50 text-slate-800 font-medium"
                                value={r.question}
                                onChange={e => handleUpdate(r, 'question', e.target.value)}
                           />
                       </div>
                       <div className="mb-3">
                           <label className="text-xs font-bold text-teal-600 uppercase mb-1 block">Jawaban Orang Tua</label>
                           <textarea 
                                className="w-full p-2 border rounded bg-white text-slate-800"
                                rows={2}
                                value={r.answer}
                                onChange={e => handleUpdate(r, 'answer', e.target.value)}
                           />
                       </div>
                       <div className="flex justify-end">
                           <button 
                                type="button"
                                onClick={() => handleDelete(r.id)} 
                                className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                           >
                                <Trash2 size={14}/> Hapus
                           </button>
                       </div>
                   </div>
               ))}

               {isAdding ? (
                   <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                        <div className="mb-3"><label className="block text-sm font-medium text-slate-700 mb-1">Pertanyaan</label><input className="w-full p-2 border rounded bg-white text-slate-800" placeholder="Contoh: Apa yang sudah berkembang pada anak saya?" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} /></div>
                        <div className="mb-3"><label className="block text-sm font-medium text-slate-700 mb-1">Jawaban Orang Tua</label><textarea className="w-full p-2 border rounded bg-white text-slate-800" rows={2} placeholder="Isi jawaban dari orang tua..." value={newAnswer} onChange={e => setNewAnswer(e.target.value)} /></div>
                        <div className="flex gap-2"><button type="button" onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Simpan</button><button type="button" onClick={() => setIsAdding(false)} className="bg-white text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-100">Batal</button></div>
                   </div>
               ) : (
                   <button type="button" onClick={() => setIsAdding(true)} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2 font-medium"><Plus size={20}/> Tambah Refleksi</button>
               )}
           </div>
       )}
    </div>
  );
};

export default Refleksi;