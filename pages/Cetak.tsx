
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TP_CATEGORIES } from '../constants';
import { Printer, Eye } from 'lucide-react';
import { AssessmentLevel } from '../types';

const Cetak: React.FC = () => {
  const { students, assessments, categoryResults, settings, classes, tps, p5Criteria, p5Assessments, reflections, notes, attendance } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentClass = classes.find(c => c.id === selectedStudent?.classId);

  // Filter Data for Selected Student
  const studentReflections = reflections.filter(r => String(r.studentId) === String(selectedStudentId));
  const studentNote = notes.find(n => String(n.studentId) === String(selectedStudentId));
  const studentAttendance = attendance.find(a => String(a.studentId) === String(selectedStudentId)) || { sick: 0, permission: 0, alpha: 0 };

  const handlePrint = () => {
    if (!selectedStudent) { alert("Pilih siswa terlebih dahulu."); return; }

    const contentElement = document.getElementById('print-area-all');
    if (!contentElement) return;

    const title = `Rapor - ${selectedStudent.name}`;
    
    // Buka Tab Baru
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Pop-up diblokir. Izinkan pop-up untuk mencetak.");
        return;
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                body { 
                    font-family: 'Inter', sans-serif; 
                    background: white; 
                    color: black;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact; 
                }
                
                @page { 
                    size: A4; 
                    margin: 0; 
                }

                .sheet { 
                    width: 210mm; 
                    min-height: 297mm; 
                    padding: 15mm 20mm; 
                    margin: 0 auto; 
                    position: relative; 
                    box-sizing: border-box; 
                    page-break-after: always;
                    background: white;
                }
                
                .sheet:last-child { 
                    page-break-after: auto; 
                }

                /* Table Styles */
                table { border-collapse: collapse; width: 100%; font-size: 12px; }
                th, td { border: 1px solid #000; padding: 6px; }
                th { text-align: center; font-weight: bold; }
                
                .no-border-table td, .no-border-table th { border: none !important; padding: 2px 4px; }
                
                /* Helper classes */
                .text-justify { text-align: justify; }
                .font-bold { font-weight: 700; }
                .uppercase { text-transform: uppercase; }
                .text-center { text-align: center; }
                
                /* Color utilities for print */
                .bg-yellow-100 { background-color: #fef9c3 !important; }
                .bg-green-100 { background-color: #dcfce7 !important; }
                .bg-blue-100 { background-color: #dbeafe !important; }
            </style>
        </head>
        <body>
            ${contentElement.innerHTML}
            <script>
                // Tunggu sebentar agar gambar/font terload, lalu print
                setTimeout(() => {
                    window.print();
                }, 800);
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getScoreStyle = (score: number) => {
      switch (score) {
          case 1: return "bg-yellow-100 text-yellow-900"; // Berkembang - Kuning Transparan
          case 2: return "bg-green-100 text-green-900";   // Cakap - Hijau Transparan
          case 3: return "bg-blue-100 text-blue-900";     // Mahir - Biru Transparan
          default: return "";
      }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Cetak Rapor</h1>
            <p className="text-sm text-slate-500">Preview ukuran kertas A4. Klik tombol cetak untuk membuka dokumen PDF.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
             <select 
                className="p-2.5 border rounded-lg text-slate-800 bg-white min-w-[250px] shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
            >
                <option value="">-- Pilih Siswa --</option>
                {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            
            <button 
                onClick={handlePrint} 
                disabled={!selectedStudentId}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-lg font-bold"
            >
                <Printer size={18} /> Cetak / Buka PDF
            </button>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-700 overflow-auto p-8 flex justify-center rounded-xl border border-slate-600 relative shadow-inner">
        {selectedStudent ? (
            // WRAPPER FOR ALL PAGES (HIDDEN VISUALLY BUT USED FOR CLONING TO PRINT WINDOW)
            <div id="print-area-all" className="transform scale-[0.6] md:scale-[0.85] origin-top transition-transform">
                
                {/* ================= SHEET 1: COVER ================= */}
                {/* A4 Size: 210mm x 297mm */}
                <div className="sheet bg-white shadow-2xl mb-8 mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '15mm 20mm' }}>
                     <div className="w-full h-full border-[3px] border-double border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-between" style={{ minHeight: 'calc(297mm - 30mm)' }}>
                        <div className="mt-10 text-center">
                            <img 
                                src={settings.logoUrl || "https://cdn-icons-png.flaticon.com/512/2997/2997300.png"} 
                                alt="Logo Sekolah" 
                                className="w-40 h-40 mb-8 object-contain mx-auto"
                            />
                            
                            <h1 className="text-3xl font-extrabold uppercase tracking-wide text-slate-900 mb-2">
                                Laporan Hasil
                            </h1>
                            <h2 className="text-xl font-bold uppercase text-slate-700">
                                Capaian Perkembangan Peserta Didik<br/>
                                Pendidikan Anak Usia Dini (PAUD)
                            </h2>
                        </div>

                        <div className="w-full text-center">
                            <p className="text-sm font-semibold text-slate-500 uppercase mb-2 tracking-widest">Nama Peserta Didik</p>
                            <div className="border-2 border-slate-800 rounded-xl py-4 px-8 bg-slate-50 inline-block w-4/5">
                                <h3 className="text-2xl font-bold uppercase">{selectedStudent.name}</h3>
                            </div>
                        </div>

                        <div className="mb-10 text-center">
                            <p className="text-sm font-semibold text-slate-500 uppercase mb-1 tracking-widest">NISN</p>
                            <p className="text-xl font-bold">{selectedStudent.nisn}</p>
                        </div>

                        <div className="mb-10 w-full border-t-2 border-slate-200 pt-8 text-center">
                            <h3 className="text-xl font-bold uppercase mb-1">{settings.name}</h3>
                            <p className="text-sm font-medium text-slate-600 uppercase">
                                KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI <br/>
                                REPUBLIK INDONESIA
                            </p>
                        </div>
                     </div>
                </div>

                {/* ================= SHEET 2: IDENTITY ================= */}
                <div className="sheet bg-white shadow-2xl mb-8 mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '15mm 20mm' }}>
                    <div className="text-center mb-8">
                        <div className="inline-block bg-slate-900 text-white px-6 py-1.5 rounded-full mb-4 font-bold tracking-widest uppercase text-xs">
                            PAUD MERDEKA
                        </div>
                        <h1 className="text-xl font-black uppercase text-slate-800 tracking-wide underline underline-offset-4 decoration-2 decoration-teal-500">
                            Keterangan Diri Anak Didik
                        </h1>
                    </div>

                    <table className="w-full no-border-table text-sm leading-loose">
                        <tbody>
                            <tr><td className="w-6 font-bold text-slate-400">1.</td><td className="w-48 font-semibold">Nama Lengkap</td><td className="w-4">:</td><td className="uppercase font-bold text-slate-900">{selectedStudent.name}</td></tr>
                            <tr><td className="font-bold text-slate-400">2.</td><td className="font-semibold">NISN</td><td>:</td><td>{selectedStudent.nisn}</td></tr>
                            <tr><td className="font-bold text-slate-400">3.</td><td className="font-semibold">Tempat, Tanggal Lahir</td><td>:</td><td className="uppercase">{selectedStudent.pob}, {selectedStudent.dob}</td></tr>
                            <tr><td className="font-bold text-slate-400">4.</td><td className="font-semibold">Jenis Kelamin</td><td>:</td><td>{selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
                            <tr><td className="font-bold text-slate-400">5.</td><td className="font-semibold">Agama</td><td>:</td><td className="uppercase">{selectedStudent.religion}</td></tr>
                            <tr><td className="font-bold text-slate-400">6.</td><td className="font-semibold">Anak Ke-</td><td>:</td><td>{selectedStudent.childOrder}</td></tr>
                            
                            <tr><td colSpan={4} className="pt-4 pb-1 font-bold text-teal-700 uppercase tracking-wide border-b border-slate-200">Orang Tua / Wali</td></tr>
                            
                            <tr><td className="font-bold text-slate-400 pt-2">7.</td><td className="font-semibold pt-2">Nama Ayah</td><td className="pt-2">:</td><td className="uppercase pt-2">{selectedStudent.fatherName}</td></tr>
                            <tr><td className="font-bold text-slate-400">8.</td><td className="font-semibold">Pekerjaan Ayah</td><td>:</td><td className="uppercase">{selectedStudent.fatherJob}</td></tr>
                            <tr><td className="font-bold text-slate-400">9.</td><td className="font-semibold">Nama Ibu</td><td>:</td><td className="uppercase">{selectedStudent.motherName}</td></tr>
                            <tr><td className="font-bold text-slate-400">10.</td><td className="font-semibold">Pekerjaan Ibu</td><td>:</td><td className="uppercase">{selectedStudent.motherJob}</td></tr>
                            <tr><td className="font-bold text-slate-400">11.</td><td className="font-semibold">No. Telepon / HP</td><td>:</td><td>{selectedStudent.phone}</td></tr>
                            <tr><td className="font-bold text-slate-400 align-top">12.</td><td className="font-semibold align-top">Alamat Lengkap</td><td className="align-top">:</td><td className="align-top">{selectedStudent.address}</td></tr>
                        </tbody>
                    </table>

                    <div className="mt-8 flex justify-between items-end">
                         {/* Photo */}
                         <div className="w-32 flex flex-col items-center ml-8">
                            <div className="w-28 h-36 border-2 border-dashed border-slate-400 flex items-center justify-center bg-slate-50 overflow-hidden relative shadow-sm">
                                {selectedStudent.photoUrl ? (
                                    <img src={selectedStudent.photoUrl} className="w-full h-full object-cover" alt="Foto Siswa" />
                                ) : (
                                    <div className="text-center p-2 text-slate-400">
                                        <p className="text-[10px]">Tempel Foto</p>
                                        <p className="text-sm font-bold">3 x 4</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center w-60">
                            <p className="text-sm">{settings.reportPlace}, {settings.reportDate}</p>
                            <p className="text-sm font-bold mb-16">Kepala Sekolah</p>
                            <p className="font-bold underline text-sm">{settings.headmaster}</p>
                        </div>
                    </div>
                </div>

                {/* ================= SHEET 3: RAPOR ISI ================= */}
                <div className="sheet bg-white shadow-2xl mb-8 mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '15mm 20mm' }}>
                    <div className="text-center mb-6">
                        <h2 className="text-md font-bold uppercase leading-tight">
                            LAPORAN HASIL PERKEMBANGAN PESERTA DIDIK<br/>
                            PENDIDIKAN ANAK USIA DINI (PAUD)
                        </h2>
                    </div>

                    <div className="flex justify-between items-start text-xs mb-6 font-medium border-b-2 border-double border-slate-300 pb-2">
                        <div className="w-[55%]">
                            <table className="w-full no-border-table">
                                <tbody>
                                    <tr><td className="w-28 align-top">Nama Sekolah</td><td className="w-2 align-top">:</td><td className="uppercase">{settings.name}</td></tr>
                                    <tr><td className="align-top">Nama Peserta Didik</td><td className="align-top">:</td><td className="uppercase font-bold">{selectedStudent.name}</td></tr>
                                    <tr><td className="align-top">NIK / NISN</td><td className="align-top">:</td><td>{selectedStudent.nisn}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="w-[40%]">
                            <table className="w-full no-border-table">
                                <tbody>
                                    <tr><td className="w-24 align-top">Kelas / Fase</td><td className="w-2 align-top">:</td><td className="uppercase">{studentClass?.name} / Fondasi</td></tr>
                                    <tr><td className="align-top">Sem / Th. Ajaran</td><td className="align-top">:</td><td>{settings.semester} / {settings.academicYear}</td></tr>
                                    <tr><td className="align-top">TB / BB</td><td className="align-top">:</td><td>{selectedStudent.height || 0} cm / {selectedStudent.weight || 0} kg</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* I. CAPAIAN PEMBELAJARAN (INTRAKURIKULER) */}
                    <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">I. Capaian Pembelajaran</h3>
                    <div className="space-y-4 mb-6">
                        {TP_CATEGORIES.map(category => {
                            const catTps = tps.filter(t => t.category === category && String(t.classId) === String(selectedStudent.classId));
                            if (catTps.length === 0) return null;

                            const catAssessments = assessments.filter(a => String(a.studentId) === String(selectedStudent.id) && catTps.some(t => String(t.id) === String(a.tpId)));
                            const catResult = categoryResults.find(r => String(r.studentId) === String(selectedStudent.id) && r.category === category);
                            
                            return (
                                <div key={category} className="mb-4">
                                    <div className="font-bold text-xs uppercase mb-1 pl-1 border-l-4 border-slate-800">
                                        {category}
                                    </div>
                                    <table className="w-full mb-0">
                                        <thead>
                                            <tr>
                                                <th className="p-1 w-[35%] text-left bg-white">Tujuan Pembelajaran</th>
                                                <th className="p-1 w-[40%] text-left bg-white">Aktivitas</th>
                                                <th className="p-1 text-center bg-white">Nilai</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {catTps.map((tp) => {
                                                const ass = catAssessments.find(a => String(a.tpId) === String(tp.id));
                                                const score = ass?.score || 0;
                                                return (
                                                    <tr key={tp.id}>
                                                        <td className="align-top text-[11px]">{tp.description}</td>
                                                        <td className="align-top text-[11px] text-slate-600 italic">{tp.activity}</td>
                                                        <td className={`align-middle text-center font-bold text-[10px] uppercase p-1 ${getScoreStyle(score)}`}>
                                                            {score === 1 && "Berkembang"}
                                                            {score === 2 && "Cakap"}
                                                            {score === 3 && "Mahir"}
                                                            {!score && "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <div className="border border-t-0 border-black p-2 bg-slate-50">
                                        <p className="text-[10px] font-bold text-slate-500 mb-0.5">DESKRIPSI:</p>
                                        <p className="text-justify text-[11px] leading-tight">{catResult?.generatedDescription || "-"}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* II. KOKURIKULER (P5) */}
                    {p5Criteria.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">II. Projek Penguatan Profil Pelajar Pancasila (P5)</h3>
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="p-1 w-[30%] text-left bg-white">Dimensi</th>
                                        <th className="p-1 text-left bg-white">Deskripsi Capaian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {p5Criteria.map((c) => {
                                        const assessment = p5Assessments.find(a => String(a.studentId) === String(selectedStudentId) && String(a.criteriaId) === String(c.id));
                                        const score = assessment?.score;
                                        let desc = assessment?.generatedDescription;
                                        if (!desc) {
                                            if (score === AssessmentLevel.BERKEMBANG) desc = c.descBerkembang;
                                            else if (score === AssessmentLevel.CAKAP) desc = c.descCakap;
                                            else if (score === AssessmentLevel.MAHIR) desc = c.descMahir;
                                            else desc = "-";
                                        }
                                        return (
                                            <tr key={c.id}>
                                                <td className="align-top font-bold text-[11px]">{c.subDimension}</td>
                                                <td className="align-top text-justify text-[11px] leading-tight relative">
                                                    {desc}
                                                    {score && <span className={`absolute top-1 right-1 text-[9px] px-1 rounded border ${getScoreStyle(score)}`}>{score === 1 ? 'MB' : score === 2 ? 'BSH' : 'SB'}</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* III. REFLEKSI & IV. CATATAN & V. KEHADIRAN */}
                    <div className="flex gap-4 mb-4" style={{ pageBreakInside: 'avoid' }}>
                         <div className="flex-1 space-y-4">
                             {/* REFLEKSI */}
                             {studentReflections.length > 0 && (
                                <div>
                                     <h3 className="text-xs font-bold text-slate-900 uppercase mb-1">III. Refleksi Orang Tua</h3>
                                     <div className="border border-black p-2 space-y-2 text-[11px]">
                                        {studentReflections.map(r => (
                                            <div key={r.id}><p className="font-bold text-slate-700">{r.question}</p><p className="italic pl-2 text-slate-900">"{r.answer}"</p></div>
                                        ))}
                                     </div>
                                </div>
                             )}
                             {/* CATATAN */}
                             <div>
                                 <h3 className="text-xs font-bold text-slate-900 uppercase mb-1">IV. Catatan Guru</h3>
                                 <div className="border border-black p-2 text-[11px] text-justify min-h-[50px]">{studentNote?.note || "-"}</div>
                             </div>
                         </div>

                         {/* KEHADIRAN */}
                         <div className="w-1/3">
                             <h3 className="text-xs font-bold text-slate-900 uppercase mb-1">V. Kehadiran</h3>
                             <table className="w-full text-xs">
                                <tbody>
                                    <tr><td className="p-1">Sakit</td><td className="p-1 text-center font-bold">{studentAttendance.sick}</td></tr>
                                    <tr><td className="p-1">Izin</td><td className="p-1 text-center font-bold">{studentAttendance.permission}</td></tr>
                                    <tr><td className="p-1">Tanpa Ket.</td><td className="p-1 text-center font-bold">{studentAttendance.alpha}</td></tr>
                                </tbody>
                             </table>
                         </div>
                    </div>

                    {/* SIGNATURES */}
                    <div className="flex justify-between text-xs mt-8" style={{ pageBreakInside: 'avoid' }}>
                        <div className="text-center w-40">
                            <p>Mengetahui,</p>
                            <p>Orang Tua/Wali,</p>
                            <div className="h-16"></div>
                            <p className="border-b border-black inline-block px-8 w-32 mx-auto"></p>
                        </div>
                        <div className="text-center w-40">
                            <p>{settings.reportPlace}, {settings.reportDate}</p>
                            <p>Wali Kelas,</p>
                            <div className="h-16"></div>
                            <p className="font-bold underline">{studentClass?.teacherName || settings.teacher}</p>
                            <p>NUPTK: {studentClass?.nuptk || '-'}</p>
                        </div>
                    </div>
                     <div className="mt-4 text-center text-xs" style={{ pageBreakInside: 'avoid' }}>
                        <p>Mengetahui,</p>
                        <p>Kepala Sekolah</p>
                        <div className="h-16"></div>
                        <p className="font-bold underline">{settings.headmaster}</p>
                    </div>
                </div>
            </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white m-4 rounded-xl border border-dashed border-slate-300">
            <Eye size={64} className="mb-4 text-slate-200"/>
            <p className="text-lg font-medium text-slate-500">Preview Rapor (A4)</p>
            <p className="text-sm">Silakan pilih siswa di menu atas untuk melihat preview rapor.</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default Cetak;
