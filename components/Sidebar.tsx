
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, PenTool, Printer, Settings, Star, MessageCircle, FileText, CalendarCheck } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/kelas", icon: <Users size={20} />, label: "Data Kelas" },
    { to: "/siswa", icon: <GraduationCap size={20} />, label: "Data Siswa" },
    { to: "/tp", icon: <BookOpen size={20} />, label: "Input TP" },
    { to: "/nilai", icon: <PenTool size={20} />, label: "Input Nilai & AI" },
    { to: "/kokurikuler", icon: <Star size={20} />, label: "Kokurikuler (P5)" },
    { to: "/refleksi", icon: <MessageCircle size={20} />, label: "Refleksi Ortu" },
    { to: "/catatan", icon: <FileText size={20} />, label: "Catatan Anak" },
    { to: "/kehadiran", icon: <CalendarCheck size={20} />, label: "Kehadiran" },
    { to: "/cetak", icon: <Printer size={20} />, label: "Cetak Rapor" },
    { to: "/pengaturan", icon: <Settings size={20} />, label: "Pengaturan" },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col no-print overflow-y-auto">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
          Rapor Merdeka
        </h1>
        <p className="text-xs text-slate-400 mt-1">PAUD KUSUMA MIJEN</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-teal-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700 text-center">
        <p className="text-xs text-slate-500">v1.1.0 &copy; 2025</p>
      </div>
    </div>
  );
};

export default Sidebar;
