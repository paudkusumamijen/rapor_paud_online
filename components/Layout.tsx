
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoading } = useApp();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto h-screen relative">
        {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 z-50">
                <div className="h-full bg-blue-600 animate-pulse"></div>
            </div>
        )}
        <div className="p-8">
          {children}
        </div>
        {isLoading && (
             <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 text-sm">
                <Loader2 className="animate-spin" size={16} /> Menyinkronkan data...
             </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
