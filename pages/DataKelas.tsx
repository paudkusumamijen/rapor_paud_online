import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClassData } from '../types';
import { Trash2, Edit2, Plus } from 'lucide-react';

const DataKelas: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass, confirmAction } = useApp();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ClassData>>({});

  const handleSave = () => {
    if (!formData.name || !formData.teacherName) return alert("Nama Kelas dan Wali Kelas wajib diisi");
    
    if (isEditing) {
      updateClass({ ...formData, id: isEditing } as ClassData);
    } else {
      addClass({ ...formData, id: Date.now().toString() } as ClassData);
    }
    setFormData({});
    setIsEditing(null);
  };

  const handleEdit = (cls: ClassData) => {
    setIsEditing(cls.id);
    setFormData(cls);
  };

  const handleDelete = async (id: string) => {
    const className = classes.find(c => c.id === id)?.name || "ini";
    const isConfirmed = await confirmAction(`Apakah Anda yakin ingin menghapus Kelas "${className}" ini? \nSemua data siswa di dalam kelas ini mungkin akan kehilangan referensi kelasnya.`);
    
    if (isConfirmed) {
        deleteClass(String(id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Data Kelas</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">{isEditing ? "Edit Kelas" : "Tambah Kelas Baru"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            className="p-2 border rounded-lg text-slate-800 bg-white"
            placeholder="Nama Kelas/Kelompok"
            value={formData.name || ''}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="p-2 border rounded-lg text-slate-800 bg-white"
            placeholder="Nama Wali Kelas"
            value={formData.teacherName || ''}
            onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
          />
          <input
            className="p-2 border rounded-lg text-slate-800 bg-white"
            placeholder="NUPTK/GTY"
            value={formData.nuptk || ''}
            onChange={e => setFormData({ ...formData, nuptk: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
            <button onClick={handleSave} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700">
                <Plus size={16} /> Simpan Data
            </button>
            {isEditing && (
                <button onClick={() => { setIsEditing(null); setFormData({}); }} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">
                    Batal
                </button>
            )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600">No</th>
              <th className="p-4 font-semibold text-slate-600">Kelas/Kelompok</th>
              <th className="p-4 font-semibold text-slate-600">Wali Kelas</th>
              <th className="p-4 font-semibold text-slate-600">NUPTK/GTY</th>
              <th className="p-4 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {classes.map((cls, idx) => (
              <tr key={cls.id} className="border-b hover:bg-slate-50">
                <td className="p-4">{idx + 1}</td>
                <td className="p-4 font-medium text-slate-900">{cls.name}</td>
                <td className="p-4">{cls.teacherName}</td>
                <td className="p-4">{cls.nuptk}</td>
                <td className="p-4 flex gap-2">
                  <button 
                    type="button"
                    onClick={() => handleEdit(cls)} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={16}/>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(cls.id)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Hapus Kelas"
                  >
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">Belum ada data kelas.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataKelas;