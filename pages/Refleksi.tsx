import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Reflection } from '../types';
import { Plus, Trash2, Save, Filter, X, Edit2, MessageCircle } from 'lucide-react';

const Refleksi: React.FC = () => {
  const { students, classes, reflections, addReflection, updateReflection, deleteReflection, confirmAction } = useApp();
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const filteredStudents = selectedClassId 
    ? students.filter(s => String(s.classId) === String(selectedClassId))
    : [];

  const studentReflections = reflections.filter(r => String(r.studentId) === String(selectedStudentId));

  const handleOpenModal = (r?: Reflection) => {
    if (r) {
        setIsEditing(r.id);
        setQuestion(r.question);
        setAnswer(r.answer);
    } else {
        setIsEditing(null);
        setQuestion('');
        setAnswer('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setIsEditing(null);
  };

  const handleSave = () => {
    if (!question || !answer) return alert("Pertanyaan dan Jawaban harus diisi");
    
    if (isEditing) {
        // Find existing to preserve other fields if any, though here we just have simple fields
        const existing = studentReflections.find(r => r.id === isEditing);
        if (existing) {
            updateReflection({ ...existing, question, answer });
        }
    } else {
        addReflection({
            id: Date.now().toString(),
            studentId: selectedStudentId,
            question,
            answer
        });
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAction("Apakah Anda yakin ingin menghapus Refleksi ini?");
    if (isConfirmed) {
        deleteReflection(String(id));
    }
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold text-slate-800">Refleksi Orang Tua</h1>
       </div>
       
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

       {selectedStudentId ? (
           <div className="space-y-4">
               {studentReflections.length > 0 ? (
                   studentReflections.map(r => (
                       <div key={r.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-start">
                           <div className="flex-1 space-y-2">
                               <div>
                                   <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Pertanyaan Refleksi</span>
                                   <p className="font-medium text-slate-800">{r.question}</p>
                               </div>
                               <div>
                                   <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">Jawaban Orang Tua</span>
                                   <p className="text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">"{r.answer}"</p>
                               </div>
                           </div>
                           <div className="flex gap-2 self-end md:self-start">
                               <button 
                                    onClick={() => handleOpenModal(r)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                    title="Edit"
                               >
                                   <Edit2 size={18}/>
                               </button>
                               <button 
                                    onClick={() => handleDelete(r.id)} 
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    title="Hapus"
                               >
                                    <Trash2 size={18}/>
                               </button>
                           </div>
                       </div>
                   ))
               ) : (
                   <div className="text-center p-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                       <MessageCircle size={32} className="mx-auto mb-2 opacity-30"/>
                       <p>Belum ada data refleksi untuk siswa ini.</p>
                   </div>
               )}
               
               <button 
                    onClick={() => handleOpenModal()} 
                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2 font-bold transition-all bg-slate-50 hover:bg-white"
                >
                    <Plus size={20}/> Tambah Refleksi Baru
                </button>
           </div>
       ) : (
          <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
             <Filter size={48} className="mx-auto mb-4 opacity-20 text-slate-400"/>
             <p className="text-slate-400 font-medium">Silakan pilih siswa terlebih dahulu untuk melihat dan menambah Refleksi.</p>
          </div>
       )}

       {/* MODAL FORM */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-bold text-slate-800">{isEditing ? "Edit Refleksi" : "Tambah Refleksi Baru"}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pertanyaan Refleksi</label>
                <input 
                    className="w-full p-3 border rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Contoh: Apa yang paling disukai ananda di sekolah?"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jawaban Orang Tua</label>
                <textarea 
                    className="w-full p-3 border rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                    rows={4}
                    placeholder="Tuliskan jawaban dari orang tua..."
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                />
              </div>
            </div>

            <div className="p-5 border-t bg-slate-50 rounded-b-xl flex justify-end gap-2">
                <button onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 font-medium text-sm">Batal</button>
                <button onClick={handleSave} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium text-sm shadow-sm flex items-center gap-2">
                    <Save size={16} /> Simpan
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refleksi;