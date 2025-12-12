import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LearningObjective, TPType } from '../types';
import { TP_CATEGORIES } from '../constants';
import { Trash2, Edit2, Plus, Filter, X, Save } from 'lucide-react';

const InputTP: React.FC = () => {
  const { tps, classes, addTp, updateTp, deleteTp, confirmAction } = useApp();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LearningObjective>>({ category: TPType.ABP });

  const filteredTps = selectedClassId 
    ? tps.filter(t => String(t.classId) === String(selectedClassId))
    : [];

  const handleOpenModal = (tp?: LearningObjective) => {
    if (tp) {
      setIsEditing(tp.id);
      setFormData(tp);
    } else {
      setIsEditing(null);
      setFormData({ category: TPType.ABP, description: '', activity: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setIsEditing(null);
  };

  const handleSave = () => {
    if (!selectedClassId) { alert("Pilih kelas terlebih dahulu!"); return; }
    if (!formData.description || !formData.activity) { alert("TP dan Aktivitas wajib diisi"); return; }

    const dataToSave = { ...formData, classId: selectedClassId };

    if (isEditing) {
      updateTp({ ...dataToSave, id: isEditing } as LearningObjective);
    } else {
      addTp({ ...dataToSave, id: Date.now().toString() } as LearningObjective);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAction(`Apakah Anda yakin ingin menghapus Tujuan Pembelajaran ini?`);
    if (isConfirmed) {
        deleteTp(String(id));
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Input Tujuan Pembelajaran (TP)</h1>
          {selectedClassId && (
            <button 
                onClick={() => handleOpenModal()} 
                className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 shadow-sm font-medium text-sm"
            >
                <Plus size={18} /> Tambah TP Baru
            </button>
          )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Filter size={18} /> Pilih Kelas
          </label>
          <select 
            className="w-full md:w-1/2 p-2.5 border rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            value={selectedClassId}
            onChange={e => { setSelectedClassId(e.target.value); }}
          >
              <option value="">-- Pilih Kelas untuk Mengelola TP --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
      </div>

      {selectedClassId ? (
        <div className="space-y-6">
            {TP_CATEGORIES.map(category => {
                const categoryTps = filteredTps.filter(t => t.category === category);
                // Kita tetap tampilkan header kategori meskipun kosong agar user tahu strukturnya
                
                return (
                    <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                            <span>{category}</span>
                            <span className="text-xs bg-white px-2 py-1 rounded border text-slate-500 font-normal">{categoryTps.length} TP</span>
                        </div>
                        {categoryTps.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-slate-50/50"><tr><th className="p-3 font-semibold text-slate-600">Tujuan Pembelajaran</th><th className="p-3 font-semibold text-slate-600">Aktivitas</th><th className="p-3 text-right font-semibold text-slate-600">Aksi</th></tr></thead>
                                <tbody className="text-slate-700">
                                    {categoryTps.map(tp => (
                                        <tr key={tp.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="p-3 align-top">{tp.description}</td>
                                            <td className="p-3 align-top text-slate-600 italic">{tp.activity}</td>
                                            <td className="p-3 flex justify-end gap-2 align-top">
                                                <button type="button" onClick={() => handleOpenModal(tp)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"><Edit2 size={16}/></button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDelete(tp.id)} 
                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-6 text-center text-slate-400 italic text-sm">Belum ada TP untuk aspek ini.</div>
                        )}
                    </div>
                )
            })}
        </div>
      ) : (
          <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
             <p className="text-slate-400">Silakan pilih kelas terlebih dahulu untuk melihat dan menambah Tujuan Pembelajaran.</p>
          </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-bold text-slate-800">{isEditing ? "Edit Tujuan Pembelajaran" : "Tambah TP Baru"}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Aspek</label>
                <select 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value as TPType })}
                >
                    {TP_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi TP</label>
                <textarea 
                    className="w-full p-2.5 border rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                    rows={3} 
                    placeholder="Contoh: Mengenal dan mempraktikkan ajaran pokok agamanya..."
                    value={formData.description || ''} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aktivitas Utama</label>
                <input 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Contoh: Praktik Sholat Dhuha"
                    value={formData.activity || ''} 
                    onChange={e => setFormData({ ...formData, activity: e.target.value })}
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

export default InputTP;