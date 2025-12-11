import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, BookOpen, GraduationCap, Star, CalendarDays } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { students, classes, tps, p5Criteria, settings } = useApp();

  const stats = [
    { label: "Total Siswa", value: students.length, icon: <GraduationCap size={32} />, color: "bg-blue-500" },
    { label: "Total Kelas", value: classes.length, icon: <Users size={32} />, color: "bg-teal-500" },
    { label: "Total TP", value: tps.length, icon: <BookOpen size={32} />, color: "bg-orange-500" },
    { label: "Total P5", value: p5Criteria.length, icon: <Star size={32} />, color: "bg-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h1>
      
      {/* Highlight Tahun Ajaran */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4">
             <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                 <CalendarDays size={32} />
             </div>
             <div>
                 <p className="text-slate-500 text-sm font-medium">Tahun Pelajaran</p>
                 <h2 className="text-2xl font-bold text-slate-800">{settings.academicYear || "-"}</h2>
             </div>
         </div>
         <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
         <div className="flex items-center gap-4">
             <div>
                 <p className="text-slate-500 text-sm font-medium text-right md:text-left">Semester</p>
                 <h2 className="text-2xl font-bold text-slate-800 text-right md:text-left">{settings.semester || "-"}</h2>
             </div>
         </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={`${stat.color} text-white p-4 rounded-xl shadow-md`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
              <h2 className="text-3xl font-bold text-slate-800">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-10 -translate-y-10">
            <GraduationCap size={200} />
        </div>
        <h2 className="text-2xl font-bold mb-2 relative z-10">Selamat Datang di Aplikasi Rapor Merdeka!</h2>
        <p className="text-indigo-100 mb-6 max-w-2xl relative z-10 text-sm leading-relaxed">
          Aplikasi ini dirancang khusus untuk membantu Bapak/Ibu Guru PAUD KUSUMA dalam menyusun laporan perkembangan anak (Rapor) Kurikulum Merdeka secara efisien. 
          Manfaatkan fitur <strong>AI Generator</strong> untuk membuat narasi deskripsi yang unik dan personal untuk setiap anak.
        </p>
        <div className="relative z-10 flex gap-3">
             <button onClick={() => window.location.hash = '#/nilai'} className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 shadow-sm">
                 Mulai Input Nilai
             </button>
             <button onClick={() => window.location.hash = '#/siswa'} className="bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-900 shadow-sm border border-indigo-500">
                 Kelola Data Siswa
             </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;