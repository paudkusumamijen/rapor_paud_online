import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LearningObjective, TPType } from '../types';
import { TP_CATEGORIES } from '../constants';
import { Trash2, Edit2, Plus, Filter } from 'lucide-react';

const InputTP: React.FC = () => {
  const { tps, classes, addTp, updateTp, deleteTp, confirmAction } = useApp();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LearningObjective>>({ category: TPType.ABP });

  const filteredTps = selectedClassId 
    ? tps.filter(t => String(t.classId) === String(selectedClassId))
    : [];

  const handleSave = () => {
    if (!selectedClassId) { alert("Pilih kelas terlebih dahulu!"); return; }
    if (!formData.description || !formData.activity) { alert("TP dan Aktivitas wajib diisi"); return; }

    const dataToSave = { ...formData, classId: selectedClassId };

    if (isEditing) {
      updateTp({ ...dataToSave, id: isEditing } as LearningObjective);
    } else {
      addTp({ ...dataToSave, id: Date.now().toString() } as LearningObjective);
    }
    setFormData({ category: formData.category, description: '', activity: '' });
    setIsEditing(null);
  };

  const handleEdit = (tp: LearningObjective) => {
    setIsEditing(tp.id);
    setFormData(tp);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAction(`Apakah Anda yakin ingin menghapus Tujuan Pembelajaran ini?`);
    
    if (isConfirmed) {
        deleteTp(String(id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Input Tujuan Pembelajaran (TP)</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Filter size={18} /> Pilih Kelas
          </label>
          <select 
            className="w-full md:w-1/2 p-2 border rounded-lg text-slate-800 bg-white"
            value={selectedClassId}
            onChange={e => { setSelectedClassId(e.target.value); setIsEditing(null); }}
          >
              <option value="">-- Pilih Kelas --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
      </div>

      {selectedClassId && (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-slate-700">{isEditing ? "Edit TP" : "Tambah TP Baru"}</h2>
                <div className="grid grid-cols-1 gap-4">
                    <select 
                        className="w-full p-2 border rounded-lg text-slate-800 bg-white"
                        value={formData.category} 
                        onChange={e => setFormData({ ...formData, category: e.target.value as TPType })}
                    >
                        {TP_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <textarea 
                        className="w-full p-2 border rounded-lg bg-white text-slate-800"
                        rows={2} placeholder="Tujuan Pembelajaran..."
                        value={formData.description || ''} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                    <input 
                        className="w-full p-2 border rounded-lg text-slate-800 bg-white"
                        placeholder="Aktivitas Utama"
                        value={formData.activity || ''} 
                        onChange={e => setFormData({ ...formData, activity: e.target.value })}
                    />
                </div>
                <div className="mt-4 flex gap-2">
                    <button type="button" onClick={handleSave} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700"><Plus size={16} /> Simpan TP</button>
                    {isEditing && <button type="button" onClick={() => { setIsEditing(null); setFormData({ category: TPType.ABP, description: '', activity: '' }); }} className="bg-slate-500 text-white px-4 py-2 rounded-lg">Batal</button>}
                </div>
            </div>

            <div className="space-y-6">
                {TP_CATEGORIES.map(category => {
                    const categoryTps = filteredTps.filter(t => t.category === category);
                    if (categoryTps.length === 0) return null;

                    return (
                        <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700">{category}</div>
                            <table className="w-full text-left text-sm">
                                <thead className="border-b"><tr><th className="p-3">Tujuan Pembelajaran</th><th className="p-3">Aktivitas</th><th className="p-3 text-right">Aksi</th></tr></thead>
                                <tbody className="text-slate-700">
                                    {categoryTps.map(tp => (
                                        <tr key={tp.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="p-3">{tp.description}</td>
                                            <td className="p-3 text-slate-600">{tp.activity}</td>
                                            <td className="p-3 flex justify-end gap-2">
                                                <button type="button" onClick={() => handleEdit(tp)} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Edit2 size={16}/></button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDelete(tp.id)} 
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                })}
            </div>
        </>
      )}
    </div>
  );
};

export default InputTP;