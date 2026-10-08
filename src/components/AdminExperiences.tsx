import React, { useState } from 'react';
import { Experience, ExperienceMedia } from '../types';
import { 
  Plus, 
  Trash2, 
  History, 
  X, 
  Edit3,
  Upload,
  MapPin,
  Building2,
  Image as ImageIcon,
  Camera,
  Eye
} from 'lucide-react';

interface AdminExperiencesProps {
  experiences: Experience[];
  onAddExperience: (exp: Omit<Experience, 'id'>) => void;
  onUpdateExperience: (exp: Experience) => void;
  onDeleteExperience: (id: string) => void;
  isDarkMode?: boolean;
}

export default function AdminExperiences({
  experiences,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  isDarkMode = false
}: AdminExperiencesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  // Form Fields - Add Form
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [years, setYears] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [location, setLocation] = useState('');
  const [logo, setLogo] = useState('');
  const [mediaList, setMediaList] = useState<ExperienceMedia[]>([]);

  // Form Fields - Edit Form
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editYears, setEditYears] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editMediaList, setEditMediaList] = useState<ExperienceMedia[]>([]);

  const [dragActive, setDragActive] = useState(false);
  const [mediaDragActive, setMediaDragActive] = useState(false);

  // Modal for previewing single media image
  const [previewMedia, setPreviewMedia] = useState<{ url: string; caption: string } | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Helper to upload media file to server so it saves as clean URL /uploads/... 
  // and prevents Firestore document size limit from failing and reverting!
  const uploadFileToServer = async (fileData: string, fileName?: string, folder?: string): Promise<string> => {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData, fileName, folder: folder || 'exp' })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          return json.url;
        }
      }
    } catch (err) {
      console.error("Upload to server failed, falling back to base64:", err);
    }
    return fileData; // Fallback to base64 if server upload fails
  };

  // Logo Compression (HD Quality with sharp alpha transparency)
  const handleLogoUpload = (file: File, isEdit: boolean) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (!base64) return;

      // If transparent PNG or SVG under 300KB, preserve pristine transparent file
      if ((file.type.includes('png') || file.type.includes('svg')) && file.size < 300000) {
        const serverUrl = await uploadFileToServer(base64, file.name, 'logo');
        if (isEdit) {
          setEditLogo(serverUrl);
        } else {
          setLogo(serverUrl);
        }
        return;
      }

      const img = new Image();
      img.src = base64;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        let finalLogo = base64;
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          finalLogo = canvas.toDataURL('image/png');
        }
        
        // Upload logo to server for clean URL
        const serverUrl = await uploadFileToServer(finalLogo, file.name, 'logo');
        if (isEdit) {
          setEditLogo(serverUrl);
        } else {
          setLogo(serverUrl);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Compress Documentation Photos (Crisp HD Quality up to 2560px with high smoothing)
  const compressMediaPhoto = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const img = new Image();
        img.src = base64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 2560;
          const MAX_HEIGHT = 1920;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.94));
          } else {
            resolve(base64);
          }
        };
        img.onerror = () => resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Multi-file Upload for Media Documentation with server upload
  const handleMediaUpload = async (files: FileList | null, isEdit: boolean) => {
    if (!files || files.length === 0) return;
    setIsUploadingMedia(true);
    try {
      const newItems: ExperienceMedia[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await compressMediaPhoto(file);
        // Upload to server to get permanent clean URL and prevent Firestore 1MB overflow!
        const serverUrl = await uploadFileToServer(compressedBase64, file.name, 'exp');
        
        // Auto-generate a readable default caption from file name
        const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const formattedName = cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1);
        newItems.push({
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: serverUrl,
          caption: formattedName || 'Foto Dokumentasi Kegiatan'
        });
      }

      if (isEdit) {
        setEditMediaList(prev => [...prev, ...newItems]);
      } else {
        setMediaList(prev => [...prev, ...newItems]);
      }
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleUpdateCaption = (id: string, newCaption: string, isEdit: boolean) => {
    if (isEdit) {
      setEditMediaList(prev => prev.map(m => m.id === id ? { ...m, caption: newCaption } : m));
    } else {
      setMediaList(prev => prev.map(m => m.id === id ? { ...m, caption: newCaption } : m));
    }
  };

  const handleRemoveMedia = (id: string, isEdit: boolean) => {
    if (isEdit) {
      setEditMediaList(prev => prev.filter(m => m.id !== id));
    } else {
      setMediaList(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !years || !description) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    onAddExperience({
      title,
      company,
      years,
      description,
      tags,
      location: location || '',
      logo: logo || '',
      media: mediaList
    });

    setTitle('');
    setCompany('');
    setYears('');
    setDescription('');
    setTagsInput('');
    setLocation('');
    setLogo('');
    setMediaList([]);
    setShowAddForm(false);
  };

  const handleStartEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setEditTitle(exp.title);
    setEditCompany(exp.company);
    setEditYears(exp.years);
    setEditDescription(exp.description);
    setEditTagsInput(exp.tags.join(', '));
    setEditLocation(exp.location || '');
    setEditLogo(exp.logo || '');
    setEditMediaList(exp.media ? [...exp.media] : []);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience || !editTitle) return;

    const tags = editTagsInput.split(',').map(t => t.trim()).filter(Boolean);

    onUpdateExperience({
      ...editingExperience,
      title: editTitle,
      company: editCompany,
      years: editYears,
      description: editDescription,
      tags,
      location: editLocation,
      logo: editLogo,
      media: editMediaList
    });

    setEditingExperience(null);
  };

  return (
    <div className={`space-y-6 animate-[fade-in_0.3s_ease-out] ${isDarkMode ? 'text-[#dce3f0]' : 'text-slate-700'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>
            <History className="text-blue-500 w-6 h-6" />
            Pengalaman Kerja & Dokumentasi Kegiatan
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'}`}>
            Kelola linimasa karier lengkap beserta logo perusahaan dan foto dokumentasi kegiatan.
          </p>
        </div>
        <button
          onClick={() => {
            setMediaList([]);
            setShowAddForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/15 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengalaman
        </button>
      </div>

      {/* Render experience list in a pretty timeline look */}
      <div className="space-y-6 max-w-4xl">
        {experiences.map(exp => (
          <div key={exp.id} className={`relative pl-8 border-l pb-2 group text-left ${isDarkMode ? 'border-[#2e353f]' : 'border-slate-200'}`}>
            {/* Timeline Dot decoration */}
            <div className={`absolute left-[-6px] top-1.5 w-3 h-3 rounded-full border-2 group-hover:bg-purple-500 transition-colors ${
              isDarkMode ? 'bg-blue-500 border-[#111827]' : 'bg-blue-500 border-white'
            }`}></div>

            <div className={`border rounded-xl p-6 hover:border-blue-500/30 transition-all ${
              isDarkMode 
                ? 'bg-[#111827]/75 border-[#2e353f]' 
                : 'bg-white border-slate-200 shadow-sm shadow-slate-100/30'
            }`}>
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'border-slate-150'}`}>
                    {exp.logo ? (
                      <img src={exp.logo} alt={exp.company} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                    ) : (
                      <Building2 className={`w-6 h-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {/* 1. Nama PT / Perusahaan di PALING ATAS */}
                    <h3 className={`text-base sm:text-lg font-black tracking-tight leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {exp.company}
                    </h3>
                    {/* 2. Nama Posisi / Jabatan di BAWAH nama PT */}
                    <p className="text-xs sm:text-sm text-blue-500 font-bold">
                      {exp.title}
                    </p>
                    {/* 3. Tanggal & Lokasi LANGSUNG di bawah Posisi */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className={`inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded border text-[11px] ${
                        isDarkMode 
                          ? 'bg-[#1e2530] text-slate-300 border-[#2e353f]/50' 
                          : 'bg-slate-50 text-slate-700 border-slate-200/80'
                      }`}>
                        {exp.years}
                      </span>
                      {exp.location && (
                        <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>•</span>
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{exp.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(exp)}
                    className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Edit Pengalaman"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteExperience(exp.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Pengalaman"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className={`text-sm leading-relaxed mb-4 font-normal ${isDarkMode ? 'text-[#c2c6d6]' : 'text-slate-600'}`}>{exp.description}</p>

              {/* Photos / Media Documentation Preview Strip */}
              {exp.media && exp.media.length > 0 && (
                <div className={`mb-4 p-3.5 rounded-xl border ${
                  isDarkMode ? 'bg-[#161f2c]/70 border-[#2e353f]/60' : 'bg-slate-50/80 border-slate-200/70'
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#00c2ff] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      Foto Dokumentasi ({exp.media.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Klik untuk memperbesar</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {exp.media.map((med, idx) => (
                      <div 
                        key={med.id || idx}
                        onClick={() => setPreviewMedia({ url: med.url, caption: med.caption })}
                        className={`group/media relative rounded-lg overflow-hidden border cursor-pointer aspect-[4/3] transition-all hover:scale-[1.02] ${
                          isDarkMode ? 'border-[#2e353f] bg-slate-900' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <img 
                          src={med.url} 
                          alt={med.caption} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/media:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 p-1.5 flex flex-col justify-end">
                          <span className="text-[10px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
                            {med.caption}
                          </span>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover/media:opacity-100 transition-opacity bg-black/60 rounded p-1 text-white">
                          <Eye className="w-3 h-3 text-[#00c2ff]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`flex flex-wrap justify-between items-center gap-4 pt-3 border-t ${
                isDarkMode ? 'border-[#2e353f]/30' : 'border-slate-100'
              }`}>
                <div className="flex flex-wrap gap-1.5">
                  {exp.tags.map(t => (
                    <span key={t} className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      isDarkMode 
                        ? 'bg-blue-505/10 border-blue-500/20 text-blue-300' 
                        : 'bg-blue-50 border-blue-150 text-blue-600'
                    }`}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => handleStartEdit(exp)}
                    className={`p-1 px-3 rounded border flex items-center gap-1 cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'bg-[#1e2530] text-[#a0a5b5] hover:text-white border-[#2e353f]' 
                        : 'bg-white text-slate-600 hover:text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Edit3 className="w-3 h-3 text-[#507fff]" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteExperience(exp.id)}
                    className={`p-1 px-3 rounded border flex items-center gap-1 cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'bg-red-500/10 hover:bg-red-500/25 text-red-400 border-red-500/20' 
                        : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200/50'
                    }`}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                    Hapus
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Add Experience Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className={`border rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative animate-[scale-up_0.2s_ease-out] ${
            isDarkMode ? 'bg-[#111827] border-[#2e353f]' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-5 sm:p-6 border-b flex justify-between items-center shrink-0 ${
              isDarkMode ? 'border-[#2e353f] bg-[#0a0f16]' : 'border-slate-200 bg-slate-50/80'
            }`}>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className={`font-black text-sm uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Tambah Pengalaman & Dokumentasi
                </h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className={`transition-colors cursor-pointer ${
                isDarkMode ? 'text-[#8c909f] hover:text-white' : 'text-slate-400 hover:text-slate-600'
              }`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Posisi / Judul Pengalaman</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                  }`} 
                  placeholder="e.g. Magang di Department PPIC Delivery"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                  }`}>Perusahaan / Instansi</label>
                  <input 
                    type="text" 
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                    }`} 
                    placeholder="e.g. PT Velasto Indonesia"
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                  }`}>Periode / Durasi</label>
                  <input 
                    type="text" 
                    required
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                    }`} 
                    placeholder="e.g. Jun 2025 - Jan 2026"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Lokasi (Opsional)</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                  }`} 
                  placeholder="e.g. Purwakarta, Indonesia"
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Tags / Bidang Keahlian (Pisahkan dengan koma)</label>
                <input 
                  type="text" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                  }`} 
                  placeholder="PPIC, Delivery, Logistik, Ekspor"
                />
              </div>

              {/* Company Logo Selector */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Logo Perusahaan (Opsional)</label>
                <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center">
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleLogoUpload(e.dataTransfer.files[0], false);
                      }
                    }}
                    onClick={() => document.getElementById('logo-file-input')?.click()}
                    className={`flex-1 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center h-24 ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-500/5' 
                        : isDarkMode ? 'border-[#2e353f] hover:border-blue-500 hover:bg-[#151c25]' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      id="logo-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleLogoUpload(e.target.files[0], false);
                        }
                      }}
                    />
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span className={`text-[11px] font-bold ${isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'}`}>
                      Pilih / Seret Logo Perusahaan
                    </span>
                  </div>

                  <div className={`w-28 h-24 rounded-xl border flex items-center justify-center relative bg-white overflow-hidden shrink-0 ${
                    isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
                  }`}>
                    {logo ? (
                      <>
                        <img src={logo} alt="Preview Logo" className="max-w-full max-h-full p-2 object-contain" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogo('');
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full z-15 shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Building2 className="w-6 h-6 text-slate-350" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">NO LOGO</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Deskripsi / Poin Kontribusi Utama</label>
                <textarea 
                  rows={3} 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                  }`} 
                  placeholder="Mengelola perencanaan dan pengiriman produk agar tepat waktu sesuai jadwal..."
                ></textarea>
              </div>

              {/* MEDIA DOCUMENTATION SECTION */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isDarkMode ? 'bg-[#151c27]/70 border-[#2e353f]' : 'bg-slate-50/90 border-slate-200'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#00c2ff]" />
                    <label className={`text-xs font-black uppercase tracking-wider ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      Foto Dokumentasi Kegiatan ({mediaList.length})
                    </label>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    Bisa unggah lebih dari 1 foto dengan nama dokumentasi masing-masing
                  </span>
                </div>

                {/* Upload Trigger Area */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setMediaDragActive(true); }}
                  onDragLeave={() => setMediaDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setMediaDragActive(false);
                    if (e.dataTransfer.files) {
                      handleMediaUpload(e.dataTransfer.files, false);
                    }
                  }}
                  onClick={() => document.getElementById('media-file-input-add')?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${
                    mediaDragActive 
                      ? 'border-[#00c2ff] bg-sky-500/10' 
                      : isDarkMode 
                        ? 'border-[#2e353f] hover:border-[#00c2ff] hover:bg-[#18212e]' 
                        : 'border-slate-300 hover:border-[#00c2ff] hover:bg-white'
                  }`}
                >
                  <input 
                    id="media-file-input-add"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleMediaUpload(e.target.files, false);
                      }
                    }}
                  />
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-[#00c2ff]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                      Pilih atau Seret Foto Dokumentasi ke Sini
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mendukung format JPG, PNG, WEBP (Bisa pilih banyak sekaligus)</p>
                  </div>
                </div>

                {/* List of Attached Documentation Photos with Custom Captions */}
                {mediaList.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Daftar Dokumentasi Terpasang ({mediaList.length} Foto):
                    </span>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {mediaList.map((med, idx) => (
                        <div 
                          key={med.id || idx}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center gap-3 transition-all ${
                            isDarkMode ? 'bg-[#182230] border-[#2e353f]' : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="relative w-20 h-16 rounded-lg overflow-hidden border shrink-0 bg-slate-900 border-slate-700">
                            <img src={med.url} alt={med.caption} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                              #{idx + 1}
                            </span>
                          </div>

                          <div className="flex-1 w-full space-y-1 text-left">
                            <label className="text-[9px] font-black uppercase tracking-wider text-[#00c2ff] flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              Nama / Keterangan Foto Dokumentasi:
                            </label>
                            <input 
                              type="text"
                              required
                              value={med.caption}
                              onChange={(e) => handleUpdateCaption(med.id, e.target.value, false)}
                              placeholder="cth: Dokumentasi Rapat QCC Divisi Produksi"
                              className={`w-full rounded-lg px-3 py-1.5 text-xs font-semibold outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-[#111827] border border-[#2e353f] text-white focus:border-[#00c2ff]' 
                                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#00c2ff] focus:bg-white'
                              }`}
                            />
                          </div>

                          <button 
                            type="button"
                            onClick={() => handleRemoveMedia(med.id, false)}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                            title="Hapus foto ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-[#2e353f]/50">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2.5 border text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'border-[#2e353f] text-[#c2c6d6] hover:bg-[#1e2530]' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-105'
                  }`}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  Simpan Pengalaman & Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Experience Modal */}
      {editingExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className={`border rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative animate-[scale-up_0.2s_ease-out] ${
            isDarkMode ? 'bg-[#111827] border-[#2e353f]' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-5 sm:p-6 border-b flex justify-between items-center shrink-0 ${
              isDarkMode ? 'border-[#2e353f] bg-[#0a0f16]' : 'border-slate-200 bg-slate-50/80'
            }`}>
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                <h3 className={`font-black text-sm uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Edit Pengalaman & Dokumentasi
                </h3>
              </div>
              <button onClick={() => setEditingExperience(null)} className={`transition-colors cursor-pointer ${
                isDarkMode ? 'text-[#8c909f] hover:text-white' : 'text-slate-400 hover:text-slate-600'
              }`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Posisi / Judul Pengalaman</label>
                <input 
                  type="text" 
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                  }`} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                  }`}>Perusahaan / Instansi</label>
                  <input 
                    type="text" 
                    required
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                    }`} 
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                  }`}>Periode / Durasi</label>
                  <input 
                    type="text" 
                    required
                    value={editYears}
                    onChange={(e) => setEditYears(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                    }`} 
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Lokasi</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                  }`} 
                  placeholder="e.g. Purwakarta, Indonesia"
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Tags / Bidang Keahlian</label>
                <input 
                  type="text" 
                  value={editTagsInput}
                  onChange={(e) => setEditTagsInput(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                  }`} 
                />
              </div>

              {/* Company Logo Selector for Edit */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Logo Perusahaan (Opsional)</label>
                <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center">
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleLogoUpload(e.dataTransfer.files[0], true);
                      }
                    }}
                    onClick={() => document.getElementById('logo-file-input-edit')?.click()}
                    className={`flex-1 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center h-24 ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-500/5' 
                        : isDarkMode ? 'border-[#2e353f] hover:border-blue-500 hover:bg-[#151c25]' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      id="logo-file-input-edit"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleLogoUpload(e.target.files[0], true);
                        }
                      }}
                    />
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span className={`text-[11px] font-bold ${isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'}`}>
                      Pilih / Seret Logo Perusahaan
                    </span>
                  </div>

                  <div className={`w-28 h-24 rounded-xl border flex items-center justify-center relative bg-white overflow-hidden shrink-0 ${
                    isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
                  }`}>
                    {editLogo ? (
                      <>
                        <img src={editLogo} alt="Preview Logo" className="max-w-full max-h-full p-2 object-contain" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditLogo('');
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full z-15 shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Building2 className="w-6 h-6 text-slate-350" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">NO LOGO</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'
                }`}>Deskripsi / Poin Kontribusi Utama</label>
                <textarea 
                  rows={3} 
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                  }`} 
                ></textarea>
              </div>

              {/* MEDIA DOCUMENTATION SECTION FOR EDIT */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isDarkMode ? 'bg-[#151c27]/70 border-[#2e353f]' : 'bg-slate-50/90 border-slate-200'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#00c2ff]" />
                    <label className={`text-xs font-black uppercase tracking-wider ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      Foto Dokumentasi Kegiatan ({editMediaList.length})
                    </label>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    Bisa tambah foto baru & atur nama dokumentasi masing-masing
                  </span>
                </div>

                {/* Upload Trigger Area */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setMediaDragActive(true); }}
                  onDragLeave={() => setMediaDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setMediaDragActive(false);
                    if (e.dataTransfer.files) {
                      handleMediaUpload(e.dataTransfer.files, true);
                    }
                  }}
                  onClick={() => document.getElementById('media-file-input-edit')?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${
                    mediaDragActive 
                      ? 'border-[#00c2ff] bg-sky-500/10' 
                      : isDarkMode 
                        ? 'border-[#2e353f] hover:border-[#00c2ff] hover:bg-[#18212e]' 
                        : 'border-slate-300 hover:border-[#00c2ff] hover:bg-white'
                  }`}
                >
                  <input 
                    id="media-file-input-edit"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleMediaUpload(e.target.files, true);
                      }
                    }}
                  />
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-[#00c2ff]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                      Pilih atau Seret Foto Dokumentasi Baru ke Sini
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mendukung format JPG, PNG, WEBP (Bisa pilih banyak sekaligus)</p>
                  </div>
                </div>

                {/* List of Attached Documentation Photos with Custom Captions */}
                {editMediaList.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Daftar Dokumentasi Terpasang ({editMediaList.length} Foto):
                    </span>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {editMediaList.map((med, idx) => (
                        <div 
                          key={med.id || idx}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center gap-3 transition-all ${
                            isDarkMode ? 'bg-[#182230] border-[#2e353f]' : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="relative w-20 h-16 rounded-lg overflow-hidden border shrink-0 bg-slate-900 border-slate-700">
                            <img src={med.url} alt={med.caption} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                              #{idx + 1}
                            </span>
                          </div>

                          <div className="flex-1 w-full space-y-1 text-left">
                            <label className="text-[9px] font-black uppercase tracking-wider text-[#00c2ff] flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              Nama / Keterangan Foto Dokumentasi:
                            </label>
                            <input 
                              type="text"
                              required
                              value={med.caption}
                              onChange={(e) => handleUpdateCaption(med.id, e.target.value, true)}
                              placeholder="cth: Dokumentasi Rapat QCC Divisi Produksi"
                              className={`w-full rounded-lg px-3 py-1.5 text-xs font-semibold outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-[#111827] border border-[#2e353f] text-white focus:border-[#00c2ff]' 
                                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#00c2ff] focus:bg-white'
                              }`}
                            />
                          </div>

                          <button 
                            type="button"
                            onClick={() => handleRemoveMedia(med.id, true)}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                            title="Hapus foto ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-[#2e353f]/50">
                <button 
                  type="button" 
                  onClick={() => setEditingExperience(null)}
                  className={`px-4 py-2.5 border text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'border-[#2e353f] text-[#c2c6d6] hover:bg-[#1e2530]' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-105'
                  }`}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Media Preview Lightbox Modal */}
      {previewMedia && (
        <div 
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`max-w-2xl w-full rounded-2xl overflow-hidden border shadow-2xl ${
              isDarkMode ? 'bg-[#111827] border-[#2e353f]' : 'bg-white border-slate-200'
            }`}
          >
            <div className="relative aspect-[16/10] bg-black">
              <img src={previewMedia.url} alt={previewMedia.caption} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setPreviewMedia(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#00c2ff] block mb-1">
                Foto Dokumentasi Pengalaman
              </span>
              <h4 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {previewMedia.caption}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
