import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { students, classes, tps } = useApp();

  const stats = [
    { label: "Total Siswa", value: students.length, icon: <GraduationCap size={32} />, color: "bg-blue-500" },
    { label: "Total Kelas", value: classes.length, icon: <Users size={32} />, color: "bg-teal-500" },
    { label: "Total TP", value: tps.length, icon: <BookOpen size={32} />, color: "bg-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`${stat.color} text-white p-4 rounded-full`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h2 className="text-3xl font-bold text-slate-800">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-2">Selamat Datang di Aplikasi Rapor Merdeka!</h2>
        <p className="text-indigo-100 mb-4 max-w-2xl">
          Aplikasi ini membantu Bapak/Ibu Guru dalam menyusun laporan perkembangan anak usia dini dengan mudah. 
          Gunakan fitur AI Generative untuk membantu merangkai kata-kata deskripsi perkembangan ananda menjadi lebih personal dan menyentuh.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;