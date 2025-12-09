import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataKelas from './pages/DataKelas';
import DataSiswa from './pages/DataSiswa';
import InputTP from './pages/InputTP';
import InputNilai from './pages/InputNilai';
import Kokurikuler from './pages/Kokurikuler';
import Refleksi from './pages/Refleksi';
import Catatan from './pages/Catatan';
import Kehadiran from './pages/Kehadiran';
import Cetak from './pages/Cetak';
import Pengaturan from './pages/Pengaturan';
import ConfirmationModal from './components/ConfirmationModal';

const AppContent: React.FC = () => {
  const { isConfirmModalOpen, confirmModalMessage, handleConfirmModalConfirm, handleConfirmModalCancel } = useApp();

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kelas" element={<DataKelas />} />
          <Route path="/siswa" element={<DataSiswa />} />
          <Route path="/tp" element={<InputTP />} />
          <Route path="/nilai" element={<InputNilai />} />
          
          <Route path="/kokurikuler" element={<Kokurikuler />} />
          <Route path="/refleksi" element={<Refleksi />} />
          <Route path="/catatan" element={<Catatan />} />
          <Route path="/kehadiran" element={<Kehadiran />} />
          
          <Route path="/cetak" element={<Cetak />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        message={confirmModalMessage}
        onConfirm={handleConfirmModalConfirm}
        onCancel={handleConfirmModalCancel}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;