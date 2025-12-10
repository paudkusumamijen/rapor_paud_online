
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Users, GraduationCap, BookOpen, PenTool, Printer, Settings, Star, MessageCircle, FileText, CalendarCheck, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { settings } = useApp();

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
    <>
      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out shadow-2xl
          md:translate-x-0 md:static md:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header Sidebar */}
          <div className="p-6 border-b border-slate-700 flex flex-col items-center text-center relative">
             {/* Close Button (Mobile Only) - Absolute positioning */}
             <button 
              onClick={onClose}
              className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Logo Container */}
            <div className="w-20 h-20 bg-white rounded-full p-1 mb-3 flex items-center justify-center overflow-hidden border-4 border-slate-600 shadow-lg">
                <img 
                    src={settings.logoUrl || "https://cdn-icons-png.flaticon.com/512/2997/2997300.png"} 
                    alt="Logo Sekolah" 
                    className="w-full h-full object-contain"
                />
            </div>
            
            {/* Title Text */}
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Rapor Merdeka
              </h1>
              <p className="text-sm font-semibold text-teal-400 mt-1">
                PAUD KUSUMA Mijen
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose} // Auto close sidebar on mobile when link clicked
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-teal-600 text-white shadow-lg translate-x-1"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-slate-700 text-center bg-slate-900">
            <p className="text-xs text-slate-500">v1.1.0 &copy; 2025</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
