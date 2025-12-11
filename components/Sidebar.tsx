import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, PenTool, Printer, Settings, 
  Star, MessageCircle, FileText, CalendarCheck, X, ChevronDown, ChevronRight, Database, ClipboardList
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type MenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  to?: string;
  children?: MenuItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { settings } = useApp();
  const location = useLocation();
  
  // Default state kosong ({}) agar semua menu tertutup saat awal dimuat
  // Kecuali jika ada logic useEffect di bawah yang mendeteksi URL aktif
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const menuStructure: MenuItem[] = [
    { 
      key: 'dashboard', 
      to: "/", 
      icon: <LayoutDashboard size={20} />, 
      label: "Dashboard" 
    },
    {
      key: 'master',
      label: "Data Master",
      icon: <Database size={20} />,
      children: [
        { key: 'kelas', to: "/kelas", icon: <Users size={18} />, label: "Data Kelas" },
        { key: 'siswa', to: "/siswa", icon: <GraduationCap size={18} />, label: "Data Siswa" },
        { key: 'tp', to: "/tp", icon: <BookOpen size={18} />, label: "Input TP" },
        { key: 'p5', to: "/kokurikuler", icon: <Star size={18} />, label: "Kokurikuler (P5)" },
      ]
    },
    {
      key: 'nilai',
      label: "Input Nilai",
      icon: <ClipboardList size={20} />,
      children: [
        { key: 'input_nilai', to: "/nilai", icon: <PenTool size={18} />, label: "Input Nilai Rapor" },
        { key: 'refleksi', to: "/refleksi", icon: <MessageCircle size={18} />, label: "Refleksi Ortu" },
        { key: 'catatan', to: "/catatan", icon: <FileText size={18} />, label: "Catatan Anak" },
        { key: 'kehadiran', to: "/kehadiran", icon: <CalendarCheck size={18} />, label: "Kehadiran" },
      ]
    },
    { 
      key: 'cetak', 
      to: "/cetak", 
      icon: <Printer size={20} />, 
      label: "Cetak Rapor" 
    },
    { 
      key: 'pengaturan', 
      to: "/pengaturan", 
      icon: <Settings size={20} />, 
      label: "Pengaturan" 
    },
  ];

  // Auto expand menu based on active route
  // Menu akan otomatis terbuka HANYA jika pengguna sedang berada di halaman anak (sub-menu) tersebut
  useEffect(() => {
    const newOpenState = { ...openMenus };
    let hasChange = false;

    menuStructure.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => child.to === location.pathname);
        // Jika anak aktif dan menu induk belum terbuka, maka buka
        if (isChildActive && !newOpenState[item.key]) {
          newOpenState[item.key] = true;
          hasChange = true;
        }
      }
    });

    if (hasChange) setOpenMenus(newOpenState);
  }, [location.pathname]);

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
             {/* Close Button (Mobile Only) */}
             <button 
              onClick={onClose}
              className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Logo Container */}
            <div className="w-16 h-16 bg-white rounded-full p-1 mb-3 flex items-center justify-center overflow-hidden border-4 border-slate-600 shadow-lg">
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
              <p className="text-xs font-semibold text-teal-400 mt-1 uppercase tracking-wider">
                {settings.name || "PAUD KUSUMA"}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {menuStructure.map((item) => (
              <div key={item.key} className="mb-1">
                {item.children ? (
                  // PARENT MENU (Dropdown)
                  <div>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 text-slate-300 hover:bg-slate-800 hover:text-white ${openMenus[item.key] ? 'bg-slate-800 text-white' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {openMenus[item.key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    
                    {/* SUB MENUS */}
                    {openMenus[item.key] && (
                      <div className="ml-4 pl-4 border-l border-slate-700 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.children.map(child => (
                          <NavLink
                            key={child.key}
                            to={child.to!}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                                isActive
                                  ? "bg-teal-600 text-white shadow-md"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                              }`
                            }
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // SINGLE MENU
                  <NavLink
                    to={item.to!}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-teal-600 text-white shadow-lg"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    {item.icon}
                    <span className="font-medium text-sm">{item.label}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-slate-700 text-center bg-slate-900">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Versi Aplikasi 1.0</p>
            <p className="text-xs font-bold text-slate-300">By PAUD KUSUMA Mijen Demak</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;